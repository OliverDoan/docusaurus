---
sidebar_position: 17
title: "String, StringBuffer & StringBuilder"
---
# String, StringBuffer & StringBuilder

## 1. Gioi thieu

Trong Java, **chuoi (String)** la mot trong nhung kieu du lieu duoc su dung **thuong xuyen nhat**. Hau nhu moi chuong trinh Java deu lam viec voi chuoi: ten nguoi dung, dia chi email, noi dung tin nhan, URL, JSON...

Java cung cap **3 lop chinh** de xu ly chuoi:
- **`String`** - Bat bien (immutable)
- **`StringBuffer`** - Thay doi duoc (mutable), an toan luong (thread-safe)
- **`StringBuilder`** - Thay doi duoc (mutable), nhanh nhat nhung khong an toan luong

**Tai sao can hieu su khac biet?** Viec chon sai lop chuoi co the dan den: code **cham gap hang tram lan** (noi String trong vong lap), **loi an** trong ung dung da luong, hoac **lang phi bo nho**. Day cung la **cau hoi phong van rat pho bien**.

Hay hinh dung:
- **String** giong nhu **but bi**: viet xong khong the xoa, muon sua phai lay to giay moi
- **StringBuffer** giong nhu **bang trang co khoa**: nhieu nguoi co the viet nhung phai **doi luot** (thread-safe)
- **StringBuilder** giong nhu **bang trang ca nhan**: chi mot nguoi viet, **nhanh nhat** vi khong can doi

---

## Noi dung

