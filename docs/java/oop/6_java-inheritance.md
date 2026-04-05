---
sidebar_position: 6
title: "Tính kế thừa (Inheritance)"
---

# Tính kế thừa (Inheritance)

## Ví dụ thực tế để hiểu kế thừa

Hãy tưởng tượng bạn là con trong một gia đình. Bạn **thừa hưởng** rất nhiều thứ từ bố mẹ: màu mắt, nhóm máu, chiều cao tiềm năng, thậm chí cả tính cách. Nhưng bạn cũng có những đặc điểm riêng mà bố mẹ không có -- có thể bạn giỏi vẽ hơn, hoặc bạn chơi guitar.

Trong lập trình Java, **kế thừa (Inheritance)** hoạt động y hệt vậy:
- **Lớp cha (Parent/Superclass)** giống như bố mẹ -- chứa các thuộc tính và hành vi chung.
- **Lớp con (Child/Subclass)** giống như con cái -- thừa hưởng mọi thứ từ lớp cha, đồng thời có thể thêm hoặc thay đổi hành vi riêng.

Một ví dụ khác: mọi **Xe hơi**, **Xe máy**, **Xe tải** đều là **Phương tiện giao thông**. Chúng đều có chung thuộc tính như `tốcĐộ`, `màuSắc`, và hành vi `chạy()`, `dừng()`. Thay vì viết lại code cho từng loại xe, ta tạo một lớp `PhuongTien` chung rồi cho các loại xe kế thừa.

---

## Kế thừa là gì?

**Kế thừa (Inheritance)** là một trong bốn tính chất cơ bản của OOP, cho phép một lớp con **thừa hưởng** các thuộc tính (fields) và phương thức (methods) từ lớp cha.

Java sử dụng từ khóa `extends` để thể hiện kế thừa:

```java
class LopCha {
    // thuộc tính và phương thức
}

class LopCon extends LopCha {
    // kế thừa mọi thứ từ LopCha
    // có thể thêm thuộc tính/phương thức mới
}
```

### Lớp con nhận được gì từ lớp cha?

| Thành phần | Lớp con có truy cập được không? |
|---|---|
| `public` fields/methods | Co -- truy cap truc tiep |
| `protected` fields/methods | Co -- truy cap truc tiep |
| `default` (package-private) | Chi khi cung package |
| `private` fields/methods | Khong -- phai dung getter/setter |
| Constructor | Khong ke thua -- nhung goi duoc qua `super()` |

### Ví dụ đầu tiên

```java
public class DongVat {
    protected String ten;
    protected int tuoi;

    public void an() {
        System.out.println(ten + " đang ăn...");
    }

    public void ngu() {
        System.out.println(ten + " đang ngủ...");
    }
}

public class Cho extends DongVat {
    private String giong; // thuộc tính riêng của Cho

    public Cho(String ten, int tuoi, String giong) {
        this.ten = ten;     // kế thừa từ DongVat
        this.tuoi = tuoi;   // kế thừa từ DongVat
        this.giong = giong; // riêng của Cho
    }

    public void sua() {
        System.out.println(ten + " đang sủa: Gâu gâu!");
    }
}

public class Main {
    public static void main(String[] args) {
        Cho cho = new Cho("Buddy", 3, "Golden Retriever");

        // Phương thức kế thừa từ DongVat
        cho.an();   // Buddy đang ăn...
        cho.ngu();  // Buddy đang ngủ...

        // Phương thức riêng của Cho
        cho.sua();  // Buddy đang sủa: Gâu gâu!
    }
}
```

Lớp `Cho` không cần viết lại `an()` và `ngu()` -- nó tự động có sẵn nhờ kế thừa từ `DongVat`. Đây chính là sức mạnh của **tái sử dụng code (code reuse)**.

---

## Các kiểu kế thừa trong Java

### 1. Kế thừa đơn (Single Inheritance)

