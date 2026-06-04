---
sidebar_position: 11
title: "Supplier trong Java 8"
---

# Supplier trong Java 8

## Supplier là gì?

`Supplier<T>` là một **Functional Interface** (giao diện hàm) trong package `java.util.function`. Ngược hoàn toàn với `Consumer`, `Supplier` (người cung cấp) **không nhận tham số** nhưng **trả về một giá trị** kiểu `T`.

Phương thức trừu tượng duy nhất: `T get()`

```java
import java.util.function.Supplier;

Supplier<String> loiChao = () -> "Xin chào Java 8!";
System.out.println(loiChao.get()); // Xin chào Java 8!

Supplier<Double> soNgauNhien = () -> Math.random();
System.out.println(soNgauNhien.get()); // Số ngẫu nhiên, ví dụ: 0.7234
```

## Sử dụng Supplier cơ bản

```java
import java.util.function.Supplier;
import java.time.LocalDateTime;

public class VidSupplier {
    public static void main(String[] args) {
        // Supplier trả về thời gian hiện tại
        Supplier<LocalDateTime> thoiGianHienTai = LocalDateTime::now;
        System.out.println("Giờ hiện tại: " + thoiGianHienTai.get());

        // Supplier tạo đối tượng mới
        Supplier<StringBuilder> taoSB = StringBuilder::new;
        StringBuilder sb = taoSB.get();
        sb.append("Xin chào");
        System.out.println(sb); // Xin chào

        // Supplier trả về hằng số
        Supplier<Double> pi = () -> Math.PI;
        System.out.printf("Pi = %.5f%n", pi.get()); // Pi = 3.14159
    }
}
```

## Lazy Initialization (Khởi tạo lười biếng)

Một trong những ứng dụng quan trọng nhất của `Supplier` là **Lazy Initialization** — trì hoãn việc tạo đối tượng cho đến khi thực sự cần. Điều này hữu ích khi việc khởi tạo tốn kém tài nguyên.

```java
import java.util.function.Supplier;

public class KetNoiDatabase {
    private Supplier<KetNoi> nhaKetNoi;
    private KetNoi ketNoi; // Cache

    // Nhận Supplier thay vì tạo kết nối ngay
    public KetNoiDatabase(Supplier<KetNoi> nhaKetNoi) {
        this.nhaKetNoi = nhaKetNoi;
        // Kết nối CHƯA được tạo ở đây!
    }

    // Kết nối chỉ được tạo khi lần đầu gọi
    public KetNoi layKetNoi() {
        if (ketNoi == null) {
            System.out.println("Tạo kết nối mới...");
            ketNoi = nhaKetNoi.get();
        }
        return ketNoi;
    }
}
```

## Supplier với Optional

`Optional` kết hợp với `Supplier` trong phương thức `orElseGet()`. Đây là cách hiệu quả hơn `orElse()` vì Supplier chỉ được gọi khi Optional **thực sự rỗng**.

```java
import java.util.Optional;
import java.util.function.Supplier;

String tenTuDB = null; // Giả sử không tìm thấy trong database

// orElse() - luôn tính giá trị mặc định dù Optional có hay không
String ten1 = Optional.ofNullable(tenTuDB)
    .orElse(layTenMacDinh()); // layTenMacDinh() LUÔN được gọi

// orElseGet() - chỉ gọi Supplier khi Optional rỗng (hiệu quả hơn!)
String ten2 = Optional.ofNullable(tenTuDB)
    .orElseGet(() -> layTenMacDinh()); // Chỉ gọi khi cần

// orElseThrow() - ném ngoại lệ từ Supplier khi Optional rỗng
String ten3 = Optional.ofNullable(tenTuDB)
    .orElseThrow(() -> new RuntimeException("Không tìm thấy tên!"));
```

## Supplier tạo Factory (Nhà máy tạo đối tượng)

```java
import java.util.function.Supplier;
import java.util.HashMap;
import java.util.Map;

public class NhaMayHinhDang {
    interface HinhDang {
        double dienTich();
        String tenHinh();
    }

    record HinhTron(double banKinh) implements HinhDang {
        public double dienTich() { return Math.PI * banKinh * banKinh; }
        public String tenHinh() { return "Hình tròn (r=" + banKinh + ")"; }
    }

    record HinhVuong(double canh) implements HinhDang {
        public double dienTich() { return canh * canh; }
        public String tenHinh() { return "Hình vuông (a=" + canh + ")"; }
    }

    public static void main(String[] args) {
        // Map lưu Supplier cho từng loại hình
        Map<String, Supplier<HinhDang>> nhaMay = new HashMap<>();
        nhaMay.put("tron", () -> new HinhTron(5.0));
        nhaMay.put("vuong", () -> new HinhVuong(4.0));

        // Tạo hình theo yêu cầu
        String loai = "tron";
        HinhDang hinh = nhaMay.getOrDefault(loai,
            () -> { throw new IllegalArgumentException("Không biết loại: " + loai); }
        ).get();

        System.out.println(hinh.tenHinh());
        System.out.printf("Diện tích: %.2f%n", hinh.dienTich());
        // Hình tròn (r=5.0)
        // Diện tích: 78.54
    }
}
```

## Supplier trong thông báo lỗi có điều kiện

```java
import java.util.Objects;
import java.util.function.Supplier;

// Thông báo lỗi phức tạp chỉ được tính khi thực sự lỗi
public static void kiemTraKhongNull(Object obj, Supplier<String> thongBaoLoi) {
    if (obj == null) {
        throw new IllegalArgumentException(thongBaoLoi.get());
    }
}

// Sử dụng
String ten = null;
kiemTraKhongNull(ten, () -> "Tên không được để trống! Nhận được: " + ten);

// Tương tự với Objects.requireNonNull()
Objects.requireNonNull(ten, () -> "Tên không hợp lệ: " + ten);
```

## Các Supplier nguyên thủy (Primitive Suppliers)

Java 8 cung cấp các biến thể tối ưu cho kiểu nguyên thủy, tránh boxing/unboxing (đóng gói/mở gói) không cần thiết:

| Interface | Phương thức | Trả về |
|---|---|---|
| `BooleanSupplier` | `getAsBoolean()` | boolean |
| `IntSupplier` | `getAsInt()` | int |
| `LongSupplier` | `getAsLong()` | long |
| `DoubleSupplier` | `getAsDouble()` | double |

```java
import java.util.function.IntSupplier;

IntSupplier soNgauNhienNho = () -> (int)(Math.random() * 100);
System.out.println(soNgauNhienNho.getAsInt()); // Ví dụ: 42
```

## Tóm tắt

- `Supplier<T>` không nhận tham số, trả về `T` qua phương thức `get()`.
- Dùng cho **lazy initialization** — tạo đối tượng khi cần, không tạo sẵn.
- Kết hợp tốt với `Optional.orElseGet()` và `Optional.orElseThrow()`.
- Dùng để tạo **factory** linh hoạt, cung cấp giá trị mặc định theo ngữ cảnh.
