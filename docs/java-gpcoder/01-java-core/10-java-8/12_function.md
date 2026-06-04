---
sidebar_position: 12
title: "Function trong Java 8"
---

# Function trong Java 8

## Function là gì?

`Function<T, R>` là một **Functional Interface** (giao diện hàm) trong package `java.util.function`. Nó đại diện cho một hàm nhận vào **một đối số** kiểu `T` và **trả về kết quả** kiểu `R`. Đây là interface quan trọng nhất trong lập trình hàm với Java 8.

Phương thức trừu tượng duy nhất: `R apply(T t)`

```java
import java.util.function.Function;

// Chuyển String thành độ dài
Function<String, Integer> doDai = str -> str.length();

System.out.println(doDai.apply("Java"));     // 4
System.out.println(doDai.apply("Xin chào")); // 8
```

## Sử dụng Function cơ bản

```java
import java.util.function.Function;

public class VidFunction {
    public static void main(String[] args) {
        // String -> Integer
        Function<String, Integer> chuoiSangSo = Integer::parseInt;
        System.out.println(chuoiSangSo.apply("42") + 8); // 50

        // Integer -> String
        Function<Integer, String> soSangChuoi = n -> "Số: " + n;
        System.out.println(soSangChuoi.apply(100)); // Số: 100

        // Double -> String (định dạng)
        Function<Double, String> dinhDangTien = so ->
            String.format("%,.0f VNĐ", so);
        System.out.println(dinhDangTien.apply(1500000.0)); // 1,500,000 VNĐ
    }
}
```

## andThen() — Kết hợp tuần tự (f rồi g)

`andThen()` tạo ra một Function mới: áp dụng Function hiện tại trước, rồi áp dụng Function được truyền vào sau.

```java
Function<Integer, Integer> nhan2 = x -> x * 2;
Function<Integer, Integer> cong10 = x -> x + 10;

// andThen: nhan2 TRƯỚC, rồi cong10
Function<Integer, Integer> nhan2RoiCong10 = nhan2.andThen(cong10);
System.out.println(nhan2RoiCong10.apply(5)); // (5*2)+10 = 20

// Chuỗi nhiều Function
Function<String, String> xoaTrang = String::trim;
Function<String, String> chuanHoa = String::toLowerCase;
Function<String, String> vietHoaChuDau = str ->
    str.isEmpty() ? str : str.substring(0, 1).toUpperCase() + str.substring(1);

Function<String, String> xuLyTen = xoaTrang.andThen(chuanHoa).andThen(vietHoaChuDau);
System.out.println(xuLyTen.apply("  NGUYỄN AN  ")); // Nguyễn an
```

## compose() — Kết hợp ngược (g trước, rồi f)

`compose()` ngược với `andThen()`: áp dụng Function được truyền vào **trước**, rồi mới áp dụng Function hiện tại.

```java
Function<Integer, Integer> nhan2 = x -> x * 2;
Function<Integer, Integer> cong10 = x -> x + 10;

// compose: cong10 TRƯỚC, rồi nhan2
Function<Integer, Integer> cong10RoiNhan2 = nhan2.compose(cong10);
System.out.println(cong10RoiNhan2.apply(5)); // (5+10)*2 = 30

// So sánh: andThen vs compose
// nhan2.andThen(cong10).apply(5) = (5*2)+10 = 20
// nhan2.compose(cong10).apply(5) = (5+10)*2 = 30
```

## Function.identity() — Hàm đồng nhất

`Function.identity()` trả về một Function không biến đổi gì — nhận vào gì trả về đó. Hữu ích trong lập trình hàm khi cần truyền hàm mà không muốn thay đổi.

```java
Function<String, String> giuNguyen = Function.identity();
System.out.println(giuNguyen.apply("Java 8")); // Java 8

// Ứng dụng: Tạo Map từ List với key = value
List<String> ten = Arrays.asList("An", "Bình", "Cường");
Map<String, String> mapTen = ten.stream()
    .collect(Collectors.toMap(Function.identity(), Function.identity()));
System.out.println(mapTen); // {An=An, Bình=Bình, Cường=Cường}
```