Một lớp con kế thừa từ **một** lớp cha duy nhất. Đây là dạng phổ biến nhất.

```java
class PhuongTien {
    protected int tocDo;

    public void chay() {
        System.out.println("Phương tiện đang chạy với tốc độ " + tocDo + " km/h");
    }
}

class XeHoi extends PhuongTien {
    private int soGhe;

    public XeHoi(int tocDo, int soGhe) {
        this.tocDo = tocDo;
        this.soGhe = soGhe;
    }

    public void batDieuHoa() {
        System.out.println("Bật điều hòa xe hơi (có " + soGhe + " ghế)");
    }
}

public class Main {
    public static void main(String[] args) {
        XeHoi xe = new XeHoi(120, 5);
        xe.chay();          // Phương tiện đang chạy với tốc độ 120 km/h
        xe.batDieuHoa();    // Bật điều hòa xe hơi (có 5 ghế)
    }
}
```

### 2. Kế thừa nhiều cấp (Multilevel Inheritance)

Lớp A -> Lớp B -> Lớp C. Lớp C kế thừa cả B lẫn A (gián tiếp).

Giống như: Ông bà -> Bố mẹ -> Con cái. Con cái thừa hưởng đặc điểm từ cả bố mẹ lẫn ông bà.

```java
class SinhVat {
    public void thoHit() {
        System.out.println("Sinh vật đang thở...");
    }
}

class DongVat extends SinhVat {
    public void diChuyen() {
        System.out.println("Động vật đang di chuyển...");
    }
}

class Cho extends DongVat {
    public void sua() {
        System.out.println("Chó đang sủa: Gâu gâu!");
    }
}

public class Main {
    public static void main(String[] args) {
        Cho cho = new Cho();
        cho.thoHit();     // Kế thừa từ SinhVat (ông)
        cho.diChuyen();   // Kế thừa từ DongVat (cha)
        cho.sua();        // Riêng của Cho (con)
    }
}
```

Lớp `Cho` có cả 3 phương thức: `thoHit()` từ `SinhVat`, `diChuyen()` từ `DongVat`, và `sua()` riêng của mình.

### 3. Kế thừa phân cấp (Hierarchical Inheritance)

Nhiều lớp con cùng kế thừa từ **một** lớp cha. Giống như một người mẹ có nhiều đứa con -- mỗi đứa thừa hưởng đặc điểm chung của mẹ nhưng cũng có nét riêng.

```java
class HinhHoc {
    protected String mau;

    public HinhHoc(String mau) {
        this.mau = mau;
    }

    public void hienThiMau() {
        System.out.println("Màu: " + mau);
    }
}

class HinhTron extends HinhHoc {
    private double banKinh;

    public HinhTron(String mau, double banKinh) {
        super(mau);
        this.banKinh = banKinh;
    }

    public double tinhDienTich() {
        return Math.PI * banKinh * banKinh;
    }
}

class HinhChuNhat extends HinhHoc {
    private double chieuDai;
    private double chieuRong;

    public HinhChuNhat(String mau, double chieuDai, double chieuRong) {
        super(mau);
        this.chieuDai = chieuDai;
        this.chieuRong = chieuRong;
    }

    public double tinhDienTich() {
        return chieuDai * chieuRong;
    }
}

public class Main {
    public static void main(String[] args) {
        HinhTron tron = new HinhTron("Đỏ", 5.0);
        tron.hienThiMau();  // Màu: Đỏ
        System.out.println("Diện tích hình tròn: " + tron.tinhDienTich());

        HinhChuNhat cn = new HinhChuNhat("Xanh", 4.0, 6.0);
        cn.hienThiMau();    // Màu: Xanh
        System.out.println("Diện tích hình chữ nhật: " + cn.tinhDienTich());
    }
}
```

Cả `HinhTron` và `HinhChuNhat` đều kế thừa `mau` và `hienThiMau()` từ `HinhHoc`, nhưng mỗi lớp có cách tính diện tích riêng.

---

