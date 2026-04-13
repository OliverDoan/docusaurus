---
sidebar_position: 4
title: "4. Biến trong Java"
---

# Biến trong Java

Trong lập trình, **biến (variable)** là một **ô nhớ** trong bộ nhớ máy tính, được đặt tên để lưu trữ dữ liệu. Hãy tưởng tượng biến như **những chiếc hộp có dán nhãn** -- mỗi hộp có tên riêng và bên trong chứa một giá trị nhất định. Bạn có thể mở hộp ra xem (đọc giá trị), thay đổi nội dung bên trong (gán giá trị mới), nhưng loại hộp (kiểu dữ liệu) quyết định bạn có thể bỏ gì vào.

Hiểu rõ về biến là bước đầu tiên quan trọng nhất để học bất kỳ ngôn ngữ lập trình nào, vì **mọi chương trình đều cần lưu trữ và xử lý dữ liệu**.

---

## 1. Khai báo biến

### Cú pháp

```java
KieuDuLieu tenBien = giaTri;
```

### Ví dụ

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

**Kết quả:**

```
Ten: Thuan
Tuoi: 25
Diem TB: 8.5
Da dang ky: true
Nam sinh: 1995
x=1, y=2, z=3
```

:::warning Lưu ý
Không thể khai báo nhiều biến **khác kiểu** trong cùng một lệnh:
```java
int a = 1, long b = 2; // LỖI BIÊN DỊCH!
```
:::

---

## 2. Ba loại biến trong Java

Java có 3 loại biến chính, khác nhau về **vị trí khai báo**, **vùng nhớ**, và **phạm vi tồn tại**.

### 2.1. Biến cục bộ (Local Variable)

Biến cục bộ được khai báo **bên trong phương thức**, constructor, hoặc block `{}`.

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

**Đặc điểm:**
- Lưu trên **Stack**
- **Không có** giá trị mặc định -- **bắt buộc** phải khởi tạo trước khi sử dụng
- **Không** có access modifier (public, private...)
- Bị hủy khi thoát khỏi block/phương thức

### 2.2. Biến instance (Instance Variable)

Biến instance được khai báo **trong class nhưng ngoài phương thức**. Mỗi đối tượng có **bản sao riêng** của biến instance.

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

**Đặc điểm:**
- Lưu trên **Heap** (cùng với đối tượng)
- **Có** giá trị mặc định: `int` = 0, `double` = 0.0, `boolean` = false, `String` = null
- Có thể dùng **access modifier** (private, public, protected)
- Được tạo khi đối tượng được tạo (`new`), bị hủy khi đối tượng bị Garbage Collection thu hồi

### 2.3. Biến static (Static Variable / Class Variable)

Biến static được khai báo với từ khóa `static`. **Tất cả đối tượng dùng chung một bản sao duy nhất.**

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

**Đặc điểm:**
- Lưu trên **Method Area** (Static Memory)
- Chỉ có **một bản sao duy nhất** cho tất cả đối tượng
- Được tạo khi class được nạp, bị hủy khi chương trình kết thúc
- Truy cập qua **TenClass.tenBien** (khuyến nghị) hoặc qua đối tượng

---

## 3. Bảng so sánh 3 loại biến

| Tiêu chí | Local Variable | Instance Variable | Static Variable |
|----------|---------------|-------------------|-----------------|
| **Vị trí khai báo** | Trong method/block | Trong class, ngoài method | Trong class, có từ khóa `static` |
| **Vùng nhớ** | Stack | Heap | Method Area |
| **Giá trị mặc định** | Không có (phải khởi tạo) | Có (0, null, false...) | Có (0, null, false...) |
| **Phạm vi** | Trong block/method | Trong đối tượng | Toàn bộ class |
| **Số bản sao** | Mỗi lần gọi tạo mới | Mỗi đối tượng 1 bản | 1 bản duy nhất |
| **Truy cập** | Trực tiếp | Qua đối tượng | Qua TenClass.tenBien |

---

## 4. Phạm vi tồn tại (Variable Scope)

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

## 5. Hằng số (final)

Hằng số là biến mà **giá trị không thể thay đổi** sau khi đã gán. Dùng từ khóa `final`.

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

**Quy tắc đặt tên hằng số:**
- Viết **IN HOA** tất cả
- Dùng dấu `_` để ngăn cách các từ
- Ví dụ: `MAX_VALUE`, `PI_NUMBER`, `DEFAULT_TIMEOUT`

---

## 6. Quy tắc đặt tên biến

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| **Biến / Phương thức** | camelCase (viết thường chữ đầu, hoa chữ đầu các từ tiếp theo) | `hoTen`, `diemTrungBinh`, `tinhTong()` |
| **Class / Interface** | PascalCase (viết hoa chữ đầu mỗi từ) | `SinhVien`, `NhanVien`, `ArrayList` |
| **Hằng số** | UPPER_SNAKE_CASE | `MAX_VALUE`, `PI`, `DEFAULT_SIZE` |
| **Package** | Tất cả viết thường | `com.example.myapp` |

**Quy tắc chung:**
- Bắt đầu bằng chữ cái, `_` hoặc `$` (không bắt đầu bằng số)
- Không dùng **từ khóa Java** (class, public, static, int...)
- Phân biệt chữ hoa/thường (`age` khác `Age`)
- Không chứa khoảng trắng
- Tên phải có ý nghĩa, mô tả rõ mục đích

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

## 7. Từ khóa `var` (Java 10+)

