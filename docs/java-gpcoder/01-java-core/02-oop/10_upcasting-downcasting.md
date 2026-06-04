---
sidebar_position: 10
title: "Cơ chế Upcasting và Downcasting trong Java"
---

# Cơ chế Upcasting và Downcasting trong Java

Trong Java, **casting** (ép kiểu) là cơ chế chuyển đổi một đối tượng từ kiểu này sang kiểu khác trong hệ thống phân cấp kế thừa (inheritance hierarchy). Có hai chiều chuyển đổi:

- **Upcasting** — ép kiểu hướng lên (lớp con → lớp cha)
- **Downcasting** — ép kiểu hướng xuống (lớp cha → lớp con)

---

## 1. Upcasting — Ép kiểu hướng lên

**Upcasting** là chuyển đổi đối tượng từ kiểu lớp con (subclass) sang kiểu lớp cha (superclass) hoặc interface mà lớp con triển khai.

### Đặc điểm

- Luôn **an toàn** (safe) — không gây lỗi tại runtime.
- Java thực hiện **tự động** (implicit casting), không cần khai báo tường minh.
- Sau upcasting, chỉ có thể truy cập các thành viên được định nghĩa trong **kiểu lớp cha**.
- Phương thức đã được ghi đè (override) vẫn gọi **cài đặt của lớp con** (runtime polymorphism).

```java
public class DongVat {
    public String ten;

    public DongVat(String ten) {
        this.ten = ten;
    }

    public void keu() {
        System.out.println(ten + " kêu...");
    }
}

public class ChoNha extends DongVat {
    public ChoNha(String ten) {
        super(ten);
    }

    @Override
    public void keu() {
        System.out.println(ten + " sủa: Gâu gâu!");
    }

    public void layDo() {
        System.out.println(ten + " đang lấy đồ!");
    }
}

public class DemoUpcasting {
    public static void main(String[] args) {
        ChoNha cho = new ChoNha("Buddy");

        // Upcasting — tự động, không cần ép kiểu tường minh
        DongVat dongVat = cho;

        // Gọi phương thức: dùng cài đặt của ChoNha (runtime polymorphism)
        dongVat.keu();          // "Buddy sủa: Gâu gâu!" — không phải lớp cha

        System.out.println(dongVat.ten); // "Buddy" — truy cập được

        // Không thể gọi phương thức chỉ có trong ChoNha
        // dongVat.layDo(); // LỖI BIÊN DỊCH — DongVat không có layDo()
    }
}
```

### Upcasting với Interface

```java
interface CoTheBay {
    void bay();
}

public class ChimBo extends DongVat implements CoTheBay {
    public ChimBo(String ten) {
        super(ten);
    }

    @Override
    public void keu() {
        System.out.println(ten + ": Cục cục!");
    }

    @Override
    public void bay() {
        System.out.println(ten + " đang bay!");
    }
}

public class DemoUpcastingInterface {
    public static void main(String[] args) {
        ChimBo chim = new ChimBo("Bồ câu");

        DongVat dv = chim;        // upcasting lên DongVat
        CoTheBay bay = chim;      // upcasting lên interface CoTheBay

        dv.keu();   // "Bồ câu: Cục cục!"
        bay.bay();  // "Bồ câu đang bay!"
    }
}
```

---

## 2. Downcasting — Ép kiểu hướng xuống

**Downcasting** là chuyển đổi ngược lại — từ kiểu lớp cha về kiểu lớp con — để truy cập các thành viên đặc thù của lớp con.

### Đặc điểm

- **Không tự động** — phải ép kiểu tường minh (explicit casting).
- **Không luôn an toàn** — nếu ép kiểu sai, ném ra `ClassCastException` (ngoại lệ ép kiểu sai) tại runtime.
- **Bắt buộc phải kiểm tra** bằng `instanceof` trước khi downcasting.

```java
public class DemoDowncasting {
    public static void main(String[] args) {
        // Đối tượng thực sự là ChoNha, nhưng biến kiểu DongVat
        DongVat dongVat = new ChoNha("Rex");

        // Downcasting — phải dùng cú pháp (KieuMuonChuyen)
        ChoNha cho = (ChoNha) dongVat;
        cho.layDo(); // "Rex đang lấy đồ!" — truy cập được thành viên riêng
    }
}
```

### Lỗi ClassCastException khi downcasting sai

