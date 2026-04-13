---
sidebar_position: 3
title: "3. Toán tử instanceof"
---

# Toán tử instanceof

Trong Java, đôi khi bạn cần kiểm tra xem một đối tượng có thuộc kiểu nào đó hay không trước khi thao tác với nó. Hãy tưởng tượng bạn nhận một bưu phẩm -- trước khi mở, bạn muốn kiểm tra xem nó là **thư**, **hộp quà** hay **kiện hàng** để xử lý đúng cách. Toán tử `instanceof` trong Java giúp bạn làm điều tương tự: **kiểm tra kiểu dữ liệu** của một đối tượng tại thời điểm chương trình đang chạy (runtime).

---

## 1. instanceof là gì?

`instanceof` là **toán tử so sánh kiểu** (type comparison operator). Nó kiểm tra xem một đối tượng có phải là thể hiện (instance) của một class, subclass hoặc interface cụ thể hay không.

### Cú pháp

```java
object instanceof ClassName
```

- Trả về `true` nếu object là thể hiện của ClassName (hoặc subclass, hoặc class implement interface đó)
- Trả về `false` nếu object không thuộc kiểu đó
- Trả về `false` nếu object là `null`

### Ví dụ đơn giản

```java
public class InstanceofDemo {
    public static void main(String[] args) {
        String text = "Hello Java";
        Integer number = 42;

        System.out.println(text instanceof String);     // true
        System.out.println(number instanceof Integer);   // true
        System.out.println(text instanceof Object);      // true (moi class deu ke thua Object)
    }
}
```

**Giải thích:** Mọi class trong Java đều kế thừa từ `Object`, nên `text instanceof Object` luôn là `true`.

---

## 2. instanceof với hệ thống kế thừa (Class Hierarchy)

Đây là trường hợp sử dụng phổ biến nhất. Khi có quan hệ cha-con giữa các class, đối tượng class con cũng là kiểu class cha.

### Hệ thống class

```
        DongVat (Cha)
        /      \
     Cho       Meo (Con)
      |
   ChoHusky (Chau)
```

### Code ví dụ

```java
class DongVat {
    String ten;

    DongVat(String ten) {
        this.ten = ten;
    }

    void an() {
        System.out.println(ten + " dang an.");
    }
}

class Cho extends DongVat {
    Cho(String ten) {
        super(ten);
    }

    void sua() {
        System.out.println(ten + " sua: Gau gau!");
    }
}

class Meo extends DongVat {
    Meo(String ten) {
        super(ten);
    }

    void keu() {
        System.out.println(ten + " keu: Meo meo!");
    }
}

class ChoHusky extends Cho {
    ChoHusky(String ten) {
        super(ten);
    }

    void hut() {
        System.out.println(ten + " hut: Awooo!");
    }
}
```

```java
public class TestInstanceof {
    public static void main(String[] args) {
        DongVat dv = new DongVat("Dong vat");
        Cho cho = new Cho("Lucky");
        Meo meo = new Meo("Miu");
        ChoHusky husky = new ChoHusky("Max");

        // Kiem tra voi chinh class cua no
        System.out.println(cho instanceof Cho);       // true
        System.out.println(meo instanceof Meo);       // true

        // Doi tuong class con CUNG LA kieu class cha
        System.out.println(cho instanceof DongVat);   // true
        System.out.println(meo instanceof DongVat);   // true
        System.out.println(husky instanceof Cho);     // true
        System.out.println(husky instanceof DongVat); // true

        // Doi tuong class cha KHONG PHAI kieu class con
        System.out.println(dv instanceof Cho);        // false
        System.out.println(dv instanceof Meo);        // false

        // Cac class anh em KHONG lien quan
        System.out.println(cho instanceof Meo);       // LOI BIEN DICH! (incompatible types)
    }
}
```

### Bảng tóm tắt kết quả

