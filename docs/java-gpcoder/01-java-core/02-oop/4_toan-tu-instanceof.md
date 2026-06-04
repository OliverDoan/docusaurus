---
sidebar_position: 4
title: "Toán tử instanceof trong Java"
---

# Toán tử instanceof trong Java

Toán tử `instanceof` (kiểm tra kiểu — type check operator) dùng để kiểm tra xem một đối tượng có phải là thực thể (instance) của một lớp, lớp cha, hoặc interface cụ thể hay không. Kết quả trả về là giá trị kiểu `boolean` (`true` hoặc `false`).

---

## 1. Cú pháp

```java
object instanceof KieuDuLieu
```

- `object` — biến tham chiếu đến đối tượng cần kiểm tra.
- `KieuDuLieu` — tên lớp (class), lớp trừu tượng (abstract class), hoặc giao diện (interface).
- Trả về `true` nếu đối tượng là thực thể của kiểu đó (hoặc kiểu con của nó), ngược lại trả về `false`.
- Nếu `object` là `null`, kết quả luôn là `false`.

---

## 2. Ví dụ cơ bản

```java
public class DongVat {
    public String ten;

    public DongVat(String ten) {
        this.ten = ten;
    }
}

public class ChoNha extends DongVat {
    public ChoNha(String ten) {
        super(ten);
    }
}

public class MeoNha extends DongVat {
    public MeoNha(String ten) {
        super(ten);
    }
}

public class KiemTraInstanceof {
    public static void main(String[] args) {
        DongVat cho = new ChoNha("Buddy");
        DongVat meo = new MeoNha("Miu");

        System.out.println(cho instanceof ChoNha);   // true
        System.out.println(cho instanceof DongVat);  // true — ChoNha kế thừa DongVat
        System.out.println(cho instanceof MeoNha);   // false

        System.out.println(meo instanceof MeoNha);   // true
        System.out.println(meo instanceof ChoNha);   // false

        // Kiểm tra với null
        DongVat rong = null;
        System.out.println(rong instanceof DongVat); // false — null luôn trả false
    }
}
```

---

## 3. Dùng với interface (giao diện)

`instanceof` cũng hoạt động với interface:

```java
interface CoTheBay {
    void bay();
}

interface CoTheChay {
    void chay();
}

public class ChimBo implements CoTheBay, CoTheChay {
    @Override
    public void bay() { System.out.println("Chim bồ câu bay..."); }

    @Override
    public void chay() { System.out.println("Chim bồ câu chạy..."); }
}

public class KiemTraInterface {
    public static void main(String[] args) {
        ChimBo chim = new ChimBo();

        System.out.println(chim instanceof CoTheBay);  // true
        System.out.println(chim instanceof CoTheChay); // true
    }
}
```

---

## 4. Ứng dụng thực tế: xử lý đa hình an toàn

Trường hợp phổ biến nhất là kết hợp `instanceof` với ép kiểu (casting) để tránh lỗi `ClassCastException` (ngoại lệ ép kiểu sai):

```java
public class HinhHoc {
    public double tinhDienTich() { return 0; }
}

public class HinhTron extends HinhHoc {
    private double banKinh;

    public HinhTron(double banKinh) {
        this.banKinh = banKinh;
    }

    @Override
    public double tinhDienTich() {
        return Math.PI * banKinh * banKinh;
    }

    public double getBanKinh() { return banKinh; }
}

public class HinhChuNhat extends HinhHoc {
    private double chieuDai, chieuRong;

    public HinhChuNhat(double chieuDai, double chieuRong) {
        this.chieuDai = chieuDai;
        this.chieuRong = chieuRong;
    }

    @Override
    public double tinhDienTich() {
        return chieuDai * chieuRong;
    }
}

public class XuLyHinh {
    public static void moTa(HinhHoc hinh) {
        // Kiểm tra trước khi ép kiểu (downcast)
        if (hinh instanceof HinhTron) {
            HinhTron tron = (HinhTron) hinh;
            System.out.println("Hình tròn, bán kính: " + tron.getBanKinh());
        } else if (hinh instanceof HinhChuNhat) {
            System.out.println("Hình chữ nhật");
        }
        System.out.printf("Diện tích: %.2f%n", hinh.tinhDienTich());
    }

    public static void main(String[] args) {
        moTa(new HinhTron(5));
        moTa(new HinhChuNhat(4, 6));
    }
}
// Hình tròn, bán kính: 5.0
// Diện tích: 78.54
// Hình chữ nhật
// Diện tích: 24.00
```

---

## 5. Pattern Matching với `instanceof` (Java 16+)

Từ Java 16, Java hỗ trợ **Pattern Matching** (khớp mẫu) cho `instanceof`, giúp kết hợp kiểm tra kiểu và khai báo biến trong một bước:

```java
// Cách cũ (Java < 16)
if (hinh instanceof HinhTron) {
    HinhTron tron = (HinhTron) hinh; // phải ép kiểu thủ công
    System.out.println(tron.getBanKinh());
}

// Pattern Matching (Java 16+)
if (hinh instanceof HinhTron tron) {
    // biến "tron" đã được ép kiểu tự động, dùng luôn được
    System.out.println(tron.getBanKinh());
}
```

---

## 6. Lưu ý quan trọng

| Tình huống | Kết quả |
|---|---|
| `obj instanceof LopCon` — obj là thực thể của LopCon | `true` |
| `obj instanceof LopCha` — obj là thực thể của lớp con LopCha | `true` |
| `obj instanceof LopKhac` — không liên quan | `false` |
| `null instanceof BatKyLop` | `false` |
| Không cần `instanceof` khi gọi phương thức đã override | Dùng đa hình thay thế |

> **Lời khuyên:** Nếu thường xuyên dùng `instanceof` để rẽ nhánh theo kiểu, hãy cân nhắc tái cấu trúc (refactor) sử dụng đa hình (polymorphism) — đây là cách thiết kế hướng đối tượng tốt hơn.

---

## Tóm tắt

- `instanceof` kiểm tra quan hệ kiểu tại thời điểm chạy (runtime type checking).
- Trả về `false` khi đối tượng là `null`.
- Bao gồm cả quan hệ kế thừa và interface.
- Kết hợp với ép kiểu để tránh `ClassCastException`.
- Java 16+ hỗ trợ Pattern Matching giúp code ngắn gọn hơn.