```java
public class DemoClassCastException {
    public static void main(String[] args) {
        DongVat dongVat = new DongVat("Mèo hoang"); // đối tượng thực là DongVat

        // CỐ TÌNH ép sai — đối tượng thực không phải ChoNha
        try {
            ChoNha cho = (ChoNha) dongVat; // ClassCastException!
        } catch (ClassCastException e) {
            System.out.println("Lỗi: " + e.getMessage());
            // class DongVat cannot be cast to class ChoNha
        }
    }
}
```

---

## 3. An toàn khi Downcasting — Dùng `instanceof`

Luôn kiểm tra bằng `instanceof` trước khi downcasting:

```java
public class XuLyDongVat {
    public static void xuLy(DongVat dongVat) {
        System.out.println("Đang xử lý: " + dongVat.ten);

        if (dongVat instanceof ChoNha) {
            ChoNha cho = (ChoNha) dongVat;
            cho.layDo(); // an toàn
        } else if (dongVat instanceof ChimBo) {
            ChimBo chim = (ChimBo) dongVat;
            chim.bay(); // an toàn
        } else {
            dongVat.keu(); // chỉ gọi phương thức chung
        }
    }

    public static void main(String[] args) {
        DongVat[] danhSach = {
            new ChoNha("Buddy"),
            new DongVat("Mèo hoang"),
            new ChimBo("Bồ câu")
        };

        for (DongVat dv : danhSach) {
            xuLy(dv);
            System.out.println("---");
        }
    }
}
```

### Pattern Matching — Cách viết ngắn gọn hơn (Java 16+)

```java
// Trước Java 16
if (dongVat instanceof ChoNha) {
    ChoNha cho = (ChoNha) dongVat;
    cho.layDo();
}

// Java 16+ — pattern matching, kết hợp kiểm tra và khai báo biến
if (dongVat instanceof ChoNha cho) {
    cho.layDo(); // biến "cho" đã được ép kiểu tự động
}
```

---

## 4. Ví dụ thực tế: Hệ thống thanh toán

```java
public abstract class PhuongThucThanhToan {
    public abstract void thanhToan(double soTien);
}

public class ThanhToanThe extends PhuongThucThanhToan {
    private String soThe;

    public ThanhToanThe(String soThe) {
        this.soThe = soThe;
    }

    @Override
    public void thanhToan(double soTien) {
        System.out.printf("Thanh toán %.0f VND qua thẻ %s%n", soTien, soThe);
    }

    public String getSoThe() { return soThe; }
}

public class ThanhToanMomo extends PhuongThucThanhToan {
    private String soDienThoai;

    public ThanhToanMomo(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    @Override
    public void thanhToan(double soTien) {
        System.out.printf("Thanh toán %.0f VND qua MoMo %s%n", soTien, soDienThoai);
    }

    public void xemLichSu() {
        System.out.println("Xem lịch sử giao dịch MoMo: " + soDienThoai);
    }
}

public class DonHang {
    public void xuLy(PhuongThucThanhToan pt, double soTien) {
        // Upcasting — pt nhận bất kỳ phương thức thanh toán nào
        pt.thanhToan(soTien);

        // Downcasting khi cần tính năng đặc thù
        if (pt instanceof ThanhToanMomo momo) { // Java 16+ pattern matching
            momo.xemLichSu();
        }
    }

    public static void main(String[] args) {
        DonHang dh = new DonHang();
        dh.xuLy(new ThanhToanThe("4111-xxxx-xxxx-1234"), 250000);
        dh.xuLy(new ThanhToanMomo("0901234567"), 150000);
    }
}
```

---

## 5. Tóm tắt so sánh

| Tiêu chí | Upcasting | Downcasting |
|---|---|---|
| Chiều chuyển đổi | Lớp con → Lớp cha | Lớp cha → Lớp con |
| Tường minh | Tự động (không cần khai báo) | Bắt buộc khai báo `(KieuMuon)` |
| An toàn | Luôn an toàn | Có thể gây `ClassCastException` |
| Truy cập thành viên | Chỉ thành viên lớp cha | Toàn bộ thành viên lớp con |
| Phương thức override | Gọi cài đặt lớp con | Gọi cài đặt lớp con |
| Kiểm tra trước | Không cần | Nên dùng `instanceof` |

---

## Tóm tắt

- **Upcasting** an toàn, tự động, cho phép đa hình — dùng đối tượng lớp con qua biến lớp cha.
- **Downcasting** cần khai báo tường minh, có thể gây lỗi — luôn kiểm tra bằng `instanceof` trước.
- Java 16+ giới thiệu Pattern Matching giúp viết downcasting ngắn gọn và an toàn hơn.
- Ưu tiên dùng đa hình (overriding) thay vì downcasting khi thiết kế hệ thống.
