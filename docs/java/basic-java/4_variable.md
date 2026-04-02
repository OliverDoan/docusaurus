---
sidebar_position: 4
title: "Bien trong Java"
---

# Bien trong Java

Trong lap trinh, **bien (variable)** la mot **o nho** trong bo nho may tinh, duoc dat ten de luu tru du lieu. Hay tuong tuong bien nhu **nhung chiec hop co dan nhan** -- moi hop co ten rieng va ben trong chua mot gia tri nhat dinh. Ban co the mo hop ra xem (doc gia tri), thay doi noi dung ben trong (gan gia tri moi), nhung loai hop (kieu du lieu) quyet dinh ban co the bo gi vao.

Hieu ro ve bien la buoc dau tien quan trong nhat de hoc bat ky ngon ngu lap trinh nao, vi **moi chuong trinh deu can luu tru va xu ly du lieu**.

---

## 1. Khai bao bien

### Cu phap

```java
KieuDuLieu tenBien = giaTri;
```

### Vi du

```java
public class KhaiBaoBien {
    public static void main(String[] args) {
        // Khai bao va gan gia tri ngay
        int tuoi = 25;
        String ten = "Thuan";
        double diemTrungBinh = 8.5;
        boolean daDangKy = true;

        // Khai bao truoc, gan gia tri sau
        int namSinh;
        namSinh = 1995;

        // Khai bao nhieu bien cung kieu
        int x = 1, y = 2, z = 3;

        // In ra man hinh
        System.out.println("Ten: " + ten);
        System.out.println("Tuoi: " + tuoi);
        System.out.println("Diem TB: " + diemTrungBinh);
        System.out.println("Da dang ky: " + daDangKy);
        System.out.println("Nam sinh: " + namSinh);
        System.out.println("x=" + x + ", y=" + y + ", z=" + z);
    }
}
```

**Ket qua:**

```
Ten: Thuan
Tuoi: 25
Diem TB: 8.5
Da dang ky: true
Nam sinh: 1995
x=1, y=2, z=3
```

:::warning Luu y
Khong the khai bao nhieu bien **khac kieu** trong cung mot lenh:
```java
int a = 1, long b = 2; // LOI BIEN DICH!
```
:::

---

## 2. Ba loai bien trong Java

Java co 3 loai bien chinh, khac nhau ve **vi tri khai bao**, **vung nho**, va **pham vi ton tai**.

### 2.1. Bien cuc bo (Local Variable)

Bien cuc bo duoc khai bao **ben trong phuong thuc**, constructor, hoac block `{}`.

```java
public class LocalVariableDemo {
    public static void main(String[] args) {
        // "ten" la bien cuc bo -- chi ton tai trong main()
        String ten = "Thuan";
        System.out.println("Xin chao " + ten);

        // Bien cuc bo trong block
        if (true) {
            int x = 10; // chi ton tai trong block if nay
            System.out.println("x = " + x);
        }
        // System.out.println(x); // LOI! x khong ton tai o day

        tinhToan();
    }

    public static void tinhToan() {
        // "ketQua" la bien cuc bo cua phuong thuc tinhToan()
        int ketQua = 5 + 3;
        System.out.println("Ket qua: " + ketQua);
        // "ten" cua main() KHONG truy cap duoc o day
    }
}
```

**Dac diem:**
- Luu tren **Stack**
- **Khong co** gia tri mac dinh -- **bat buoc** phai khoi tao truoc khi su dung
- **Khong** co access modifier (public, private...)
- Bi huy khi thoat khoi block/phuong thuc

### 2.2. Bien instance (Instance Variable)

Bien instance duoc khai bao **trong class nhung ngoai phuong thuc**. Moi doi tuong co **ban sao rieng** cua bien instance.

```java
public class SinhVien {
    // Bien instance -- moi doi tuong SinhVien co ban sao rieng
    String ten;
    int tuoi;
    double diemTB;

    public void hienThi() {
        System.out.println("Ten: " + ten + ", Tuoi: " + tuoi + ", Diem TB: " + diemTB);
    }

    public static void main(String[] args) {
        // Tao doi tuong thu 1
        SinhVien sv1 = new SinhVien();
        sv1.ten = "An";
        sv1.tuoi = 20;
        sv1.diemTB = 8.0;

        // Tao doi tuong thu 2
        SinhVien sv2 = new SinhVien();
        sv2.ten = "Binh";
        sv2.tuoi = 22;
        sv2.diemTB = 7.5;

        // Moi doi tuong co gia tri rieng
        sv1.hienThi(); // Ten: An, Tuoi: 20, Diem TB: 8.0
        sv2.hienThi(); // Ten: Binh, Tuoi: 22, Diem TB: 7.5
    }
}
```

