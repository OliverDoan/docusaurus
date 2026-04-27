---
sidebar_position: 2
title: "2. Từ khóa this, super, static và final"
---

# Từ khóa this, super, static và final

Trong Java, `this`, `super`, `static` và `final` là bốn từ khóa cực kỳ quan trọng mà bạn sẽ gặp mỗi ngày khi viết code. Mỗi từ khóa có vai trò riêng: `this` giúp bạn tham chiếu chính mình, `super` giúp gọi đến cha, `static` biến thứ gì đó thành tài sản chung, còn `final` khóa mọi thứ lại không cho thay đổi. Bài này sẽ giải thích từng từ khóa với nhiều ví dụ thực tế.

---


---

## Mục lục

- [1. Từ khóa `this`](#1-từ-khóa-this)
- [2. Từ khóa `super`](#2-từ-khóa-super)
- [3. Từ khóa `static`](#3-từ-khóa-static)
- [4. Từ khóa `final`](#4-từ-khóa-final)
- [5. Lỗi thường gặp](#5-lỗi-thường-gặp)
- [6. Tổng kết](#6-tổng-kết)
- [7. Câu hỏi phỏng vấn](#7-câu-hỏi-phỏng-vấn)

---

## 1. Từ khóa `this`

`this` là **biến tham chiếu** trỏ đến **chính object hiện tại** đang gọi method hoặc constructor.

**Ví dụ thực tế:** Khi bạn nói "Tôi tự giới thiệu **bản thân tôi**", từ "tôi" chính là `this` -- nó trỏ về chính bạn.

### 1.1. Phân biệt field và parameter

Khi tên parameter trùng tên field, Java ưu tiên parameter. Dùng `this` để chỉ rõ field.

```java
public class SinhVien {
    private String hoTen;
    private int tuoi;

    public SinhVien(String hoTen, int tuoi) {
        // Khong co this: hoTen (parameter) = hoTen (parameter) -> vo nghia!
        // this.hoTen tro den FIELD cua object
        this.hoTen = hoTen;
        this.tuoi = tuoi;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;  // this.hoTen = field, hoTen = parameter
    }
}
```

**Khong dung this (loi logic):**

```java
public SinhVien(String hoTen, int tuoi) {
    hoTen = hoTen;  // Parameter tu gan cho chinh no, field KHONG duoc gan!
    tuoi = tuoi;    // Tuong tu, field tuoi van la gia tri mac dinh (0)
}
```

### 1.2. Gọi constructor khác trong cùng class

Dùng `this()` để gọi constructor khác, **phải ở dòng đầu tiên** của constructor.

```java
public class NhanVien {
    private String hoTen;
    private String phongBan;
    private double luong;

    // Constructor 1: day du tham so
    public NhanVien(String hoTen, String phongBan, double luong) {
        this.hoTen = hoTen;
        this.phongBan = phongBan;
        this.luong = luong;
    }

    // Constructor 2: chi co ten va phong ban -> goi constructor 1
    public NhanVien(String hoTen, String phongBan) {
        this(hoTen, phongBan, 5000000);  // Luong mac dinh 5 trieu
    }

    // Constructor 3: chi co ten -> goi constructor 2
    public NhanVien(String hoTen) {
        this(hoTen, "Chua phan cong");  // Phong ban mac dinh
    }

    // Constructor 4: khong tham so -> goi constructor 3
    public NhanVien() {
        this("Chua co ten");
    }
}
```

```java
// Tat ca deu hop le:
NhanVien nv1 = new NhanVien("An", "IT", 15000000);
NhanVien nv2 = new NhanVien("Binh", "HR");       // luong = 5000000
NhanVien nv3 = new NhanVien("Chi");               // phongBan = "Chua phan cong"
NhanVien nv4 = new NhanVien();                    // hoTen = "Chua co ten"
```

### 1.3. Trả về chính object hiện tại (Method Chaining)

`this` có thể dùng làm giá trị trả về để tạo chuỗi method gọi liên tiếp.

```java
public class HoaDonBuilder {
    private String tenKhach;
    private double tongTien;
    private String ghiChu;

    public HoaDonBuilder setTenKhach(String tenKhach) {
        this.tenKhach = tenKhach;
        return this;  // Tra ve chinh object hien tai
    }

    public HoaDonBuilder setTongTien(double tongTien) {
        this.tongTien = tongTien;
        return this;
    }

    public HoaDonBuilder setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
        return this;
    }

    public void inHoaDon() {
        System.out.println("Khach: " + tenKhach);
        System.out.println("Tong: " + tongTien);
        System.out.println("Ghi chu: " + ghiChu);
    }
}
```

```java
// Method chaining -- goi lien tiep
new HoaDonBuilder()
    .setTenKhach("Nguyen Van An")
    .setTongTien(150000)
    .setGhiChu("Thanh toan online")
    .inHoaDon();
```

### 1.4. Truyền chính object hiện tại làm tham số

```java
public class SinhVien {
    private String hoTen;

    public SinhVien(String hoTen) {
        this.hoTen = hoTen;
    }

    void dangKyKhoaHoc(KhoaHoc kh) {
        kh.themSinhVien(this);  // Truyen chinh minh vao method cua KhoaHoc
    }
}

public class KhoaHoc {
    void themSinhVien(SinhVien sv) {
        System.out.println("Da them sinh vien vao khoa hoc.");
    }
}
```

---

## 2. Từ khóa `super`

`super` là **biến tham chiếu** trỏ đến **object của class cha** (parent class/superclass).

**Ví dụ thực tế:** Bạn là con (class con), bố bạn là class cha. Khi bạn nói "bố tôi làm nghề gì", bạn đang dùng `super` để truy cập thông tin của class cha.

### 2.1. Truy cập field của class cha

Khi class con có field trùng tên class cha, dùng `super` để phân biệt.

```java
class DongVat {
    String ten = "Dong vat";
    int soChan = 4;
}

class Cho extends DongVat {
    String ten = "Cho";  // Che (shadow) field cua class cha

    void inThongTin() {
        System.out.println("ten (class con): " + ten);        // Cho
        System.out.println("ten (class cha): " + super.ten);  // Dong vat
        System.out.println("so chan: " + super.soChan);        // 4 (khong bi che)
    }
}
```

```java
Cho cho = new Cho();
cho.inThongTin();
// ten (class con): Cho
// ten (class cha): Dong vat
// so chan: 4
```

### 2.2. Gọi method của class cha

Khi class con override method cua class cha, dùng `super` để gọi phiên bản gốc.

```java
class DongVat {
    void keu() {
        System.out.println("Dong vat keu...");
    }

    void an() {
        System.out.println("Dong vat dang an.");
    }
}

class Meo extends DongVat {
    @Override
    void keu() {
        super.keu();  // Goi method cua class cha truoc
        System.out.println("Meo keu: Meo meo!");
    }

    void hanhDong() {
        super.an();   // Goi method an() cua class cha
        keu();        // Goi method keu() cua class con (da override)
    }
}
```

```java
Meo meo = new Meo();
meo.keu();
// Dong vat keu...
// Meo keu: Meo meo!
```

### 2.3. Gọi constructor của class cha

Dùng `super()` để gọi constructor class cha, **phải ở dòng đầu tiên** của constructor class con.

```java
class DongVat {
    String ten;
    int tuoi;

    DongVat(String ten, int tuoi) {
        this.ten = ten;
        this.tuoi = tuoi;
        System.out.println("Constructor DongVat duoc goi");
    }
}

class Cho extends DongVat {
    String giong;

    Cho(String ten, int tuoi, String giong) {
        super(ten, tuoi);  // Goi constructor cua DongVat TRUOC
        this.giong = giong;
        System.out.println("Constructor Cho duoc goi");
    }

    void inThongTin() {
        System.out.println(ten + " - " + tuoi + " tuoi - Giong: " + giong);
    }
}
```

```java
Cho cho = new Cho("Lucky", 3, "Golden Retriever");
// Constructor DongVat duoc goi
// Constructor Cho duoc goi

cho.inThongTin();  // Lucky - 3 tuoi - Giong: Golden Retriever
```

**Luu y quan trong:** Nếu constructor class cha có tham số và bạn không gọi `super(...)`, Java sẽ báo lỗi biên dịch. Java chỉ tự thêm `super()` (không tham số) nếu class cha có default constructor.

### So sánh `this` và `super`

| Tiêu chí | `this` | `super` |
|----------|--------|---------|
| Tham chiếu đến | Object hiện tại (class đang viết) | Object của class cha |
| Truy cập field | `this.fieldName` | `super.fieldName` |
| Gọi method | `this.methodName()` | `super.methodName()` |
| Gọi constructor | `this(args)` -- constructor cùng class | `super(args)` -- constructor class cha |
| Vị trí gọi constructor | Dòng đầu tiên | Dòng đầu tiên |
| Kết hợp | Không thể dùng cùng lúc `this()` và `super()` | Không thể dùng cùng lúc `super()` và `this()` |

---

## 3. Từ khóa `static`

`static` đánh dấu một thành phần **thuộc về class**, không thuộc về bất kỳ object cụ thể nào.

**Ví dụ thực tế:** Trong một lớp học, mỗi sinh viên có tên riêng (non-static), nhưng **tên giáo viên chủ nhiệm** là chung cho cả lớp (static). Thay đổi tên giáo viên ảnh hưởng đến tất cả sinh viên.

### 3.1. Static Field (Biến tĩnh)

Static field được **chia sẻ** giữa tất cả object của class. Chỉ có một bản sao duy nhất trong bộ nhớ.

```java
public class SinhVien {
    // Static field: chung cho tat ca object
    static String truong = "Dai hoc Bach Khoa";
    static int tongSoSinhVien = 0;

    // Non-static field: rieng cho tung object
    String hoTen;
    int maSV;

    public SinhVien(String hoTen) {
        this.hoTen = hoTen;
        tongSoSinhVien++;           // Tang bo dem chung
        this.maSV = tongSoSinhVien; // Gan ma SV tu dong
    }
}
```

```java
SinhVien sv1 = new SinhVien("An");
SinhVien sv2 = new SinhVien("Binh");
SinhVien sv3 = new SinhVien("Chi");

System.out.println("Truong: " + SinhVien.truong);     // Dai hoc Bach Khoa
System.out.println("Tong SV: " + SinhVien.tongSoSinhVien);  // 3
System.out.println("Ma SV1: " + sv1.maSV);  // 1
System.out.println("Ma SV2: " + sv2.maSV);  // 2
System.out.println("Ma SV3: " + sv3.maSV);  // 3

// Thay doi truong -> anh huong tat ca
SinhVien.truong = "Dai hoc Cong nghe";
System.out.println(sv1.truong);  // Dai hoc Cong nghe (thay doi theo!)
```

### 3.2. Static Method (Phương thức tĩnh)

Static method thuộc về class, **gọi trực tiếp qua tên class** mà không cần tạo object.

```java
public class ToanHoc {
    // Static method - goi truc tiep qua ten class
    public static int cong(int a, int b) {
        return a + b;
    }

    public static int nhan(int a, int b) {
        return a * b;
    }

    public static double tinhDienTichHinhTron(double banKinh) {
        return Math.PI * banKinh * banKinh;
    }

    public static int timMax(int a, int b) {
        return (a > b) ? a : b;
    }
}
```

```java
// Goi truc tiep -- KHONG can tao object
int tong = ToanHoc.cong(5, 3);           // 8
int tich = ToanHoc.nhan(4, 6);           // 24
double dienTich = ToanHoc.tinhDienTichHinhTron(5.0);  // 78.539...
int max = ToanHoc.timMax(10, 20);        // 20
```

### 3.3. Static Block (Khối tĩnh)

Static block chạy **một lần duy nhất** khi class được load vào bộ nhớ, trước cả constructor.

```java
public class CauHinh {
    static String dbUrl;
    static String dbUser;

    // Static block -- chay khi class duoc load
    static {
        System.out.println("Dang load cau hinh...");
        dbUrl = "jdbc:mysql://localhost:3306/mydb";
        dbUser = "root";
        System.out.println("Load cau hinh xong!");
    }

    public CauHinh() {
        System.out.println("Constructor duoc goi.");
    }
}
```

```java
System.out.println("Truoc khi tao object:");
CauHinh c1 = new CauHinh();
CauHinh c2 = new CauHinh();

// Ket qua:
// Truoc khi tao object:
// Dang load cau hinh...       <-- static block chay 1 lan
// Load cau hinh xong!
// Constructor duoc goi.        <-- constructor chay moi lan new
// Constructor duoc goi.
```

### 3.4. Hạn chế của static method

```java
public class Demo {
    int x = 10;            // non-static field
    static int y = 20;     // static field

    static void staticMethod() {
        System.out.println(y);    // OK - static truy cap static
        // System.out.println(x); // LOI! static khong truy cap non-static
        // this.x = 5;            // LOI! khong dung duoc this trong static
    }

    void nonStaticMethod() {
        System.out.println(x);  // OK - non-static truy cap non-static
        System.out.println(y);  // OK - non-static truy cap static
    }
}
```

### Khi nào nên dùng static?

| Nên dùng static | Không nên dùng static |
|-----------------|----------------------|
| Hàm tiện ích (utility): `Math.abs()`, `Integer.parseInt()` | Method cần truy cập dữ liệu riêng của object |
| Hằng số dùng chung: `static final` | Field thay đổi theo từng object |
| Factory method: `List.of()`, `Map.of()` | Method phụ thuộc vào trạng thái object |
| Bộ đếm, cấu hình dùng chung | Logic nghiệp vụ phức tạp |

---

## 4. Từ khóa `final`

`final` có nghĩa là **"cuối cùng, không thể thay đổi"**. Nó có thể áp dụng cho biến, method và class.

**Ví dụ thực tế:** `final` giống như **khắc chữ lên đá** -- một khi đã khắc, không thể xóa hay sửa.

### 4.1. Final Variable (Biến hằng)

Giá trị của biến `final` **chỉ được gán một lần**, sau đó không thể thay đổi.

```java
public class HangSo {
    // Hang so - thường dùng static final + UPPER_CASE
    static final double PI = 3.14159265358979;
    static final int SO_NGAY_TRONG_TUAN = 7;
    static final String TEN_CONG_TY = "FPT Software";

    public static void main(String[] args) {
        System.out.println("PI = " + PI);
        System.out.println("So ngay/tuan = " + SO_NGAY_TRONG_TUAN);

        // PI = 3.14;  // LOI BIEN DICH! Khong the thay doi gia tri final
    }
}
```

**Final voi object tham chieu:**

```java
final StringBuilder sb = new StringBuilder("Hello");
sb.append(" World");  // OK! Noi dung object co the thay doi
System.out.println(sb);  // Hello World

// sb = new StringBuilder("New");  // LOI! Khong the tro sang object khac
```

**Luu y quan trong:** `final` khoa **tham chieu** (dia chi), khong khoa **noi dung** ben trong object.

### 4.2. Final Method (Phương thức không thể override)

Method được đánh dấu `final` **không thể bị class con ghi đè** (override).

```java
class TaiKhoanNganHang {
    private double soDu;

    public TaiKhoanNganHang(double soDu) {
        this.soDu = soDu;
    }

    // final method -- khong cho phep class con override
    public final double tinhPhi() {
        return soDu * 0.01;  // Phi 1% -- KHONG duoc thay doi cong thuc
    }

    // Method binh thuong -- class con co the override
    public double tinhLaiSuat() {
        return soDu * 0.05;
    }
}

class TaiKhoanVIP extends TaiKhoanNganHang {
    public TaiKhoanVIP(double soDu) {
        super(soDu);
    }

    // LOI BIEN DICH! Khong the override final method
    // public final double tinhPhi() { return 0; }

    // OK - method binh thuong co the override
    @Override
    public double tinhLaiSuat() {
        return super.tinhLaiSuat() * 1.5;  // VIP duoc lai suat cao hon
    }
}
```

### 4.3. Final Class (Lớp không thể kế thừa)

Class được đánh dấu `final` **không thể có class con**.

```java
// final class -- khong ai co the extends
public final class TienTe {
    private final String maTienTe;
    private final double giaTri;

    public TienTe(String maTienTe, double giaTri) {
        this.maTienTe = maTienTe;
        this.giaTri = giaTri;
    }

    public String getMaTienTe() { return maTienTe; }
    public double getGiaTri() { return giaTri; }
}

// LOI BIEN DICH! Khong the ke thua final class
// class TienTeVND extends TienTe { }
```

**Cac class final co san trong Java:** `String`, `Integer`, `Double`, `Boolean`, `Math`, `System`...

### So sánh static vs non-static

| Tiêu chí | `static` | Non-static |
|----------|----------|------------|
| Thuộc về | Class | Object cụ thể |
| Truy cập | `ClassName.member` | `object.member` |
| Bộ nhớ | Một bản duy nhất | Mỗi object một bản |
| Truy cập `this` | Không thể | Có thể |
| Truy cập non-static member | Không trực tiếp | Có thể |
| Ví dụ | `Math.PI`, `Integer.parseInt()` | `"hello".length()` |

### So sánh final variable vs final method vs final class

| Tiêu chí | final variable | final method | final class |
|----------|---------------|-------------|-------------|
| Ý nghĩa | Không thể thay đổi giá trị | Không thể override | Không thể kế thừa |
| Áp dụng | Biến local, field, parameter | Method trong class | Toàn bộ class |
| Ví dụ | `final int X = 10;` | `final void show() {}` | `final class Util {}` |

---

## 5. Lỗi thường gặp

### Loi 1: Quên dùng this khi tên trùng nhau

```java
// SAI - field khong duoc gan gia tri
public class User {
    private String name;

    public User(String name) {
        name = name;  // Parameter gan cho chinh no!
    }

    public String getName() {
        return name;  // Tra ve null!
    }
}

// DUNG
public class User {
    private String name;

    public User(String name) {
        this.name = name;  // Ro rang: field = parameter
    }
}
```

### Loi 2: Goi this() và super() cùng lúc

```java
// SAI - chi duoc goi MOT trong hai, va phai o dong dau tien
class Con extends Cha {
    Con() {
        super();   // Dong 1: OK
        this(10);  // LOI! this() phai o dong dau tien, nhung super() da chiem
    }
}

// DUNG - chon mot trong hai
class Con extends Cha {
    Con() {
        super();  // Goi constructor cha
    }

    Con(int x) {
        this();   // Goi constructor Con() o tren
    }
}
```

### Loi 3: Truy cập non-static từ static method

```java
// SAI
public class Demo {
    int count = 0;

    public static void main(String[] args) {
        count++;  // LOI! main la static, count la non-static
    }
}

// DUNG - Cach 1: tao object
public static void main(String[] args) {
    Demo d = new Demo();
    d.count++;
}

// DUNG - Cach 2: doi count thanh static
static int count = 0;
public static void main(String[] args) {
    count++;  // OK
}
```

### Loi 4: Thay đổi giá trị final

```java
// SAI
final int MAX = 100;
MAX = 200;  // LOI BIEN DICH! Cannot assign a value to final variable

// SAI - final voi collection
final List<String> list = new ArrayList<>();
list.add("OK");          // OK - noi dung thay doi duoc
list = new ArrayList<>();  // LOI! Khong the tro sang object khac
```

---

## 6. Tổng kết

| Từ khóa | Ý nghĩa | Ví dụ điển hình |
|---------|---------|----------------|
| `this` | Tham chiếu đến object hiện tại | `this.name = name;` |
| `super` | Tham chiếu đến class cha | `super.methodName();` |
| `static` | Thuộc về class, chia sẻ giữa mọi object | `static int count;` |
| `final` | Không thể thay đổi/override/kế thừa | `final double PI = 3.14;` |

---

## 7. Câu hỏi phỏng vấn

### Cau 1: Có thể dùng `this()` và `super()` cùng lúc trong constructor không?

**Tra loi:**

Không. Cả `this()` và `super()` đều phải nằm ở **dòng đầu tiên** của constructor, nên chỉ được gọi một trong hai. Nếu không gọi `super()` rõ ràng, Java tự động thêm `super()` (gọi constructor không tham số của class cha).

### Cau 2: Static method có thể truy cập non-static field không? Tại sao?

**Tra loi:**

Không. Vì static method thuộc về class, nó tồn tại ngay cả khi chưa có object nào. Non-static field thuộc về object cụ thể. Khi static method chạy, nó không biết field đó thuộc về object nào. Muốn truy cập, phải tạo object rồi truy cập qua biến tham chiếu.

```java
class Demo {
    int x = 10;
    static void test() {
        // System.out.println(x);        // LOI
        Demo d = new Demo();
        System.out.println(d.x);         // OK
    }
}
```

### Cau 3: final variable với reference type hoạt động thế nào?

**Tra loi:**

`final` khóa **tham chiếu** (địa chỉ bộ nhớ), không khóa nội dung bên trong object. Bạn không thể gán lại biến `final` sang object khác, nhưng vẫn có thể thay đổi trạng thái bên trong object đó.

```java
final List<String> list = new ArrayList<>();
list.add("A");    // OK - thay doi noi dung object
list.add("B");    // OK
// list = new ArrayList<>();  // LOI! Khong the thay doi tham chieu
```

### Cau 4: Khi nào dùng static final?

**Tra loi:**

Dùng `static final` khi muốn tạo **hằng số cấp class** -- giá trị không thay đổi và được chia sẻ giữa mọi object. Quy ước đặt tên: `UPPER_SNAKE_CASE`.

```java
public class AppConfig {
    public static final String APP_NAME = "MyApp";
    public static final int MAX_RETRY = 3;
    public static final double TAX_RATE = 0.08;
}

// Su dung: AppConfig.APP_NAME, AppConfig.MAX_RETRY
```

### Cau 5: Nêu tất cả công dụng của từ khóa `this`?

**Tra loi:**

1. **Phân biệt field và parameter** trùng tên: `this.name = name`
2. **Gọi constructor khác** trong cùng class: `this(args)`
3. **Truyền object hiện tại** làm tham số: `method(this)`
4. **Trả về object hiện tại** cho method chaining: `return this`
5. **Truy cập field/method** của object hiện tại một cách rõ ràng: `this.display()`