| Biểu thức | Kết quả | Giải thích |
|-----------|---------|-----------|
| `cho instanceof Cho` | `true` | Chinh la kieu Cho |
| `cho instanceof DongVat` | `true` | Cho la con cua DongVat |
| `husky instanceof DongVat` | `true` | ChoHusky la chau cua DongVat |
| `dv instanceof Cho` | `false` | DongVat KHONG phai Cho |
| `cho instanceof Meo` | Loi bien dich | Cho va Meo khong co quan he cha-con |

---

## 3. instanceof với Interface

`instanceof` cũng hoạt động với interface. Nếu một class implement interface, đối tượng của class đó sẽ trả về `true` khi kiểm tra với interface.

```java
interface BayDuoc {
    void bay();
}

interface BoiDuoc {
    void boi();
}

class Chim implements BayDuoc {
    @Override
    public void bay() {
        System.out.println("Chim dang bay.");
    }
}

class Vit implements BayDuoc, BoiDuoc {
    @Override
    public void bay() {
        System.out.println("Vit bay lach bach.");
    }

    @Override
    public void boi() {
        System.out.println("Vit dang boi.");
    }
}

class CaVang implements BoiDuoc {
    @Override
    public void boi() {
        System.out.println("Ca vang dang boi.");
    }
}
```

```java
public class TestInterface {
    public static void main(String[] args) {
        Chim chim = new Chim();
        Vit vit = new Vit();
        CaVang ca = new CaVang();

        // Kiem tra voi interface
        System.out.println(chim instanceof BayDuoc);   // true
        System.out.println(chim instanceof BoiDuoc);   // false

        System.out.println(vit instanceof BayDuoc);    // true
        System.out.println(vit instanceof BoiDuoc);    // true (Vit implement ca 2)

        System.out.println(ca instanceof BoiDuoc);     // true
        System.out.println(ca instanceof BayDuoc);     // false
    }
}
```

### Ứng dụng thực tế: Xử lý theo khả năng

```java
public class XuLyDongVat {
    static void xuLy(Object obj) {
        if (obj instanceof BayDuoc) {
            BayDuoc b = (BayDuoc) obj;
            b.bay();
        }
        if (obj instanceof BoiDuoc) {
            BoiDuoc b = (BoiDuoc) obj;
            b.boi();
        }
    }

    public static void main(String[] args) {
        xuLy(new Chim());    // Chim dang bay.
        System.out.println("---");
        xuLy(new Vit());     // Vit bay lach bach.  +  Vit dang boi.
        System.out.println("---");
        xuLy(new CaVang());  // Ca vang dang boi.
    }
}
```

---

## 4. instanceof với null

Đây là quy tắc quan trọng: **`null instanceof BatKyClass` luôn trả về `false`**.

```java
public class TestNull {
    public static void main(String[] args) {
        String text = null;
        DongVat dv = null;
        Object obj = null;

        System.out.println(text instanceof String);    // false
        System.out.println(dv instanceof DongVat);     // false
        System.out.println(obj instanceof Object);     // false
        System.out.println(null instanceof Object);    // false
    }
}
```

**Tai sao?** Vì `null` không trỏ đến bất kỳ object nào. Không có object nào tồn tại, nên không thể kiểm tra kiểu.

### Ứng dụng: instanceof thay thế null check

```java
// Cach truyen thong: kiem tra null rieng
void xuLy(Object obj) {
    if (obj != null && obj instanceof String) {
        // xu ly String
    }
}

// Cach tot hon: instanceof da bao gom null check
void xuLy(Object obj) {
    if (obj instanceof String) {
        // Tu dong false neu obj la null, khong can kiem tra rieng
        String str = (String) obj;
        System.out.println("Do dai: " + str.length());
    }
}
```

---

## 5. Downcasting an toàn với instanceof

**Downcasting** là ép kiểu từ class cha xuống class con. Đây là thao tác nguy hiểm nếu không kiểm tra trước.

### Khong co instanceof: ClassCastException