**Dac diem:**
- Luu tren **Heap** (cung voi doi tuong)
- **Co** gia tri mac dinh: `int` = 0, `double` = 0.0, `boolean` = false, `String` = null
- Co the dung **access modifier** (private, public, protected)
- Duoc tao khi doi tuong duoc tao (`new`), bi huy khi doi tuong bi Garbage Collection thu hoi

### 2.3. Bien static (Static Variable / Class Variable)

Bien static duoc khai bao voi tu khoa `static`. **Tat ca doi tuong dung chung mot ban sao duy nhat.**

```java
public class NhanVien {
    // Bien static -- dung chung cho tat ca doi tuong
    static String congTy = "FPT Software";
    static int tongSoNhanVien = 0;

    // Bien instance -- moi doi tuong co rieng
    String ten;
    int maNV;

    public NhanVien(String ten) {
        this.ten = ten;
        tongSoNhanVien++;     // Tang bien static
        this.maNV = tongSoNhanVien;
    }

    public void hienThi() {
        System.out.println("Ma NV: " + maNV + ", Ten: " + ten + ", Cong ty: " + congTy);
    }

    public static void main(String[] args) {
        NhanVien nv1 = new NhanVien("An");
        NhanVien nv2 = new NhanVien("Binh");
        NhanVien nv3 = new NhanVien("Cuong");

        nv1.hienThi(); // Ma NV: 1, Ten: An, Cong ty: FPT Software
        nv2.hienThi(); // Ma NV: 2, Ten: Binh, Cong ty: FPT Software
        nv3.hienThi(); // Ma NV: 3, Ten: Cuong, Cong ty: FPT Software

        // Truy cap bien static qua ten class (khuyen nghi)
        System.out.println("Tong so nhan vien: " + NhanVien.tongSoNhanVien); // 3

        // Doi gia tri static -- anh huong tat ca doi tuong
        NhanVien.congTy = "Viettel";
        nv1.hienThi(); // Ma NV: 1, Ten: An, Cong ty: Viettel
    }
}
```

**Dac diem:**
- Luu tren **Method Area** (Static Memory)
- Chi co **mot ban sao duy nhat** cho tat ca doi tuong
- Duoc tao khi class duoc nap, bi huy khi chuong trinh ket thuc
- Truy cap qua **TenClass.tenBien** (khuyen nghi) hoac qua doi tuong

---

## 3. Bang so sanh 3 loai bien

| Tieu chi | Local Variable | Instance Variable | Static Variable |
|----------|---------------|-------------------|-----------------|
| **Vi tri khai bao** | Trong method/block | Trong class, ngoai method | Trong class, co tu khoa `static` |
| **Vung nho** | Stack | Heap | Method Area |
| **Gia tri mac dinh** | Khong co (phai khoi tao) | Co (0, null, false...) | Co (0, null, false...) |
| **Pham vi** | Trong block/method | Trong doi tuong | Toan bo class |
| **So ban sao** | Moi lan goi tao moi | Moi doi tuong 1 ban | 1 ban duy nhat |
| **Truy cap** | Truc tiep | Qua doi tuong | Qua TenClass.tenBien |

---

## 4. Pham vi ton tai (Variable Scope)

```java
public class ScopeDemo {
    // Bien instance -- pham vi: toan bo class
    int bienInstance = 100;

    // Bien static -- pham vi: toan bo class
    static int bienStatic = 200;

    public void phuongThuc() {
        // Bien cuc bo -- pham vi: chi trong phuong thuc nay
        int bienCucBo = 300;
        System.out.println(bienInstance); // OK
        System.out.println(bienStatic);   // OK
        System.out.println(bienCucBo);    // OK

        for (int i = 0; i < 3; i++) {
            // Bien i -- pham vi: chi trong vong for
            System.out.println("i = " + i);
        }
        // System.out.println(i); // LOI! i khong ton tai o day
    }

    public void phuongThucKhac() {
        System.out.println(bienInstance); // OK
        System.out.println(bienStatic);   // OK
        // System.out.println(bienCucBo); // LOI! bienCucBo chi ton tai trong phuongThuc()
    }

    public static void main(String[] args) {
        ScopeDemo obj = new ScopeDemo();
        obj.phuongThuc();
    }
}
```

