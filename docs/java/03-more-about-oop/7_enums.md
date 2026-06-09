---
sidebar_position: 7
title: "7. Enums"
---

# Enums

Enum (kiểu liệt kê) dùng khi một biến chỉ được nhận một trong vài giá trị cố định, như các ngày trong tuần hay trạng thái đơn hàng. So với dùng chuỗi hay số, enum an toàn hơn vì Java kiểm tra ngay lúc biên dịch, tránh gõ nhầm và làm code rõ nghĩa. Bài này giới thiệu cách khai báo enum, dùng trong `switch`, thêm thuộc tính/phương thức và các phương thức tiện ích sẵn có; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Enum là gì?](#enum-là-gì)
- [Định nghĩa enum cơ bản](#định-nghĩa-enum-cơ-bản)
- [Vì sao dùng enum thay vì chuỗi/số?](#vì-sao-dùng-enum-thay-vì-chuỗisố)
- [Dùng enum trong switch](#dùng-enum-trong-switch)
- [Enum có thuộc tính và phương thức](#enum-có-thuộc-tính-và-phương-thức)
- [Các phương thức tiện ích của enum](#các-phương-thức-tiện-ích-của-enum)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Enum là gì?

**Enum** (viết tắt của enumeration — kiểu liệt kê: một tập hợp cố định các giá trị có tên) dùng khi một biến chỉ được nhận một trong vài giá trị xác định trước.

Ví dụ đời thường: các ngày trong tuần (Thứ Hai đến Chủ Nhật), các hướng (Đông, Tây, Nam, Bắc), trạng thái đơn hàng (Đang xử lý, Đã giao, Đã hủy). Những thứ này có một danh sách giá trị cố định, không thể là giá trị bất kỳ.

---

## Định nghĩa enum cơ bản

Dùng từ khóa `enum` để khai báo. Các giá trị (gọi là **hằng số enum**) thường viết HOA.

```java
// Khai báo một enum tên Mau với 3 giá trị cố định
public enum Mau {
    DO,
    XANH,
    VANG
}
```

Sử dụng:

```java
public class Main {
    public static void main(String[] args) {
        // Biến kiểu Mau chỉ nhận được DO, XANH, hoặc VANG
        Mau mauYeuThich = Mau.DO;

        System.out.println("Mau: " + mauYeuThich); // DO

        // So sánh enum
        if (mauYeuThich == Mau.DO) {
            System.out.println("Ban thich mau do!");
        }
    }
}
```

---

## Vì sao dùng enum thay vì chuỗi/số?

Trước khi có enum, người ta thường dùng chuỗi hoặc số để biểu diễn trạng thái — nhưng cách này dễ sai.

```java
// CÁCH CŨ (DỄ LỖI): dùng chuỗi
String trangThai = "DANG_XU_LY";
// Có thể gõ nhầm "DANG_XULY" mà Java không phát hiện được

// CÁCH CŨ (DỄ LỖI): dùng số
int trangThaiSo = 1; // 1 là gì? Phải nhớ quy ước, dễ nhầm
```

Với enum, Java kiểm tra ngay lúc biên dịch:

```java
public enum TrangThaiDonHang {
    DANG_XU_LY, DA_GIAO, DA_HUY
}

public class Main {
    public static void main(String[] args) {
        TrangThaiDonHang tt = TrangThaiDonHang.DANG_XU_LY; // OK
        // TrangThaiDonHang sai = TrangThaiDonHang.DANG_XULY; // LỖI ngay, không gõ nhầm được
    }
}
```

Ưu điểm: an toàn (không gõ nhầm), tự gợi ý trong IDE, code rõ nghĩa.

---

## Dùng enum trong switch

Enum kết hợp rất tốt với `switch` (cấu trúc rẽ nhánh nhiều trường hợp). Trong case không cần ghi tên enum đầy đủ.

```java
public enum TrangThaiDonHang {
    DANG_XU_LY, DA_GIAO, DA_HUY
}

public class Main {
    static void xuLy(TrangThaiDonHang tt) {
        switch (tt) {
            case DANG_XU_LY: // không cần ghi TrangThaiDonHang.DANG_XU_LY
                System.out.println("Don hang dang duoc xu ly");
                break;
            case DA_GIAO:
                System.out.println("Don hang da giao thanh cong");
                break;
            case DA_HUY:
                System.out.println("Don hang da bi huy");
                break;
        }
    }

    public static void main(String[] args) {
        xuLy(TrangThaiDonHang.DA_GIAO); // Don hang da giao thanh cong
    }
}
```

Lợi ích: nếu thêm giá trị enum mới, nhiều IDE sẽ nhắc bạn xử lý case còn thiếu.

---

## Enum có thuộc tính và phương thức

Enum trong Java mạnh hơn nhiều ngôn ngữ khác: mỗi hằng số enum có thể mang **thuộc tính** và enum có thể có **phương thức**.

```java
public enum HanhTinh {
    // Mỗi hằng số kèm dữ liệu: khối lượng và bán kính
    TRAI_DAT(5.976e24, 6.37814e6),
    SAO_HOA(6.421e23, 3.3972e6);

    // Thuộc tính của mỗi hằng số (nên để private final)
    private final double khoiLuong;
    private final double banKinh;

    // Constructor của enum (luôn private ngầm định)
    HanhTinh(double khoiLuong, double banKinh) {
        this.khoiLuong = khoiLuong;
        this.banKinh = banKinh;
    }

    // Phương thức tính trọng lực bề mặt
    double trongLucBeMat() {
        double G = 6.67300e-11; // hằng số hấp dẫn
        return G * khoiLuong / (banKinh * banKinh);
    }
}

public class Main {
    public static void main(String[] args) {
        for (HanhTinh ht : HanhTinh.values()) {
            System.out.println(ht + " trong luc: " + ht.trongLucBeMat());
        }
    }
}
```

Khi khai báo hằng số có dữ liệu, bạn truyền giá trị vào constructor của enum.

---

## Các phương thức tiện ích của enum

Mọi enum tự động có sẵn các phương thức hữu ích:

```java
public enum Mau { DO, XANH, VANG }

public class Main {
    public static void main(String[] args) {
        // values(): trả về mảng tất cả hằng số
        for (Mau m : Mau.values()) {
            System.out.println(m);
        }

        // valueOf(): chuyển chuỗi thành enum
        Mau m = Mau.valueOf("XANH");
        System.out.println(m); // XANH

        // name(): tên hằng số dưới dạng chuỗi
        System.out.println(Mau.DO.name()); // "DO"

        // ordinal(): vị trí (bắt đầu từ 0)
        System.out.println(Mau.VANG.ordinal()); // 2
    }
}
```

Lưu ý: `valueOf("KHONG_TON_TAI")` sẽ ném lỗi nếu tên không khớp hằng số nào.

---

## Lỗi thường gặp

- **Ghi tên enum đầy đủ trong case của switch**: chỉ cần `case DO:`, không phải `case Mau.DO:`.
- **Gọi `valueOf` với chuỗi sai**: ném `IllegalArgumentException` nếu không khớp.
- **Lạm dụng `ordinal()`**: thứ tự có thể thay đổi nếu sắp xếp lại enum; nên dùng thuộc tính riêng thay vì dựa vào vị trí.
- **Quên dấu `;`** sau danh sách hằng số khi enum có thêm thuộc tính/phương thức.
- **So sánh enum bằng `equals` thay vì `==`**: cả hai đều đúng, nhưng `==` an toàn hơn (không lỗi null) và là cách khuyến nghị.

---

## Tóm tắt

- **Enum** là kiểu liệt kê: một tập hợp cố định các giá trị có tên.
- Dùng `enum` để khai báo; hằng số thường viết HOA.
- An toàn hơn dùng chuỗi/số: Java kiểm tra lúc biên dịch, không gõ nhầm được.
- Kết hợp tốt với `switch` (case không cần tên enum đầy đủ).
- Enum có thể mang **thuộc tính** và **phương thức**.
- Có sẵn `values()`, `valueOf()`, `name()`, `ordinal()`.