```java
class DongVat {
    void an() { System.out.println("Dong vat an."); }
}

class Cho extends DongVat {
    void sua() { System.out.println("Gau gau!"); }
}

class Meo extends DongVat {
    void keu() { System.out.println("Meo meo!"); }
}
```

```java
public class TestDowncast {
    public static void main(String[] args) {
        DongVat dv = new Meo();

        // Downcast KHONG an toan -- ClassCastException tai runtime!
        Cho cho = (Cho) dv;  // dv thuc chat la Meo, khong the ep thanh Cho
        cho.sua();           // Khong bao gio chay den dong nay
    }
}
```

**Loi:** `java.lang.ClassCastException: Meo cannot be cast to Cho`

### Co instanceof: Downcast an toan

```java
public class TestSafeDowncast {
    static void xuLyDongVat(DongVat dv) {
        dv.an();  // Method chung, luon goi duoc

        if (dv instanceof Cho) {
            Cho cho = (Cho) dv;  // An toan vi da kiem tra
            cho.sua();
        } else if (dv instanceof Meo) {
            Meo meo = (Meo) dv;  // An toan vi da kiem tra
            meo.keu();
        } else {
            System.out.println("Dong vat khac, khong biet keu gi.");
        }
    }

    public static void main(String[] args) {
        xuLyDongVat(new Cho());   // Dong vat an.  Gau gau!
        xuLyDongVat(new Meo());   // Dong vat an.  Meo meo!
        xuLyDongVat(new DongVat()); // Dong vat an.  Dong vat khac...
    }
}
```

---

## 6. Pattern Matching instanceof (Java 16+)

Tu Java 16 tro di, ban co the ket hop `instanceof` voi khai bao bien ngay trong bieu thuc kiem tra. Day la cai tien giup code **gon va an toan hon**.

### Truoc Java 16

```java
void xuLy(Object obj) {
    if (obj instanceof String) {
        String str = (String) obj;  // Phai ep kieu rieng
        System.out.println("Do dai: " + str.length());
    }
}
```

### Tu Java 16 tro di

```java
void xuLy(Object obj) {
    if (obj instanceof String str) {  // Kiem tra + khai bao bien cung luc!
        System.out.println("Do dai: " + str.length());
        // str da duoc ep kieu tu dong, khong can (String) obj
    }
}
```

### Ví dụ thực tế với Pattern Matching

```java
public class PatternMatchingDemo {
    static String moTa(Object obj) {
        if (obj instanceof Integer i) {
            return "So nguyen: " + i + ", binh phuong = " + (i * i);
        } else if (obj instanceof String s) {
            return "Chuoi: \"" + s + "\", do dai = " + s.length();
        } else if (obj instanceof Double d) {
            return "So thuc: " + d + ", lam tron = " + Math.round(d);
        } else if (obj instanceof int[] arr) {
            return "Mang int, so phan tu = " + arr.length;
        } else {
            return "Kieu khong xac dinh: " + obj;
        }
    }

    public static void main(String[] args) {
        System.out.println(moTa(42));           // So nguyen: 42, binh phuong = 1764
        System.out.println(moTa("Java"));       // Chuoi: "Java", do dai = 4
        System.out.println(moTa(3.14));         // So thuc: 3.14, lam tron = 3
        System.out.println(moTa(new int[]{1,2,3})); // Mang int, so phan tu = 3
    }
}
```

### Kết hợp với toán tử logic

```java
// Kiem tra instanceof + dieu kien them
if (obj instanceof String s && s.length() > 5) {
    System.out.println("Chuoi dai: " + s);
}

// Luu y: KHONG dung duoc voi || (or)
// if (obj instanceof String s || s.length() > 5) { }  // LOI BIEN DICH
// Vi neu obj khong phai String, bien s chua duoc khai bao
```

---

## 7. Khi nào nên và KHÔNG nên dùng instanceof

### Nên dùng