---

## 5. Hang so (final)

Hang so la bien ma **gia tri khong the thay doi** sau khi da gan. Dung tu khoa `final`.

```java
public class HangSoDemo {
    // Hang so static -- quy uoc viet IN HOA, ngan cach bang _
    static final double PI = 3.14159265358979;
    static final int MAX_SINH_VIEN = 50;
    static final String TEN_TRUONG = "Dai hoc Bach Khoa";

    // Hang so instance -- gan gia tri trong constructor
    final int maSo;

    public HangSoDemo(int maSo) {
        this.maSo = maSo; // OK: gan lan dau trong constructor
    }

    public static void main(String[] args) {
        System.out.println("PI = " + PI);
        System.out.println("Max SV = " + MAX_SINH_VIEN);
        System.out.println("Truong: " + TEN_TRUONG);

        // PI = 3.0; // LOI BIEN DICH: cannot assign a value to final variable

        HangSoDemo obj = new HangSoDemo(1001);
        System.out.println("Ma so: " + obj.maSo);
        // obj.maSo = 1002; // LOI: cannot assign a value to final variable
    }
}
```

**Quy tac dat ten hang so:**
- Viet **IN HOA** tat ca
- Dung dau `_` de ngan cach cac tu
- Vi du: `MAX_VALUE`, `PI_NUMBER`, `DEFAULT_TIMEOUT`

---

## 6. Quy tac dat ten bien

| Loai | Quy tac | Vi du |
|------|---------|-------|
| **Bien / Phuong thuc** | camelCase (viet thuong chu dau, hoa chu dau cac tu tiep theo) | `hoTen`, `diemTrungBinh`, `tinhTong()` |
| **Class / Interface** | PascalCase (viet hoa chu dau moi tu) | `SinhVien`, `NhanVien`, `ArrayList` |
| **Hang so** | UPPER_SNAKE_CASE | `MAX_VALUE`, `PI`, `DEFAULT_SIZE` |
| **Package** | Tat ca viet thuong | `com.example.myapp` |

**Quy tac chung:**
- Bat dau bang chu cai, `_` hoac `$` (khong bat dau bang so)
- Khong dung **tu khoa Java** (class, public, static, int...)
- Phan biet chu hoa/thuong (`age` khac `Age`)
- Khong chua khoang trang
- Ten phai co y nghia, mo ta ro muc dich

```java
public class QuyTacDatTen {
    public static void main(String[] args) {
        // TOT: Ten ro rang, co y nghia
        int tuoiSinhVien = 20;
        String hoVaTen = "Nguyen Van A";
        double diemTrungBinh = 8.5;

        // XAU: Ten khong ro rang
        int t = 20;        // t la gi?
        String s = "ABC";  // s la gi?
        double d = 8.5;    // d la gi?
    }
}
```

---

## 7. Tu khoa `var` (Java 10+)

Tu Java 10, ban co the dung `var` de Java **tu dong suy ra kieu du lieu** tu gia tri gan:

```java
public class VarDemo {
    public static void main(String[] args) {
        // Java tu suy ra kieu du lieu
        var ten = "Thuan";           // String
        var tuoi = 25;               // int
        var diemTB = 8.5;            // double
        var danhSach = new java.util.ArrayList<String>(); // ArrayList<String>

        System.out.println(ten.getClass().getSimpleName());     // String
        System.out.println(((Object) tuoi).getClass().getSimpleName()); // Integer

        // var CHI dung cho bien cuc bo
        // KHONG dung duoc cho:
        // - Bien instance
        // - Bien static
        // - Tham so phuong thuc
        // - Kieu tra ve cua phuong thuc
    }

    // var tenBien; // LOI: khong the suy ra kieu khi khong co gia tri khoi tao
}
```

---

## Khi nao dung?

- **Bien cuc bo (local):** Dung cho du lieu tam thoi trong phuong thuc (dem vong lap, ket qua tinh toan, bien tam)
- **Bien instance:** Dung khi moi doi tuong can co du lieu rieng (ten, tuoi, dia chi cua moi sinh vien)
- **Bien static:** Dung khi du lieu chia se cho tat ca doi tuong (so luong doi tuong, ten cong ty, hang so toan cuc)
- **Hang so (final):** Dung cho gia tri khong bao gio thay doi (PI, MAX_SIZE, URL API)
- **var:** Dung khi kieu du lieu ro rang tu gia tri gan va muon code gon hon (chi danh cho bien cuc bo)