Từ Java 10, bạn có thể dùng `var` để Java **tự động suy ra kiểu dữ liệu** từ giá trị gán:

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

## Khi nào dùng?

- **Biến cục bộ (local):** Dùng cho dữ liệu tạm thời trong phương thức (đếm vòng lặp, kết quả tính toán, biến tạm)
- **Biến instance:** Dùng khi mỗi đối tượng cần có dữ liệu riêng (tên, tuổi, địa chỉ của mỗi sinh viên)
- **Biến static:** Dùng khi dữ liệu chia sẻ cho tất cả đối tượng (số lượng đối tượng, tên công ty, hằng số toàn cục)
- **Hằng số (final):** Dùng cho giá trị không bao giờ thay đổi (PI, MAX_SIZE, URL API)
- **var:** Dùng khi kiểu dữ liệu rõ ràng từ giá trị gán và muốn code gọn hơn (chỉ dành cho biến cục bộ)

---

## Lỗi thường gặp

### Lỗi 1: Sử dụng biến cục bộ chưa khởi tạo

```java
❌ Sai:
public void test() {
    int x;
    System.out.println(x); // LỖI: variable x might not have been initialized
}

✅ Đúng:
public void test() {
    int x = 0; // Khởi tạo trước khi dùng
    System.out.println(x);
}
```

### Lỗi 2: Truy cập biến instance từ static method

```java
❌ Sai:
public class Demo {
    int x = 10; // Biến instance

    public static void main(String[] args) {
        System.out.println(x); // LỖI: non-static variable x cannot be referenced from a static context
    }
}

✅ Đúng:
public class Demo {
    int x = 10;

    public static void main(String[] args) {
        Demo obj = new Demo();
        System.out.println(obj.x); // Truy cập qua đối tượng
    }
}
```

### Lỗi 3: Nhầm lẫn static và instance variable

```java
❌ Sai: Nghĩ rằng đổi giá trị static chỉ ảnh hưởng một đối tượng
public class Sai {
    static int dem = 0;

    public static void main(String[] args) {
        Sai a = new Sai();
        Sai b = new Sai();
        a.dem = 5;
        System.out.println(b.dem); // In ra 5, không phải 0!
    }
}

✅ Đúng: Hiểu rằng static là dùng chung
// Truy cập biến static qua tên class
System.out.println(Sai.dem); // Rõ ràng là biến chung
```

### Lỗi 4: Đặt tên biến trùng với từ khóa Java

```java
❌ Sai:
int class = 5;     // LỖI: "class" là từ khóa
String static = ""; // LỖI: "static" là từ khóa

✅ Đúng:
int classId = 5;
String staticText = "hello";
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa biến instance và biến static?

**Trả lời:**
- **Biến instance:** Thuộc về **đối tượng**, mỗi đối tượng có bản sao riêng, lưu trên Heap, tạo khi `new` đối tượng.
- **Biến static:** Thuộc về **class**, chỉ có một bản sao duy nhất dùng chung cho tất cả đối tượng, lưu trên Method Area, tạo khi class được nạp.
- Ví dụ: Trong lớp `SinhVien`, `ten` là biến instance (mỗi SV có tên khác nhau), `tenTruong` là biến static (tất cả SV cùng trường).

### Câu 2: Biến local có giá trị mặc định không?

**Trả lời:** **Không.** Biến local (cục bộ) **không có giá trị mặc định** và **bắt buộc phải khởi tạo** trước khi sử dụng. Nếu không khởi tạo, compiler sẽ báo lỗi `variable might not have been initialized`. Trong khi đó, biến instance và static **có giá trị mặc định** (int=0, boolean=false, object=null).

### Câu 3: `final` và constant trong Java khác nhau như thế nào?

**Trả lời:** Trong Java, không có từ khóa `constant`. Hằng số được tạo bằng tổ hợp `static final`. Từ khóa `final` chỉ ngăn việc **gán lại giá trị**, nhưng đối tượng mà nó tham chiếu vẫn có thể bị thay đổi nội dung (trường hợp reference type). Hằng số thật sự (`static final`) thuộc về class và không đổi trong toàn bộ thời gian chạy.

```java
final int[] arr = {1, 2, 3};
arr[0] = 99;          // OK! Nội dung mảng vẫn thay đổi được
// arr = new int[5];   // LỖI! Không thể gán lại reference
```

### Câu 4: Từ khóa `var` trong Java hoạt động như thế nào?

**Trả lời:** `var` (từ Java 10) cho phép **kiểu suy luận (type inference)** -- compiler tự động xác định kiểu dữ liệu từ giá trị gán. `var` CHỈ dùng cho **biến cục bộ** đã được khởi tạo. Nó không phải kiểu dữ liệu mới, mà chỉ là cú pháp viết tắt. Kiểu dữ liệu được xác định tại thời điểm **biên dịch (compile-time)**, không phải thời điểm chạy (runtime), nên vẫn đảm bảo an toàn kiểu.

### Câu 5: Tại sao nên truy cập biến static qua tên class thay vì đối tượng?

**Trả lời:** Vì biến static thuộc về **class**, không thuộc về đối tượng cụ thể. Truy cập qua tên class (`NhanVien.tongSo`) làm rõ ràng đó là biến chung. Truy cập qua đối tượng (`nv1.tongSo`) gây nhầm lẫn, người đọc có thể nghĩ đó là biến instance. IDE cũng sẽ cảnh báo khi truy cập static member qua đối tượng.