## Tại sao Java không hỗ trợ đa kế thừa (Multiple Inheritance)?

**Đa kế thừa** nghĩa là một lớp con kế thừa từ **hai hoặc nhiều** lớp cha cùng lúc. Java **không cho phép** điều này với `class` vì **Diamond Problem** (vấn đề hình thoi).

### Diamond Problem là gì?

```java
// Giả sử Java cho phép đa kế thừa (THỰC TẾ KHÔNG ĐƯỢC)
class A {
    void hienThi() {
        System.out.println("A");
    }
}

class B extends A {
    void hienThi() {
        System.out.println("B");
    }
}

class C extends A {
    void hienThi() {
        System.out.println("C");
    }
}

// Nếu D kế thừa cả B và C -- Java KHÔNG cho phép dòng này
class D extends B, C {  // LOI BIEN DICH!
    // Khi gọi d.hienThi() --> gọi của B hay C?
    // --> Mơ hồ! Đây là Diamond Problem
}
```

Hình dung: cả `B` và `C` đều override `hienThi()` từ `A`. Nếu `D` kế thừa cả hai, JVM không biết nên gọi phiên bản nào.

**Giải pháp của Java:** Dùng `interface` để đạt được hiệu quả tương tự đa kế thừa, vì interface có cơ chế giải quyết xung đột rõ ràng.

```java
interface Bay {
    default void diChuyen() {
        System.out.println("Đang bay...");
    }
}

interface Boi {
    default void diChuyen() {
        System.out.println("Đang bơi...");
    }
}

// Một class có thể implements nhiều interface
class Vit implements Bay, Boi {
    // BẮT BUỘC override để giải quyết xung đột
    @Override
    public void diChuyen() {
        System.out.println("Vịt vừa bay vừa bơi!");
    }
}
```

---

## Ghi đè phương thức (Method Overriding) với `@Override`

Khi lớp con muốn **thay đổi hành vi** của phương thức kế thừa từ lớp cha, ta sử dụng **method overriding**.

### Quy tắc overriding

1. Cùng tên phương thức
2. Cùng danh sách tham số
3. Cùng hoặc hẹp hơn kiểu trả về (covariant return)
4. Access modifier của lớp con phải bằng hoặc rộng hơn lớp cha
5. Không thể override `static`, `final`, hoặc `private` methods

```java
class DongVat {
    public void keu() {
        System.out.println("Động vật kêu...");
    }
}

class Meo extends DongVat {
    @Override  // Annotation giúp compiler kiểm tra
    public void keu() {
        System.out.println("Meo meo!");
    }
}

class Cho extends DongVat {
    @Override
    public void keu() {
        System.out.println("Gâu gâu!");
    }
}

public class Main {
    public static void main(String[] args) {
        DongVat dv1 = new Meo();
        DongVat dv2 = new Cho();

        dv1.keu();  // Meo meo!
        dv2.keu();  // Gâu gâu!
    }
}
```

Annotation `@Override` không bắt buộc về mặt cú pháp, nhưng bạn **nên luôn luôn dùng** vì nó giúp compiler phát hiện lỗi nếu bạn viết sai tên method hoặc sai tham số.

---

## Từ khóa `super`

`super` cho phép lớp con truy cập các thành phần của lớp cha. Nó có 3 công dụng chính:

### 1. Gọi constructor lớp cha

```java
class NhanVien {
    protected String ten;
    protected double luong;

    public NhanVien(String ten, double luong) {
        this.ten = ten;
        this.luong = luong;
    }
}

class QuanLy extends NhanVien {
    private int soNhanVienQuanLy;

    public QuanLy(String ten, double luong, int soNV) {
        super(ten, luong);  // Gọi constructor của NhanVien
        this.soNhanVienQuanLy = soNV;
    }

    public void hienThi() {
        System.out.println("Quản lý: " + ten
            + ", Lương: " + luong
            + ", Quản lý " + soNhanVienQuanLy + " người");
    }
}
```