---

## Loi thuong gap

### Loi 1: Su dung bien cuc bo chua khoi tao

```java
❌ Sai:
public void test() {
    int x;
    System.out.println(x); // LOI: variable x might not have been initialized
}

✅ Dung:
public void test() {
    int x = 0; // Khoi tao truoc khi dung
    System.out.println(x);
}
```

### Loi 2: Truy cap bien instance tu static method

```java
❌ Sai:
public class Demo {
    int x = 10; // Bien instance

    public static void main(String[] args) {
        System.out.println(x); // LOI: non-static variable x cannot be referenced from a static context
    }
}

✅ Dung:
public class Demo {
    int x = 10;

    public static void main(String[] args) {
        Demo obj = new Demo();
        System.out.println(obj.x); // Truy cap qua doi tuong
    }
}
```

### Loi 3: Nham lan static va instance variable

```java
❌ Sai: Nghi rang doi gia tri static chi anh huong mot doi tuong
public class Sai {
    static int dem = 0;

    public static void main(String[] args) {
        Sai a = new Sai();
        Sai b = new Sai();
        a.dem = 5;
        System.out.println(b.dem); // In ra 5, khong phai 0!
    }
}

✅ Dung: Hieu rang static la dung chung
// Truy cap bien static qua ten class
System.out.println(Sai.dem); // Ro rang la bien chung
```

### Loi 4: Dat ten bien trung voi tu khoa Java

```java
❌ Sai:
int class = 5;     // LOI: "class" la tu khoa
String static = ""; // LOI: "static" la tu khoa

✅ Dung:
int classId = 5;
String staticText = "hello";
```

---

## Cau hoi phong van

### Cau 1: Su khac biet giua bien instance va bien static?

**Tra loi:**
- **Bien instance:** Thuoc ve **doi tuong**, moi doi tuong co ban sao rieng, luu tren Heap, tao khi `new` doi tuong.
- **Bien static:** Thuoc ve **class**, chi co mot ban sao duy nhat dung chung cho tat ca doi tuong, luu tren Method Area, tao khi class duoc nap.
- Vi du: Trong lop `SinhVien`, `ten` la bien instance (moi SV co ten khac nhau), `tenTruong` la bien static (tat ca SV cung truong).

### Cau 2: Bien local co gia tri mac dinh khong?

**Tra loi:** **Khong.** Bien local (cuc bo) **khong co gia tri mac dinh** va **bat buoc phai khoi tao** truoc khi su dung. Neu khong khoi tao, compiler se bao loi `variable might not have been initialized`. Trong khi do, bien instance va static **co gia tri mac dinh** (int=0, boolean=false, object=null).

### Cau 3: `final` va constant trong Java khac nhau nhu the nao?

**Tra loi:** Trong Java, khong co tu khoa `constant`. Hang so duoc tao bang to hop `static final`. Tu khoa `final` chi ngan viec **gan lai gia tri**, nhung doi tuong ma no tham chieu van co the bi thay doi noi dung (truong hop reference type). Hang so that su (`static final`) thuoc ve class va khong doi trong toan bo thoi gian chay.

```java
final int[] arr = {1, 2, 3};
arr[0] = 99;          // OK! Noi dung mang van thay doi duoc
// arr = new int[5];   // LOI! Khong the gan lai reference
```

### Cau 4: Tu khoa `var` trong Java hoat dong nhu the nao?

**Tra loi:** `var` (tu Java 10) cho phep **kieu suy luan (type inference)** -- compiler tu dong xac dinh kieu du lieu tu gia tri gan. `var` CHI dung cho **bien cuc bo** da duoc khoi tao. No khong phai kieu du lieu moi, ma chi la cu phap viet tat. Kieu du lieu duoc xac dinh tai thoi diem **bien dich (compile-time)**, khong phai thoi diem chay (runtime), nen van dam bao an toan kieu.

### Cau 5: Tai sao nen truy cap bien static qua ten class thay vi doi tuong?

**Tra loi:** Vi bien static thuoc ve **class**, khong thuoc ve doi tuong cu the. Truy cap qua ten class (`NhanVien.tongSo`) lam ro rang do la bien chung. Truy cap qua doi tuong (`nv1.tongSo`) gay nham lan, nguoi doc co the nghi do la bien instance. IDE cung se canh bao khi truy cap static member qua doi tuong.