| Tình huống | Ví dụ |
|-----------|-------|
| Downcasting an toàn | Kiểm tra trước khi ép kiểu |
| Xử lý nhiều kiểu khác nhau | Method nhận `Object` parameter |
| Kiểm tra interface | Xem object có implement interface không |
| equals() method | So sánh kiểu trước khi so sánh giá trị |

### KHÔNG nên dùng (Ưu tiên đa hình)

Nếu bạn thấy mình dùng `instanceof` quá nhiều với if-else, có thể thiết kế đang có vấn đề. **Đa hình (polymorphism)** thường là giải pháp tốt hơn.

```java
// SAI -- Dung instanceof qua nhieu (code smell)
void tinhLuong(NhanVien nv) {
    if (nv instanceof GiamDoc) {
        System.out.println("Luong GD: " + ((GiamDoc) nv).luongCoBan * 3);
    } else if (nv instanceof TruongPhong) {
        System.out.println("Luong TP: " + ((TruongPhong) nv).luongCoBan * 2);
    } else if (nv instanceof NhanVienThuong) {
        System.out.println("Luong NV: " + ((NhanVienThuong) nv).luongCoBan);
    }
}

// DUNG -- Dung da hinh (polymorphism)
abstract class NhanVien {
    double luongCoBan;

    abstract double tinhLuong();  // Moi class con tu tinh luong rieng
}

class GiamDoc extends NhanVien {
    @Override
    double tinhLuong() { return luongCoBan * 3; }
}

class TruongPhong extends NhanVien {
    @Override
    double tinhLuong() { return luongCoBan * 2; }
}

// Su dung: khong can instanceof
void inLuong(NhanVien nv) {
    System.out.println("Luong: " + nv.tinhLuong());  // Tu dong goi dung method
}
```

---

## 8. Ví dụ thực tế: Override equals()

Một trong những ứng dụng phổ biến nhất của `instanceof` là trong method `equals()`.

```java
public class SinhVien {
    private int maSV;
    private String hoTen;

    public SinhVien(int maSV, String hoTen) {
        this.maSV = maSV;
        this.hoTen = hoTen;
    }

    @Override
    public boolean equals(Object obj) {
        // Buoc 1: Kiem tra cung tham chieu
        if (this == obj) return true;

        // Buoc 2: Kiem tra null va kieu du lieu bang instanceof
        if (!(obj instanceof SinhVien)) return false;

        // Buoc 3: Ep kieu an toan (da kiem tra o buoc 2)
        SinhVien other = (SinhVien) obj;

        // Buoc 4: So sanh cac field
        return this.maSV == other.maSV;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(maSV);
    }
}
```

```java
// Voi Java 16+, gon hon:
@Override
public boolean equals(Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof SinhVien other)) return false;  // Pattern matching
    return this.maSV == other.maSV;
}
```

---

## 9. Lỗi thường gặp

### Loi 1: Downcast khong kiem tra

```java
// SAI -- ClassCastException tai runtime
void xuLy(DongVat dv) {
    Cho cho = (Cho) dv;  // Neu dv la Meo -> EXCEPTION!
    cho.sua();
}

// DUNG -- Kiem tra truoc khi downcast
void xuLy(DongVat dv) {
    if (dv instanceof Cho cho) {  // Java 16+ pattern matching
        cho.sua();
    }
}
```

### Loi 2: instanceof voi incompatible types

```java
String text = "hello";
// System.out.println(text instanceof Integer);  // LOI BIEN DICH!
// String va Integer khong co quan he ke thua

// Phai dung Object de kiem tra
Object obj = "hello";
System.out.println(obj instanceof Integer);  // false (hop le vi kieu Object)
```

### Loi 3: Quen rang null instanceof luon la false

```java
// SAI -- Kiem tra null thua
void xuLy(Object obj) {
    if (obj != null) {              // Thua! instanceof da xu ly null
        if (obj instanceof String) {
            // ...
        }
    }
}

// DUNG -- instanceof tu dong tra ve false voi null
void xuLy(Object obj) {
    if (obj instanceof String str) {
        System.out.println(str.length());  // An toan, khong NullPointerException
    }
}
```