## BiFunction — Function với hai tham số

`BiFunction<T, U, R>` nhận hai đối số và trả về một kết quả.

```java
import java.util.function.BiFunction;

BiFunction<String, Integer, String> lapLai = (str, n) -> str.repeat(n);
System.out.println(lapLai.apply("Ha", 3)); // HaHaHa

BiFunction<Integer, Integer, Integer> max = Integer::max;
System.out.println(max.apply(10, 20)); // 20

// andThen cho BiFunction
BiFunction<String, String, String> noi = (a, b) -> a + " " + b;
Function<String, String> chuanHoa = String::toUpperCase;

// noi trước, rồi chuanHoa
var noiVaChuanHoa = noi.andThen(chuanHoa);
System.out.println(noiVaChuanHoa.apply("xin", "chào")); // XIN CHÀO
```

## UnaryOperator và BinaryOperator

Đây là các dạng rút gọn khi kiểu đầu vào và đầu ra **giống nhau**:

- `UnaryOperator<T>` mở rộng `Function<T, T>` — một tham số
- `BinaryOperator<T>` mở rộng `BiFunction<T, T, T>` — hai tham số cùng kiểu

```java
import java.util.function.UnaryOperator;
import java.util.function.BinaryOperator;

UnaryOperator<String> chuanHoa = str -> str.trim().toLowerCase();
System.out.println(chuanHoa.apply("  JAVA  ")); // java

BinaryOperator<Integer> cong = (a, b) -> a + b;
System.out.println(cong.apply(5, 3)); // 8

BinaryOperator<String> noiChuoi = String::concat;
System.out.println(noiChuoi.apply("Xin ", "chào")); // Xin chào
```

## Ví dụ thực tế — Pipeline xử lý dữ liệu

```java
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class PipelineXuLy {
    record HocSinh(String tenGoc, int diem) {}
    record KetQua(String tenChuanHoa, String xepLoai) {}

    public static void main(String[] args) {
        List<HocSinh> dshS = Arrays.asList(
            new HocSinh("  nguyen an  ", 85),
            new HocSinh("TRAN BINH", 62),
            new HocSinh("Le Cuong  ", 95)
        );

        // Các Function độc lập, tái sử dụng được
        Function<String, String> chuanHoaTen = ten ->
            Arrays.stream(ten.trim().toLowerCase().split("\\s+"))
                  .map(t -> t.substring(0, 1).toUpperCase() + t.substring(1))
                  .collect(Collectors.joining(" "));

        Function<Integer, String> xepLoai = diem -> {
            if (diem >= 90) return "Xuất sắc";
            if (diem >= 80) return "Giỏi";
            if (diem >= 65) return "Khá";
            return "Trung bình";
        };

        // Áp dụng pipeline
        List<KetQua> ketQua = dshS.stream()
            .map(hs -> new KetQua(
                chuanHoaTen.apply(hs.tenGoc()),
                xepLoai.apply(hs.diem())
            ))
            .collect(Collectors.toList());

        ketQua.forEach(kq ->
            System.out.println(kq.tenChuanHoa() + " - " + kq.xepLoai())
        );
        // Nguyen An - Giỏi
        // Tran Binh - Trung bình
        // Le Cuong - Xuất sắc
    }
}
```

## Tóm tắt các biến thể của Function

| Interface | Tham số | Trả về | Phương thức |
|---|---|---|---|
| `Function<T,R>` | T | R | `apply(T)` |
| `BiFunction<T,U,R>` | T, U | R | `apply(T, U)` |
| `UnaryOperator<T>` | T | T | `apply(T)` |
| `BinaryOperator<T>` | T, T | T | `apply(T, T)` |
| `IntFunction<R>` | int | R | `apply(int)` |
| `ToIntFunction<T>` | T | int | `applyAsInt(T)` |
