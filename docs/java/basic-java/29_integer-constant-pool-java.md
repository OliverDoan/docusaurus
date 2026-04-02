---
sidebar_position: 29
title: "Integer Constant Pool"
---

# Integer Constant Pool trong Java

## Integer Constant Pool la gi?

**Integer Constant Pool** (hay Integer Cache) la co che toi uu bo nho trong Java. Thay vi tao moi mot object `Integer` moi moi khi ban dung autoboxing, Java **luu san (cache) cac doi tuong Integer** co gia tri tu **-128 den 127** trong bo nho. Khi ban su dung gia tri trong khoang nay, Java se tra ve **cung mot object** thay vi tao object moi.

Hay tuong tuong nhu mot **thu vien sach cong cong**: neu quyen sach ban can la quyen pho bien (gia tri -128 den 127), thu vien da co san mot ban -- moi nguoi deu muon chung quyen do. Nhung neu ban can quyen sach hiem (gia tri ngoai khoang), thu vien phai in rieng mot ban moi cho ban.

Day la chu de **rat hay xuat hien trong phong van Java** va de gay nham lan neu khong hieu ro.

---

## 1. Co che Integer Cache hoat dong nhu the nao?

Khi ban viet:

```java
Integer a = 127;  // autoboxing: goi Integer.valueOf(127)
Integer b = 127;  // autoboxing: goi Integer.valueOf(127)
```

Java **khong goi `new Integer(127)`**. Thay vao do, no goi `Integer.valueOf(127)`, va method nay se:

1. Kiem tra xem gia tri `127` co nam trong khoang **-128 den 127** khong.
2. Neu **co** -- tra ve object da duoc cache san.
3. Neu **khong** -- tao object `Integer` moi.

Hay xem source code that cua `Integer.valueOf()`:

```java
// Source code ben trong JDK (don gian hoa)
public static Integer valueOf(int i) {
    if (i >= -128 && i <= 127) {
        return IntegerCache.cache[i + 128]; // Tra ve object da cache
    }
    return new Integer(i); // Tao object moi
}
```

---

## 2. Demo: == cho Integer 127 vs 128

Day la vi du kinh dien trong phong van Java:

```java
public class IntegerCacheDemo {
    public static void main(String[] args) {
        // === Truong hop 1: Gia tri trong khoang cache (-128 den 127) ===
        Integer a = 127;
        Integer b = 127;

        System.out.println("a == b: " + (a == b));           // true
        System.out.println("a.equals(b): " + a.equals(b));   // true

        // === Truong hop 2: Gia tri NGOAI khoang cache ===
        Integer x = 128;
        Integer y = 128;

        System.out.println("x == y: " + (x == y));           // false (!)
        System.out.println("x.equals(y): " + x.equals(y));   // true

        // === Truong hop 3: Dung new Integer (luon tao object moi) ===
        Integer m = new Integer(127); // deprecated tu Java 9, nhung van chay
        Integer n = new Integer(127);

        System.out.println("m == n: " + (m == n));           // false
        System.out.println("m.equals(n): " + m.equals(n));   // true

        // === Truong hop 4: So sanh Integer voi int (unboxing) ===
        Integer p = 128;
        int q = 128;

        System.out.println("p == q: " + (p == q));           // true (unboxing)
    }
}
```

**Giai thich ket qua:**

| Bieu thuc | Ket qua | Ly do |
|-----------|---------|-------|
| `a == b` (127) | `true` | Ca hai tro cung object trong cache |
| `x == y` (128) | `false` | 128 ngoai cache, tao 2 object khac nhau |
| `m == n` (new) | `false` | `new` luon tao object moi, khong dung cache |
| `p == q` (Integer vs int) | `true` | `p` duoc unbox thanh `int`, so sanh gia tri |

---

## 3. Tai sao Java lam vay?

### Ly do ve performance va memory

- Cac gia tri nho (-128 den 127) duoc su dung **rat thuong xuyen** trong lap trinh (index mang, dem, co dieu kien...).
- Thay vi tao hang ngan object `Integer` giong nhau, Java **tao san mot lan** va tai su dung.
- Tiet kiem **bo nho heap** va giam ap luc **garbage collection**.

### Tai sao lai la -128 den 127?