Lưu ý: `super()` **phải là dòng đầu tiên** trong constructor lớp con. Nếu bạn không gọi `super()`, Java tự động gọi `super()` không tham số -- nếu lớp cha không có constructor không tham số, sẽ lỗi biên dịch.

### 2. Gọi phương thức lớp cha

```java
class DongVat {
    public void an() {
        System.out.println("Động vật đang ăn");
    }
}

class Cho extends DongVat {
    @Override
    public void an() {
        super.an();  // Gọi phương thức an() của DongVat trước
        System.out.println("Chó ăn xương");
    }
}

// Kết quả khi gọi cho.an():
// Động vật đang ăn
// Chó ăn xương
```

### 3. Truy cập thuộc tính lớp cha

```java
class ChaMe {
    protected String hoTen = "Nguyễn Văn A";
}

class ConCai extends ChaMe {
    protected String hoTen = "Nguyễn Văn B"; // ẩn thuộc tính cha

    public void hienThi() {
        System.out.println("Tên con: " + hoTen);          // Nguyễn Văn B
        System.out.println("Tên cha: " + super.hoTen);    // Nguyễn Văn A
    }
}
```

---

## Quan hệ IS-A

Kế thừa thể hiện quan hệ **IS-A** (là một). Khi nói `Cho extends DongVat`, ta nói "Cho IS-A DongVat" (Chó là một Động vật).

```java
class DongVat {}
class Cho extends DongVat {}
class ChoConCo extends Cho {}

public class Main {
    public static void main(String[] args) {
        Cho cho = new Cho();
        System.out.println(cho instanceof DongVat);     // true
        System.out.println(cho instanceof Cho);          // true

        ChoConCo conCo = new ChoConCo();
        System.out.println(conCo instanceof Cho);        // true
        System.out.println(conCo instanceof DongVat);    // true
    }
}
```

Lưu ý: quan hệ IS-A là một chiều. "Chó là Động vật" đúng, nhưng "Động vật là Chó" thì chưa chắc.

---

## Kế thừa (IS-A) vs Composition (HAS-A)

Đây là một trong những quyết định thiết kế quan trọng nhất trong OOP. Hãy xem sự khác biệt:

| Tiêu chí | Inheritance (IS-A) | Composition (HAS-A) |
|---|---|---|
| Quan hệ | "là một" (is-a) | "có một" (has-a) |
| Từ khóa | `extends` | Khai báo field |
| Liên kết | Chặt (tight coupling) | Lỏng (loose coupling) |
| Thay đổi lúc runtime | Không thể | Có thể |
| Ví dụ | Chó **là** Động vật | Xe hơi **có** Động cơ |

### Ví dụ Composition (HAS-A)

```java
// Thay vì kế thừa, ta "gắn" các thành phần vào
class DongCo {
    private int maNhLuc;

    public DongCo(int maLuc) {
        this.maNhLuc = maLuc;
    }

    public void khoi_dong() {
        System.out.println("Động cơ " + maNhLuc + " mã lực khởi động!");
    }
}

class DieuHoa {
    public void bat() {
        System.out.println("Điều hòa đã bật");
    }
}

class XeHoi {
    // Composition: XeHoi HAS-A DongCo, HAS-A DieuHoa
    private DongCo dongCo;
    private DieuHoa dieuHoa;

    public XeHoi(int maLuc) {
        this.dongCo = new DongCo(maLuc);
        this.dieuHoa = new DieuHoa();
    }

    public void khoi_dong() {
        dongCo.khoi_dong();
        dieuHoa.bat();
        System.out.println("Xe hơi sẵn sàng!");
    }
}
```

### Khi nào dùng Inheritance? Khi nào dùng Composition?

**Dùng Inheritance khi:**
- Quan hệ IS-A thực sự rõ ràng: "Mèo **là** Động vật"
- Muốn tận dụng đa hình (polymorphism)
- Lớp con là phiên bản chuyên biệt của lớp cha

