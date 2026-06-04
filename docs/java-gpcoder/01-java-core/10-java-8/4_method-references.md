---
sidebar_position: 4
title: "Phương thức tham chiếu trong Java 8 - Method References"
---

# Phương thức tham chiếu trong Java 8 - Method References

## Method Reference là gì?

**Method Reference** (tham chiếu phương thức) là cú pháp viết tắt của Lambda Expression khi Lambda chỉ gọi đúng một phương thức đã tồn tại. Thay vì viết `x -> obj.tenPhuongThuc(x)`, ta viết gọn thành `obj::tenPhuongThuc`.

Ký hiệu đặc trưng: dấu hai chấm đôi `::` (double colon).

## Tại sao dùng Method Reference?

```java
List<String> dsHoTen = Arrays.asList("Nguyễn An", "Trần Bình", "Lê Cường");

// Lambda - còn hơi dài
dsHoTen.forEach(ten -> System.out.println(ten));

// Method Reference - ngắn gọn, rõ ý hơn
dsHoTen.forEach(System.out::println);
```

## 4 loại Method Reference

### 1. Static Method Reference — Tham chiếu phương thức tĩnh

Cú pháp: `TenClass::tenPhuongThucTinh`

```java
import java.util.Arrays;
import java.util.List;

public class TienIch {
    public static void inChuaHoa(String s) {
        System.out.println(s.toUpperCase());
    }

    public static int soSanh(String a, String b) {
        return a.compareToIgnoreCase(b);
    }
}

public class Demo {
    public static void main(String[] args) {
        List<String> ten = Arrays.asList("bình", "an", "cường");

        // Lambda: ten -> TienIch.inChuaHoa(ten)
        ten.forEach(TienIch::inChuaHoa);
        // BÌNH, AN, CƯỜNG

        // Lambda: (a, b) -> TienIch.soSanh(a, b)
        ten.sort(TienIch::soSanh);
        System.out.println(ten); // [an, bình, cường]
    }
}
```

### 2. Instance Method Reference trên đối tượng cụ thể — Tham chiếu phương thức instance của một đối tượng xác định

Cú pháp: `doiTuong::tenPhuongThuc`

```java
public class InThongTin {
    private String tieuDe;

    public InThongTin(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public void in(String thongBao) {
        System.out.println("[" + tieuDe + "] " + thongBao);
    }
}

public class Demo {
    public static void main(String[] args) {
        InThongTin printer = new InThongTin("LOG");
        List<String> thongBao = Arrays.asList("Bắt đầu", "Xử lý", "Kết thúc");

        // Lambda: msg -> printer.in(msg)
        thongBao.forEach(printer::in);
        // [LOG] Bắt đầu
        // [LOG] Xử lý
        // [LOG] Kết thúc
    }
}
```

### 3. Instance Method Reference trên đối tượng tùy ý — Tham chiếu phương thức instance của kiểu tham số

Cú pháp: `TenClass::tenPhuongThucInstance`

Ở đây phương thức được gọi trên **chính đối tượng đang xử lý**, không phải một đối tượng ngoài.

```java
List<String> hoTen = Arrays.asList("Nguyễn An", "Trần Bình", "Lê Cường");

// Lambda: str -> str.toLowerCase()
hoTen.stream()
     .map(String::toLowerCase)
     .forEach(System.out::println);
// nguyễn an, trần bình, lê cường

// Sắp xếp: Lambda: (a, b) -> a.compareToIgnoreCase(b)
hoTen.sort(String::compareToIgnoreCase);
```

### 4. Constructor Reference — Tham chiếu constructor

Cú pháp: `TenClass::new`

```java
import java.util.function.Function;
import java.util.function.Supplier;

public class SinhVien {
    private String ten;

    public SinhVien() {
        this.ten = "Chưa đặt tên";
    }

    public SinhVien(String ten) {
        this.ten = ten;
    }

    @Override
    public String toString() {
        return "SinhVien{ten='" + ten + "'}";
    }
}

public class Demo {
    public static void main(String[] args) {
        // Supplier - constructor không tham số
        // Lambda: () -> new SinhVien()
        Supplier<SinhVien> taoMoi = SinhVien::new;
        SinhVien sv1 = taoMoi.get();
        System.out.println(sv1); // SinhVien{ten='Chưa đặt tên'}

        // Function - constructor có 1 tham số
        // Lambda: ten -> new SinhVien(ten)
        Function<String, SinhVien> taoVoiTen = SinhVien::new;
        SinhVien sv2 = taoVoiTen.apply("Nguyễn An");
        System.out.println(sv2); // SinhVien{ten='Nguyễn An'}

        // Tạo danh sách từ danh sách tên
        List<String> dsTen = Arrays.asList("An", "Bình", "Cường");
        List<SinhVien> dsSV = dsTen.stream()
            .map(SinhVien::new)
            .collect(Collectors.toList());
        dsSV.forEach(System.out::println);
    }
}
```

## Bảng tóm tắt 4 loại Method Reference

| Loại | Cú pháp | Lambda tương đương |
|---|---|---|
| Static method | `Class::staticMethod` | `(args) -> Class.staticMethod(args)` |
| Instance method (đối tượng cụ thể) | `obj::instanceMethod` | `(args) -> obj.instanceMethod(args)` |
| Instance method (đối tượng tùy ý) | `Class::instanceMethod` | `(obj, args) -> obj.instanceMethod(args)` |
| Constructor | `Class::new` | `(args) -> new Class(args)` |

## Khi nào nên dùng Method Reference?

Dùng Method Reference khi Lambda **chỉ gọi một phương thức duy nhất** và không có logic bổ sung. Nếu Lambda có xử lý thêm, hãy giữ nguyên Lambda để code rõ ràng hơn.

```java
// NÊN dùng Method Reference
lista.forEach(System.out::println);

// GIỮ Lambda khi có logic thêm
lista.forEach(item -> {
    if (item != null) {
        System.out.println(item.trim());
    }
});
```