- Khoang nay trung voi pham vi cua kieu `byte` (-128 den 127).
- **Java Language Specification (JLS 5.1.7)** yeu cau bat buoc cache it nhat khoang nay.
- Co the mo rong upper bound bang JVM option:

```
java -XX:AutoBoxCacheMax=1000 MyApp
```

---

## 4. Tuong tu cho cac Wrapper class khac

Khong chi `Integer`, nhieu wrapper class khac cung co cache:

```java
public class OtherCacheDemo {
    public static void main(String[] args) {
        // Long: cache -128 den 127
        Long l1 = 127L;
        Long l2 = 127L;
        System.out.println("Long 127: " + (l1 == l2));   // true

        Long l3 = 128L;
        Long l4 = 128L;
        System.out.println("Long 128: " + (l3 == l4));   // false

        // Short: cache -128 den 127
        Short s1 = 100;
        Short s2 = 100;
        System.out.println("Short 100: " + (s1 == s2));  // true

        // Byte: cache toan bo -128 den 127 (dung pham vi byte)
        Byte b1 = 50;
        Byte b2 = 50;
        System.out.println("Byte 50: " + (b1 == b2));    // true

        // Character: cache 0 den 127
        Character c1 = 'A';  // 65
        Character c2 = 'A';
        System.out.println("Char A: " + (c1 == c2));     // true

        // Boolean: chi co 2 gia tri, luon cache
        Boolean bool1 = true;
        Boolean bool2 = true;
        System.out.println("Boolean: " + (bool1 == bool2)); // true

        // Float va Double: KHONG co cache
        Double d1 = 1.0;
        Double d2 = 1.0;
        System.out.println("Double: " + (d1 == d2));     // false
    }
}
```

**Bang tom tat cache:**

| Wrapper class | Khoang cache | Ghi chu |
|---------------|-------------|---------|
| `Integer` | -128 den 127 | Co the mo rong bang JVM option |
| `Long` | -128 den 127 | Khong the mo rong |
| `Short` | -128 den 127 | Khong the mo rong |
| `Byte` | -128 den 127 | Toan bo pham vi byte |
| `Character` | 0 den 127 | Ky tu ASCII co ban |
| `Boolean` | `true`, `false` | Chi 2 gia tri, luon cache |
| `Float` | Khong cache | |
| `Double` | Khong cache | |

---

## 5. Integer.valueOf() vs new Integer()

```java
public class ValueOfVsNew {
    public static void main(String[] args) {
        // valueOf(): su dung cache (nen dung)
        Integer a = Integer.valueOf(100);
        Integer b = Integer.valueOf(100);
        System.out.println("valueOf: " + (a == b));  // true (cung object tu cache)

        // new Integer(): luon tao object moi (KHONG nen dung)
        Integer c = new Integer(100);  // Deprecated tu Java 9
        Integer d = new Integer(100);
        System.out.println("new: " + (c == d));      // false (2 object khac nhau)

        // Autoboxing su dung valueOf() phia sau
        Integer e = 100;  // tuong duong Integer.valueOf(100)
        System.out.println("autobox: " + (a == e));  // true
    }
}
```

**Ket luan:** Luon dung `Integer.valueOf()` hoac autoboxing. **Khong bao gio dung `new Integer()`** (da deprecated tu Java 9).

---

## Khi nao dung?

| Tinh huong | Loi khuyen |
|------------|-----------|
| So sanh 2 gia tri Integer | **Luon dung `equals()`**, khong dung `==` |
| Tao Integer tu gia tri | Dung `Integer.valueOf()` hoac autoboxing |
| Can so sanh tham chieu (hiem khi can) | Hieu ro cache range truoc khi dung `==` |
| Viet code co nhieu gia tri Integer nho | Yen tam, Java da toi uu bang cache |

**Best practices:**
- **Luon dung `equals()`** khi so sanh wrapper objects.
- Uu tien dung kieu `int` (primitive) khi khong can null.
- Tranh `new Integer()` -- da deprecated.
- Khi lam viec voi collection (`List<Integer>`), hieu rang autoboxing dang su dung `valueOf()`.

---

## Loi thuong gap

### Loi 1: Dung == de so sanh Integer