**Dùng Composition khi:**
- Quan hệ HAS-A: "Xe hơi **có** Động cơ"
- Muốn kết hợp nhiều hành vi từ nhiều nguồn
- Muốn thay đổi hành vi linh hoạt lúc runtime
- Không chắc quan hệ IS-A có đúng không

Nguyên tắc vàng: **"Favor Composition over Inheritance"** (Ưu tiên Composition hơn Kế thừa). Chỉ dùng Inheritance khi quan hệ IS-A thực sự rõ ràng và ổn định.

---

## Access Modifier `protected` trong kế thừa

`protected` là access modifier được thiết kế đặc biệt cho kế thừa. Nó cho phép truy cập từ:
- Cùng class
- Cùng package
- Lớp con (kể cả khác package)

```java
package com.animals;

public class DongVat {
    private String id;          // Chỉ DongVat truy cập
    protected String ten;       // DongVat + lớp con + cùng package
    public int tuoi;            // Ai cũng truy cập
    String loai;                // Cùng package (default)
}

// File khác, KHÁC package
package com.pets;

import com.animals.DongVat;

public class Meo extends DongVat {
    public void hienThi() {
        // System.out.println(id);   // LOI! private
        System.out.println(ten);     // OK -- protected, Meo là lớp con
        System.out.println(tuoi);    // OK -- public
        // System.out.println(loai); // LOI! default, khác package
    }
}
```

---

## Lỗi thường gặp

### Lỗi 1: Quên gọi `super()` khi lớp cha không có constructor mặc định

```java
// SAI
class ChaMe {
    private String ten;
    public ChaMe(String ten) { // Không có constructor không tham số
        this.ten = ten;
    }
}

class ConCai extends ChaMe {
    // LOI BIEN DICH! Java tự gọi super() nhưng ChaMe
    // không có constructor không tham số
    public ConCai() {
        // super() được gọi ngầm --> LỖI
    }
}

// DUNG
class ConCai extends ChaMe {
    public ConCai() {
        super("Tên mặc định"); // Phải gọi super() tường minh
    }
}
```

### Lỗi 2: Cố override phương thức `static`

```java
// SAI -- Đây không phải overriding, đây là method hiding
class Cha {
    public static void chao() {
        System.out.println("Chào từ Cha");
    }
}

class Con extends Cha {
    public static void chao() { // Không có @Override được
        System.out.println("Chào từ Con");
    }
}

Cha obj = new Con();
obj.chao(); // In ra "Chào từ Cha" -- không có đa hình!
```

### Lỗi 3: Override nhưng thu hẹp access modifier

```java
// SAI
class DongVat {
    public void keu() {
        System.out.println("...");
    }
}

class Meo extends DongVat {
    @Override
    private void keu() {  // LOI! Không thể thu hẹp từ public thành private
        System.out.println("Meo meo");
    }
}

// DUNG -- Access modifier phải bằng hoặc rộng hơn
class Meo extends DongVat {
    @Override
    public void keu() {  // OK -- giữ nguyên public
        System.out.println("Meo meo");
    }
}
```

### Lỗi 4: Lạm dụng kế thừa khi nên dùng Composition

```java
// SAI -- Stack không phải là Vector!
class Stack extends Vector {
    // Người dùng có thể gọi tất cả method của Vector
    // như insertElementAt(), removeElementAt()
    // --> phá vỡ logic LIFO của Stack
}

// DUNG -- Stack có (has-a) một cấu trúc lưu trữ bên trong
class Stack<T> {
    private List<T> elements = new ArrayList<>();

    public void push(T item) {
        elements.add(item);
    }

    public T pop() {
        if (elements.isEmpty()) {
            throw new EmptyStackException();
        }
        return elements.remove(elements.size() - 1);
    }
}
```

---

## Tổng kết

