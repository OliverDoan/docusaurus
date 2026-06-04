---
sidebar_position: 10
title: "Consumer trong Java 8"
---

# Consumer trong Java 8

## Consumer là gì?

`Consumer<T>` là một **Functional Interface** (giao diện hàm) trong package `java.util.function`. Nó đại diện cho một **hành động** nhận vào một đối số kiểu `T` và **không trả về kết quả** (void). Cái tên "Consumer" (người tiêu thụ) phản ánh đúng bản chất: nhận dữ liệu vào để xử lý, không cho ra giá trị mới.

Phương thức trừu tượng duy nhất: `void accept(T t)`

```java
import java.util.function.Consumer;

Consumer<String> inRa = ten -> System.out.println("Tên: " + ten);

inRa.accept("Nguyễn An");   // Tên: Nguyễn An
inRa.accept("Trần Bình");   // Tên: Trần Bình
```

## Sử dụng Consumer cơ bản

```java
import java.util.function.Consumer;

public class VidConsumer {
    public static void main(String[] args) {
        // Consumer in thông tin
        Consumer<String> inHoa = str -> System.out.println(str.toUpperCase());
        inHoa.accept("xin chào java 8"); // XIN CHÀO JAVA 8

        // Consumer xử lý số
        Consumer<Integer> inBinhPhuong = n -> System.out.println(n + "^2 = " + (n * n));
        inBinhPhuong.accept(5);  // 5^2 = 25
        inBinhPhuong.accept(7);  // 7^2 = 49

        // Consumer cập nhật đối tượng
        Consumer<StringBuilder> them3ChamHoi = sb -> sb.append("!!!");
        StringBuilder sb = new StringBuilder("Xin chào");
        them3ChamHoi.accept(sb);
        System.out.println(sb); // Xin chào!!!
    }
}
```

## Phương thức andThen() — Chuỗi Consumer

`andThen()` cho phép nối nhiều Consumer lại: Consumer đầu tiên chạy xong, Consumer thứ hai mới chạy với **cùng đối số ban đầu**.

```java
import java.util.function.Consumer;

Consumer<String> inGoc = str -> System.out.println("Gốc: " + str);
Consumer<String> inHoa = str -> System.out.println("Hoa: " + str.toUpperCase());
Consumer<String> inDoDai = str -> System.out.println("Độ dài: " + str.length());

// Kết hợp thành chuỗi
Consumer<String> xuLyHoanChinh = inGoc.andThen(inHoa).andThen(inDoDai);
xuLyHoanChinh.accept("java");
// Gốc: java
// Hoa: JAVA
// Độ dài: 4
```

## Consumer với forEach()

Consumer thường dùng nhất với phương thức `forEach()` của Collection và Stream.

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;

List<String> danhSach = Arrays.asList("An", "Bình", "Cường", "Dung");

// Method Reference - ngắn gọn nhất
danhSach.forEach(System.out::println);

// Consumer tùy chỉnh
Consumer<String> inCoKhung = ten -> System.out.println("| " + ten + " |");
danhSach.forEach(inCoKhung);
// | An |
// | Bình |
// | Cường |
// | Dung |
```

## Ví dụ thực tế — Gửi thông báo

```java
import java.util.*;
import java.util.function.Consumer;

public class HeThongThongBao {
    record NguoiDung(String ten, String email, boolean nhanEmail) {}

    public static void main(String[] args) {
        List<NguoiDung> dsDung = Arrays.asList(
            new NguoiDung("An", "an@email.com", true),
            new NguoiDung("Bình", "binh@email.com", false),
            new NguoiDung("Cường", "cuong@email.com", true)
        );

        // Consumer gửi email
        Consumer<NguoiDung> guiEmail = nguoi ->
            System.out.println("Gửi email đến: " + nguoi.email());

        // Consumer ghi log
        Consumer<NguoiDung> ghiLog = nguoi ->
            System.out.println("[LOG] Đã xử lý: " + nguoi.ten());

        // Kết hợp: gửi email rồi ghi log
        Consumer<NguoiDung> xuLy = guiEmail.andThen(ghiLog);

        // Chỉ xử lý người dùng đồng ý nhận email
        dsDung.stream()
              .filter(NguoiDung::nhanEmail)
              .forEach(xuLy);
        // Gửi email đến: an@email.com
        // [LOG] Đã xử lý: An
        // Gửi email đến: cuong@email.com
        // [LOG] Đã xử lý: Cường
    }
}
```

## Consumer như tham số phương thức

```java
public static <T> void xuLyDanhSach(List<T> danhSach, Consumer<T> hanh) {
    for (T phanTu : danhSach) {
        hanh.accept(phanTu);
    }
}

// Sử dụng linh hoạt
xuLyDanhSach(Arrays.asList(1, 2, 3), n -> System.out.println(n * n));
xuLyDanhSach(Arrays.asList("a", "b"), String::toUpperCase); // Không hiện gì do không in
```

## BiConsumer — Consumer với hai tham số

`BiConsumer<T, U>` nhận vào hai đối số, không trả về giá trị. Hay dùng với `Map.forEach()`.

```java
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;

Map<String, Integer> diemSo = new HashMap<>();
diemSo.put("Toán", 9);
diemSo.put("Lý", 8);
diemSo.put("Hóa", 7);

BiConsumer<String, Integer> inDiem = (monHoc, diem) ->
    System.out.println(monHoc + ": " + diem + " điểm");

// Gọi trực tiếp
inDiem.accept("Văn", 10); // Văn: 10 điểm

// Dùng với Map.forEach()
diemSo.forEach(inDiem);
// Toán: 9 điểm
// Lý: 8 điểm
// Hóa: 7 điểm

// andThen với BiConsumer
BiConsumer<String, Integer> ghiLog = (mon, diem) ->
    System.out.println("[LOG] Đã lưu: " + mon);
diemSo.forEach(inDiem.andThen(ghiLog));
```

## So sánh Consumer với Functional Interface khác

| Interface | Tham số | Trả về | Dùng khi |
|---|---|---|---|
| `Consumer<T>` | T | void | Thực hiện hành động, không cần kết quả |
| `Function<T,R>` | T | R | Biến đổi dữ liệu, cần kết quả |
| `Predicate<T>` | T | boolean | Kiểm tra điều kiện |
| `Supplier<T>` | không có | T | Cung cấp dữ liệu |