```java
// ❌ Sai: Dung == cho Integer object
Integer price1 = 500;
Integer price2 = 500;
if (price1 == price2) {  // false! Vi 500 ngoai cache
    System.out.println("Bang nhau");
}
```

```java
// ✅ Dung: Dung equals()
Integer price1 = 500;
Integer price2 = 500;
if (price1.equals(price2)) {  // true
    System.out.println("Bang nhau");
}
```

### Loi 2: Nghi rang == luon sai cho Integer

```java
// ❌ Hieu nham: "== luon tra ve false cho Integer"
Integer a = 50;
Integer b = 50;
System.out.println(a == b);  // true! Vi 50 nam trong cache

// Ket qua phu thuoc vao GIA TRI, khong phai luc nao cung false
```

### Loi 3: Khong hieu su khac biet giua Integer va int khi dung ==

```java
// ❌ Nham lan
Integer a = 200;
int b = 200;
System.out.println(a == b);  // true (a duoc unbox thanh int)

Integer x = 200;
Integer y = 200;
System.out.println(x == y);  // false (so sanh tham chieu)
```

```java
// ✅ Hieu dung: Khi so sanh Integer voi int, Java unbox Integer thanh int
// Khi so sanh Integer voi Integer, Java so sanh tham chieu (reference)
```

### Loi 4: Dung new Integer() thay vi valueOf()

```java
// ❌ Sai: Tao object moi khong can thiet
Integer a = new Integer(10);  // Deprecated, luon tao object moi

// ✅ Dung: De Java su dung cache
Integer a = Integer.valueOf(10);  // Hoac don gian: Integer a = 10;
```

---

## Cau hoi phong van

### Cau 1: Integer a = 127, b = 127. a == b tra ve gi? Tai sao?

**Tra loi:** Tra ve `true`. Khi autoboxing, Java goi `Integer.valueOf(127)`. Vi 127 nam trong khoang cache (-128 den 127), ca `a` va `b` deu tro den **cung mot object** trong Integer Cache. Toan tu `==` so sanh tham chieu, va vi cung tham chieu nen tra ve `true`.

### Cau 2: Integer a = 128, b = 128. a == b tra ve gi? Tai sao?

**Tra loi:** Tra ve `false`. Gia tri 128 nam **ngoai khoang cache** (-128 den 127). Do do, `Integer.valueOf(128)` tao **2 object Integer khac nhau** tren heap. Toan tu `==` so sanh tham chieu, 2 object khac nhau nen tra ve `false`. De so sanh gia tri, phai dung `a.equals(b)` (tra ve `true`).

### Cau 3: Integer.valueOf(10) khac gi new Integer(10)?

**Tra loi:**
- `Integer.valueOf(10)`: Kiem tra cache truoc. Neu gia tri nam trong khoang -128 den 127, tra ve object da cache. Neu ngoai khoang, tao object moi. **Tiet kiem bo nho.**
- `new Integer(10)`: **Luon tao object moi** tren heap, khong bao gio dung cache. Da **deprecated tu Java 9** vi lang phi bo nho.
- **Nen dung:** `Integer.valueOf()` hoac autoboxing (`Integer a = 10`).

### Cau 4: Tai sao Java chi cache -128 den 127?

**Tra loi:** Theo Java Language Specification (JLS 5.1.7), JVM bat buoc phai cache cac gia tri Integer trong khoang -128 den 127. Ly do:
- Khoang nay trung voi pham vi kieu `byte`, la nhung gia tri **duoc su dung thuong xuyen nhat** (index, bien dem, flag...).
- Cache giup **giam so luong object** tren heap, giam ap luc garbage collection.
- Co the tang upper bound bang JVM option `-XX:AutoBoxCacheMax=N`, nhung **khong the giam lower bound** (-128).

### Cau 5: Lam sao de so sanh 2 Integer an toan?

**Tra loi:** Co 3 cach:
1. **Dung `equals()`**: `a.equals(b)` -- cach chuan nhat.
2. **Unbox ve `int`**: `a.intValue() == b.intValue()` -- so sanh primitive.
3. **Dung `Integer.compare()`**: `Integer.compare(a, b) == 0` -- an toan voi null-safe wrapper.

**Khong bao gio dung `==`** de so sanh gia tri cua 2 Integer object, vi ket qua phu thuoc vao cache va khong nhat quan.