| Khái niệm | Mô tả |
|---|---|
| `extends` | Từ khóa khai báo kế thừa |
| Single Inheritance | 1 lớp con kế thừa 1 lớp cha |
| Multilevel Inheritance | Kế thừa nhiều cấp: A -> B -> C |
| Hierarchical Inheritance | Nhiều lớp con cùng 1 lớp cha |
| Multiple Inheritance | Khong ho tro voi class (Diamond Problem) |
| `@Override` | Ghi de phuong thuc lop cha |
| `super` | Truy cap thanh phan lop cha |
| IS-A | Quan he ke thua |
| HAS-A | Quan he Composition |
| `protected` | Access modifier danh cho ke thua |

---

## Cau hoi phong van

### Cau 1: Su khac biet giua `extends` va `implements` la gi?

**Tra loi:**

`extends` dung de ke thua tu mot class (chi duoc 1 class). `implements` dung de trien khai interface (duoc nhieu interface).

```java
// extends: kế thừa class
class Cho extends DongVat {
    // kế thừa fields + methods của DongVat
}

// implements: triển khai interface
class Cho implements Runnable, Serializable {
    // phải implement tất cả abstract methods
    @Override
    public void run() { }
}

// Kết hợp cả hai
class Cho extends DongVat implements Runnable {
    @Override
    public void run() { }
}
```

### Cau 2: Tai sao Java khong cho phep da ke thua voi class?

**Tra loi:**

De tranh **Diamond Problem**. Khi hai lop cha co phuong thuc cung ten, lop con khong biet nen goi phuong thuc nao. Java giai quyet bang cach cho phep `implements` nhieu interface -- neu co xung dot default method, lop con bat buoc phai override de giai quyet.

```java
interface A {
    default void hello() { System.out.println("A"); }
}

interface B {
    default void hello() { System.out.println("B"); }
}

// Phải override để giải quyết xung đột
class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // Chọn gọi version của A
    }
}
```

### Cau 3: Constructor co duoc ke thua khong?

**Tra loi:**

**Khong.** Constructor khong duoc ke thua. Tuy nhien, lop con co the goi constructor lop cha bang `super()`. Neu lop con khong goi `super()` tuong minh, Java tu dong chen `super()` khong tham so. Neu lop cha khong co constructor khong tham so, se loi bien dich.

```java
class Cha {
    public Cha(String msg) {
        System.out.println("Constructor Cha: " + msg);
    }
}

class Con extends Cha {
    public Con() {
        super("Xin chao"); // BAT BUOC vi Cha khong co constructor khong tham so
        System.out.println("Constructor Con");
    }
}

// new Con() in ra:
// Constructor Cha: Xin chao
// Constructor Con
```

### Cau 4: Khi nao nen dung Inheritance, khi nao nen dung Composition?

**Tra loi:**

- **Inheritance** khi co quan he IS-A ro rang va on dinh (vd: `Cho` IS-A `DongVat`).
- **Composition** khi co quan he HAS-A (vd: `XeHoi` HAS-A `DongCo`), hoac khi muon linh hoat thay doi hanh vi luc runtime.
- Nguyen tac: **"Favor Composition over Inheritance"** -- uu tien Composition vi no tao ra code it rang buoc hon, de bao tri hon.

### Cau 5: `super` va `this` khac nhau nhu the nao?

**Tra loi:**

| `this` | `super` |
|---|---|
| Tham chieu den doi tuong hien tai | Tham chieu den lop cha |
| Goi constructor cung lop: `this()` | Goi constructor lop cha: `super()` |
| Truy cap member cua lop hien tai | Truy cap member cua lop cha |
| Dung de phan biet field va parameter | Dung khi lop con an (shadow) field lop cha |

```java
class Cha {
    protected int x = 10;
}

class Con extends Cha {
    protected int x = 20;

    public void hienThi() {
        System.out.println("this.x = " + this.x);    // 20 (của Con)
        System.out.println("super.x = " + super.x);  // 10 (của Cha)
    }
}
```