1. [Gioi thieu](#1-gioi-thieu)
2. [Lop String - Bat bien (Immutable)](#2-lop-string---bat-bien-immutable)
3. [String Pool](#3-string-pool)
4. [Tao String: literal vs new](#4-tao-string-literal-vs-new)
5. [Lop StringBuffer - Mutable & Thread-safe](#5-lop-stringbuffer---mutable--thread-safe)
6. [Lop StringBuilder - Mutable & Nhanh nhat](#6-lop-stringbuilder---mutable--nhanh-nhat)
7. [Bang so sanh String - StringBuffer - StringBuilder](#7-bang-so-sanh-string---stringbuffer---stringbuilder)
8. [Cac method pho bien](#8-cac-method-pho-bien)
9. [So sanh hieu nang (Benchmark)](#9-so-sanh-hieu-nang-benchmark)
10. [Khi nao dung?](#10-khi-nao-dung)
11. [Loi thuong gap](#11-loi-thuong-gap)
12. [Cau hoi phong van](#12-cau-hoi-phong-van)

---

## 2. Lop String - Bat bien (Immutable)

### 2.1 String la immutable

Trong Java, **String la bat bien (immutable)**: mot khi da tao, **noi dung cua no khong the thay doi**. Moi thao tac "thay doi" tren String thuc chat la **tao ra mot doi tuong String moi**.

```java
public class StringImmutableDemo {
    public static void main(String[] args) {
        String s1 = "Hello";
        String s2 = s1; // s2 tro cung object voi s1

        s1 = s1 + " World"; // Tao object MOI "Hello World"

        System.out.println("s1 = " + s1); // Hello World
        System.out.println("s2 = " + s2); // Hello (KHONG thay doi!)
    }
}
```

**Ket qua:**
```
s1 = Hello World
s2 = Hello
```

Khi thuc hien `s1 = s1 + " World"`:
1. Java tao object moi `"Hello World"` tren Heap
2. `s1` bay gio tro den object moi
3. Object cu `"Hello"` van ton tai, `s2` van tro den no

### 2.2 Tai sao String duoc thiet ke la immutable?

- **An toan**: nhieu bien co the tro den cung mot String (trong String Pool) ma khong so bi thay doi
- **Thread-safe**: nhieu thread doc cung String ma khong can dong bo
- **Hashcode caching**: hashcode tinh mot lan va luu lai, giup `HashMap`/`HashSet` nhanh hon
- **Bao mat**: String dung cho password, URL, class name... khong bi thay doi ngam

---

## 3. String Pool

**String Pool** (hay String Constant Pool) la mot vung bo nho dac biet trong Heap, noi Java **luu tru cac String literal** de **tai su dung**, tiet kiem bo nho.

```java
public class StringPoolDemo {
    public static void main(String[] args) {
        String s1 = "Java"; // Tao trong String Pool
        String s2 = "Java"; // Tai su dung tu String Pool

        String s3 = new String("Java"); // Tao object MOI tren Heap (NGOAI Pool)

        System.out.println(s1 == s2);      // true  (cung tham chieu trong Pool)
        System.out.println(s1 == s3);      // false (khac tham chieu)
        System.out.println(s1.equals(s3)); // true  (cung noi dung)

        // intern(): dua String vao Pool
        String s4 = s3.intern();
        System.out.println(s1 == s4);      // true  (s4 tro den String trong Pool)
    }
}
```

**Ket qua:**
```
true
false
true
true
```

**Cach hoat dong:**
- Khi ban viet `String s = "Java"`, Java kiem tra Pool:
  - Neu `"Java"` **da ton tai** trong Pool -> tra ve tham chieu den no
  - Neu **chua ton tai** -> tao moi trong Pool
- Khi ban viet `new String("Java")` -> **luon tao object moi** tren Heap (ngoai Pool)

---

## 4. Tao String: literal vs new

```java
public class StringCreationDemo {
    public static void main(String[] args) {
        // Cach 1: String literal (KHUYEN DUNG)
        String a = "Hello";
        String b = "Hello";
        System.out.println("a == b: " + (a == b));           // true (cung Pool)
        System.out.println("a.equals(b): " + a.equals(b));   // true

        // Cach 2: new String (TRANH dung khi khong can thiet)
        String c = new String("Hello");
        String d = new String("Hello");
        System.out.println("c == d: " + (c == d));           // false (khac object)
        System.out.println("c.equals(d): " + c.equals(d));   // true

        System.out.println("a == c: " + (a == c));           // false
    }
}
```

**Ket qua:**
```
a == b: true
a.equals(b): true
c == d: false
c.equals(d): true
a == c: false
```

**Quy tac:**
- **`==`** so sanh **tham chieu** (dia chi bo nho)
- **`equals()`** so sanh **noi dung** chuoi
- **Luon dung `equals()`** khi so sanh noi dung String

---

## 5. Lop StringBuffer - Mutable & Thread-safe

### 5.1 Dac diem

- **Mutable**: noi dung co the thay doi ma **khong tao object moi**
- **Thread-safe**: cac method duoc **dong bo (synchronized)**, an toan khi nhieu thread cung truy cap
- **Cham hon StringBuilder** do overhead cua synchronized

```java
public class StringBufferDemo {
    public static void main(String[] args) {
        StringBuffer sb = new StringBuffer("Hello");
        System.out.println("Ban dau: " + sb);
        System.out.println("Hashcode: " + System.identityHashCode(sb));

        sb.append(" World");
        System.out.println("Sau append: " + sb);
        System.out.println("Hashcode: " + System.identityHashCode(sb));
        // Hashcode GIONG NHAU -> cung object, khong tao moi!

        sb.insert(5, ",");
        System.out.println("Sau insert: " + sb);

        sb.replace(0, 5, "Hi");
        System.out.println("Sau replace: " + sb);

        sb.delete(2, 3);
        System.out.println("Sau delete: " + sb);

        sb.reverse();
        System.out.println("Sau reverse: " + sb);
    }
}
```

**Ket qua:**
```
Ban dau: Hello
Hashcode: 1234567 (vi du)
Sau append: Hello World
Hashcode: 1234567 (GIONG!)
Sau insert: Hello, World
Sau replace: Hi, World
Sau delete: Hi World
Sau reverse: dlroW iH
```

---

## 6. Lop StringBuilder - Mutable & Nhanh nhat

### 6.1 Dac diem

- **Mutable**: giong StringBuffer
- **KHONG thread-safe**: khong co synchronized -> **nhanh hon StringBuffer**
- **Nen dung trong da so truong hop** (ung dung don luong hoac bien cuc bo)

```java
public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();

        // Xay dung chuoi trong vong lap (HIEU QUA)
        for (int i = 1; i <= 5; i++) {
            sb.append("Item ").append(i);
            if (i < 5) {
                sb.append(", ");
            }
        }

        System.out.println(sb.toString());

        // Cac method tuong tu StringBuffer
        StringBuilder sb2 = new StringBuilder("Java Programming");
        System.out.println("Length: " + sb2.length());          // 16
        System.out.println("Capacity: " + sb2.capacity());     // 33 (16 + 16 + 1)
        System.out.println("charAt(0): " + sb2.charAt(0));     // J
        System.out.println("substring(5): " + sb2.substring(5)); // Programming
    }
}
```

**Ket qua:**
```
Item 1, Item 2, Item 3, Item 4, Item 5
Length: 16
Capacity: 33
charAt(0): J
substring(5): Programming
```

---

## 7. Bang so sanh String - StringBuffer - StringBuilder

| Tieu chi | String | StringBuffer | StringBuilder |
|---------|--------|--------------|---------------|
| **Mutable** | Khong (immutable) | Co | Co |
| **Thread-safe** | Co (vi immutable) | Co (synchronized) | Khong |
| **Hieu nang** | Cham nhat (tao object moi) | Trung binh | **Nhanh nhat** |
| **Khi nao dung** | Chuoi it thay doi | Da luong can thay doi chuoi | Don luong can thay doi chuoi |
| **String Pool** | Co | Khong | Khong |
| **equals() override** | Co (so sanh noi dung) | Khong (so sanh tham chieu) | Khong (so sanh tham chieu) |
| **Ra doi tu** | Java 1.0 | Java 1.0 | Java 1.5 |

---

## 8. Cac method pho bien

### 8.1 Method cua String

```java
public class StringMethodsDemo {
    public static void main(String[] args) {
        String s = "  Hello, Java World!  ";

        // Lay thong tin
        System.out.println("length(): " + s.length());             // 22
        System.out.println("charAt(7): " + s.charAt(7));           // J
        System.out.println("indexOf('J'): " + s.indexOf('J'));     // 7
        System.out.println("lastIndexOf('o'): " + s.lastIndexOf('o')); // 17
        System.out.println("isEmpty(): " + s.isEmpty());           // false

        // Cat chuoi
        System.out.println("substring(7): " + s.substring(7));           // Java World!
        System.out.println("substring(7,11): " + s.substring(7, 11));   // Java

        // Bien doi (tra ve String MOI, khong thay doi s goc)
        System.out.println("toUpperCase(): " + s.toUpperCase());   // HELLO, JAVA WORLD!
        System.out.println("toLowerCase(): " + s.toLowerCase());   // hello, java world!
        System.out.println("trim(): '" + s.trim() + "'");          // 'Hello, Java World!'
        System.out.println("replace('o','0'): " + s.replace('o', '0'));  // Hell0, Java W0rld!

        // Tach va noi
        String csv = "apple,banana,cherry";
        String[] fruits = csv.split(",");
        for (String fruit : fruits) {
            System.out.println("  Fruit: " + fruit);
        }

        String joined = String.join(" - ", fruits);
        System.out.println("join: " + joined);    // apple - banana - cherry

        // Kiem tra
        String url = "https://www.google.com";
        System.out.println("startsWith: " + url.startsWith("https"));  // true
        System.out.println("endsWith: " + url.endsWith(".com"));       // true
        System.out.println("contains: " + url.contains("google"));     // true
    }
}
```

### 8.2 Method cua StringBuffer/StringBuilder

```java
public class BufferBuilderMethodsDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Hello");

        // Them vao
        sb.append(" World");            // Hello World
        sb.append(123);                 // Hello World123
        System.out.println("append: " + sb);

        // Chen vao
        sb.insert(5, ",");             // Hello, World123
        System.out.println("insert: " + sb);

        // Thay the
        sb.replace(13, 16, "");        // Hello, World
        System.out.println("replace: " + sb);

        // Xoa
        sb.delete(5, 6);              // Hello World
        System.out.println("delete: " + sb);

        sb.deleteCharAt(4);            // Hell World
        System.out.println("deleteCharAt: " + sb);

        // Dao nguoc
        sb.reverse();                   // dlroW lleH
        System.out.println("reverse: " + sb);

        // Thong tin
        sb.reverse(); // tra lai
        System.out.println("length: " + sb.length());
        System.out.println("capacity: " + sb.capacity());
        System.out.println("charAt(0): " + sb.charAt(0));
    }
}
```

---

## 9. So sanh hieu nang (Benchmark)

```java
public class PerformanceBenchmark {
    public static void main(String[] args) {
        int iterations = 100_000;

        // Test 1: String concatenation (CHAM)
        long start1 = System.currentTimeMillis();
        String s = "";
        for (int i = 0; i < iterations; i++) {
            s += i; // Tao object moi moi lan!
        }
        long time1 = System.currentTimeMillis() - start1;
        System.out.println("String      : " + time1 + " ms");

        // Test 2: StringBuffer (TRUNG BINH)
        long start2 = System.currentTimeMillis();
        StringBuffer sbuf = new StringBuffer();
        for (int i = 0; i < iterations; i++) {
            sbuf.append(i);
        }
        long time2 = System.currentTimeMillis() - start2;
        System.out.println("StringBuffer: " + time2 + " ms");

        // Test 3: StringBuilder (NHANH NHAT)
        long start3 = System.currentTimeMillis();
        StringBuilder sbld = new StringBuilder();
        for (int i = 0; i < iterations; i++) {
            sbld.append(i);
        }
        long time3 = System.currentTimeMillis() - start3;
        System.out.println("StringBuilder: " + time3 + " ms");
    }
}
```

**Ket qua (tham khao):**
```
String      : 4500 ms
StringBuffer: 8 ms
StringBuilder: 5 ms
```

String cham hon **gap hang tram den hang ngan lan** vi moi phep `+=` trong vong lap tao ra **doi tuong String moi**, sao chep noi dung cu sang, roi them noi dung moi. Voi 100.000 lan lap, do la 100.000 doi tuong tam thoi duoc tao va huy.

---

## 10. Khi nao dung?

### Dung String khi:
- Chuoi **it thay doi** hoac **khong thay doi** (ten, email, URL, config...)
- Can **so sanh noi dung** chuoi (`equals()`)
- Dung lam **key trong HashMap/HashSet**
- **Hang so** (constant) duoc dinh nghia san

### Dung StringBuffer khi:
- Thay doi chuoi **trong moi truong da luong** (multi-thread)
- Nhieu thread **cung doc/ghi** mot object chuoi
- **Can thread-safe** (vi du: logger dung chung giua cac thread)

### Dung StringBuilder khi:
- Thay doi chuoi **trong moi truong don luong** (da so truong hop)
- **Noi chuoi trong vong lap**
- Xay dung chuoi dong (SQL query, HTML, JSON...)
- **Bien cuc bo** trong method (khong can thread-safe)

### Best practices:
- **Mac dinh chon StringBuilder** khi can thay doi chuoi
- **Chi dung StringBuffer** khi chac chan can thread-safe
- **Khong noi String trong vong lap** bang toan tu `+`
- Dung **`equals()`** de so sanh noi dung, **khong dung `==`**
- Khi khoi tao StringBuilder, **du tinh capacity** de tranh resize:
  ```java
  StringBuilder sb = new StringBuilder(1000); // Du tinh 1000 ky tu
  ```

---

## 11. Loi thuong gap

### Loi 1: So sanh String bang `==` thay vi `equals()`

```java
// Sai: Co the cho ket qua sai
String a = new String("hello");
String b = new String("hello");
if (a == b) { // false! So sanh tham chieu
    System.out.println("Giong nhau");
}
```

```java
// Dung: Dung equals() de so sanh noi dung
String a = new String("hello");
String b = new String("hello");
if (a.equals(b)) { // true! So sanh noi dung
    System.out.println("Giong nhau");
}
```

### Loi 2: Noi String trong vong lap (cuc cham)

```java
// Sai: Moi lan tao object moi -> O(n^2)
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // CHAM!
}
```

```java
// Dung: Dung StringBuilder -> O(n)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i); // NHANH!
}
String result = sb.toString();
```

### Loi 3: Dung StringBuffer khi khong can thread-safe

```java
// Khong tot: StringBuffer co overhead synchronized khong can thiet
public String buildMessage() {
    StringBuffer sb = new StringBuffer(); // Bien cuc bo, khong can thread-safe!
    sb.append("Hello");
    sb.append(" World");
    return sb.toString();
}
```

```java
// Tot hon: StringBuilder nhanh hon cho bien cuc bo
public String buildMessage() {
    StringBuilder sb = new StringBuilder();
    sb.append("Hello");
    sb.append(" World");
    return sb.toString();
}
```

### Loi 4: Goi method tren String ma quen gan ket qua

```java
// Sai: String la immutable, method tra ve String MOI
String s = "  Hello  ";
s.trim(); // Ket qua bi bo di vi khong gan!
System.out.println("'" + s + "'"); // '  Hello  ' (van co khoang trang)
```

```java
// Dung: Gan ket qua tra ve
String s = "  Hello  ";
s = s.trim(); // Gan lai ket qua
System.out.println("'" + s + "'"); // 'Hello'
```

### Loi 5: NullPointerException khi goi method tren null String

```java
// Sai: Goi method tren null
String name = null;
if (name.equals("admin")) { // NullPointerException!
    System.out.println("Admin");
}
```

```java
// Dung: Dat hang so truoc hoac kiem tra null
String name = null;
if ("admin".equals(name)) { // An toan, tra ve false
    System.out.println("Admin");
}

// Hoac kiem tra null truoc
if (name != null && name.equals("admin")) {
    System.out.println("Admin");
}
```

---

## 12. Cau hoi phong van

### Cau 1: Tai sao String la immutable trong Java?

**Tra loi:** String duoc thiet ke la immutable vi nhieu ly do:
1. **String Pool**: Nhieu bien co the tro cung mot String trong Pool. Neu String mutable, thay doi 1 bien se anh huong tat ca bien khac.
2. **Thread-safe**: Khong can dong bo hoa khi nhieu thread doc cung String.
3. **Bao mat**: String dung cho password, URL, class name... Immutable dam bao khong bi thay doi ngam boi code khac.
4. **Hashcode caching**: Vi noi dung khong doi, hashcode chi tinh 1 lan va luu cache, giup HashMap/HashSet nhanh hon.
5. **Class loading**: JVM dung String de load class. Neu String bi thay doi, co the load sai class -> loi bao mat.

### Cau 2: String Pool la gi? Hoat dong nhu the nao?

**Tra loi:** String Pool (String Constant Pool) la **vung bo nho dac biet trong Heap** (tu Java 7, truoc do nam trong PermGen). Khi tao String bang literal (`String s = "abc"`), Java kiem tra Pool:
- Neu `"abc"` **da ton tai** -> tra ve tham chieu cu (khong tao moi)
- Neu **chua ton tai** -> tao moi trong Pool

String tao bang `new String("abc")` **luon tao object moi tren Heap** (ngoai Pool). Co the dung `intern()` de dua String vao Pool.

### Cau 3: `==` va `equals()` khac nhau nhu the nao voi String?

**Tra loi:**
- **`==`** so sanh **tham chieu** (dia chi bo nho): hai bien co tro den **cung object** khong?
- **`equals()`** so sanh **noi dung**: hai chuoi co **cung ky tu** khong?

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

a == b;      // true  (cung tham chieu trong Pool)
a == c;      // false (khac tham chieu, a trong Pool, c tren Heap)
a.equals(c); // true  (cung noi dung)
```

**Quy tac:** Luon dung `equals()` khi so sanh noi dung String.

### Cau 4: StringBuffer va StringBuilder khac nhau the nao?

**Tra loi:**

| Tieu chi | StringBuffer | StringBuilder |
|---------|--------------|---------------|
| Thread-safe | Co (synchronized) | Khong |
| Hieu nang | Cham hon | Nhanh hon |
| Ra doi | Java 1.0 | Java 1.5 |
| Khi nao dung | Da luong | Don luong |

Ca hai deu **mutable** va co **cung API** (append, insert, delete, reverse...). **StringBuilder nhanh hon** vi khong co overhead cua synchronized. Trong **99% truong hop**, dung StringBuilder la du (vi bien chuoi thuong la bien cuc bo, khong chia se giua thread).

### Cau 5: Tai sao khong nen noi String trong vong lap? Trinh bay van de hieu nang.

**Tra loi:** Moi phep `+=` tren String:
1. Tao **StringBuilder tam** (trong bytecode)
2. Copy noi dung String cu sang StringBuilder
3. Append noi dung moi
4. Goi `toString()` de tao **String moi**
5. String cu tro thanh **rac** cho GC thu gom

Voi n lan lap, do phuc tap la **O(n^2)** (vi moi lan copy chuoi ngay cang dai). Trong khi StringBuilder.append() la **O(1)** (amortized), tong la O(n).

Vi du: noi 100.000 chuoi:
- String `+=`: **vai giay** (tao 100.000 object tam)
- StringBuilder: **vai mili-giay** (1 object duy nhat)