### Loi 4: Lam dung instanceof thay vi dung da hinh

```java
// SAI -- Code smell: qua nhieu instanceof
void ve(HinhHoc hinh) {
    if (hinh instanceof HinhTron) { /* ve hinh tron */ }
    else if (hinh instanceof HinhVuong) { /* ve hinh vuong */ }
    else if (hinh instanceof HinhTamGiac) { /* ve tam giac */ }
    // Them hinh moi -> phai sua method nay!
}

// DUNG -- Dung da hinh
abstract class HinhHoc {
    abstract void ve();  // Moi class con tu ve
}

void ve(HinhHoc hinh) {
    hinh.ve();  // Tu dong goi dung method, khong can instanceof
}
```

---

## 10. Tổng kết

| Khái niệm | Mô tả |
|-----------|-------|
| `instanceof` | Toán tử kiểm tra kiểu đối tượng tại runtime |
| Kết quả | `true` hoặc `false` |
| Với `null` | Luôn trả về `false` |
| Kế thừa | Object class con cũng là kiểu class cha |
| Interface | Object class implement interface cũng trả về `true` |
| Pattern Matching (Java 16+) | `obj instanceof Type var` -- kiểm tra + ép kiểu cùng lúc |
| Best practice | Ưu tiên đa hình, chỉ dùng `instanceof` khi thực sự cần thiết |

---

## 11. Câu hỏi phỏng vấn

### Cau 1: null instanceof Object trả về gì? Tại sao?

**Tra loi:**

Trả về `false`. Vì `null` không trỏ đến bất kỳ object nào trong bộ nhớ, nên nó không phải là instance của bất kỳ class nào, kể cả `Object`. Đây là quy tắc cứng của Java Language Specification.

### Cau 2: Sự khác nhau giữa instanceof và getClass()?

**Tra loi:**

- `instanceof` kiểm tra **cả class cha và interface** (is-a relationship). Nếu B extends A, thì `new B() instanceof A` là `true`.
- `getClass()` kiểm tra **chính xác class** tạo ra object. `new B().getClass() == A.class` là `false`.

```java
class A {}
class B extends A {}

B b = new B();
System.out.println(b instanceof A);              // true
System.out.println(b.getClass() == A.class);     // false
System.out.println(b.getClass() == B.class);     // true
```

Trong `equals()`, dùng `instanceof` linh hoạt hơn (cho phép so sánh subclass). Dùng `getClass()` nghiêm ngặt hơn (chỉ cùng class mới bằng nhau).

### Cau 3: Pattern Matching instanceof trong Java 16+ khác gì phiên bản cũ?

**Tra loi:**

Pattern Matching cho phép **vừa kiểm tra kiểu vừa khai báo biến** trong cùng biểu thức, loại bỏ bước ép kiểu (cast) thủ công:

```java
// Truoc Java 16: 2 buoc
if (obj instanceof String) {
    String s = (String) obj;
    s.toUpperCase();
}

// Tu Java 16: 1 buoc
if (obj instanceof String s) {
    s.toUpperCase();  // s da duoc ep kieu tu dong
}
```

Biến `s` chỉ tồn tại trong phạm vi (scope) mà Java chắc chắn kiểu là `String`.

### Cau 4: Khi nào nên dùng instanceof, khi nào nên dùng đa hình?

**Tra loi:**

Ưu tiên **đa hình (polymorphism)** khi các class có cùng hành vi nhưng cách thực hiện khác nhau. Dùng `instanceof` khi:
- Bạn không kiểm soát được class hierarchy (ví dụ: class từ thư viện bên ngoài)
- Cần kiểm tra interface
- Override `equals()`, `hashCode()`
- Xử lý deserialization, factory pattern

Nếu thấy nhiều `if-else instanceof` liên tiếp, hãy cân nhắc refactor sang đa hình.
