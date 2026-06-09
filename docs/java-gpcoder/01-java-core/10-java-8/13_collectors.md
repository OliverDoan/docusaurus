---
sidebar_position: 13
title: "Lớp Collectors trong Java 8"
---

# Lớp Collectors trong Java 8

`Collectors` là lớp tiện ích trong Java 8 cung cấp các bộ thu thập (Collector) sẵn dùng cho phương thức `collect()` của Stream, giúp tổng hợp kết quả thành List, Set, Map hay nhóm và thống kê dữ liệu. Đây là công cụ cực kỳ mạnh khi xử lý dữ liệu theo phong cách hàm. Bài này giới thiệu các Collector thông dụng như `toList()`, `joining()`, `groupingBy()` và `partitioningBy()`.

## Collectors là gì?

`Collectors` là một lớp tiện ích (utility class) trong package `java.util.stream`, cung cấp các **Collector** sẵn dùng. **Collector** (bộ thu thập) là đối số truyền vào phương thức `collect()` của Stream, chỉ định cách tổng hợp và thu thập kết quả từ Stream.

```java
import java.util.stream.Collectors;

List<String> ketQua = stream.collect(Collectors.toList());
//                                   ^^^^^^^^^^^^^^^^^
//                                   Đây là Collector
```

## Các Collector thu thập vào Collection

### toList() — Thu thập thành List

```java
List<String> ten = Arrays.asList("An", "Bình", "Cường", "Dung");

List<String> daiHon2 = ten.stream()
    .filter(t -> t.length() > 2)
    .collect(Collectors.toList());
System.out.println(daiHon2); // [Bình, Cường, Dung]
```

### toSet() — Thu thập thành Set (loại bỏ trùng lặp)

```java
List<Integer> soTrung = Arrays.asList(1, 2, 2, 3, 3, 3, 4);

Set<Integer> duyNhat = soTrung.stream()
    .collect(Collectors.toSet());
System.out.println(duyNhat); // [1, 2, 3, 4] (thứ tự không đảm bảo)
```

### toMap() — Thu thập thành Map

```java
List<String> hoTen = Arrays.asList("An", "Bình", "Cường");

// key = tên, value = độ dài
Map<String, Integer> tenVaDoDai = hoTen.stream()
    .collect(Collectors.toMap(
        ten -> ten,           // keyMapper
        ten -> ten.length()  // valueMapper
    ));
System.out.println(tenVaDoDai); // {An=2, Bình=4, Cường=5}

// Xử lý trường hợp key trùng (mergeFunction)
List<String> coTrung = Arrays.asList("An", "Bình", "Anh");
Map<Integer, String> dodaiVaTen = coTrung.stream()
    .collect(Collectors.toMap(
        String::length,
        ten -> ten,
        (ten1, ten2) -> ten1 + ", " + ten2  // Gộp nếu key trùng
    ));
System.out.println(dodaiVaTen); // {2=An, 4=Bình, 3=Anh}
```

### toCollection() — Thu thập vào Collection tùy chỉnh

```java
// Thu thập vào LinkedList thay vì ArrayList mặc định
LinkedList<String> linkedList = ten.stream()
    .collect(Collectors.toCollection(LinkedList::new));

// Thu thập vào TreeSet (tự động sắp xếp)
TreeSet<String> sapXep = ten.stream()
    .collect(Collectors.toCollection(TreeSet::new));
System.out.println(sapXep); // [An, Bình, Cường, Dung]
```

## Collectors nối chuỗi

### joining() — Nối các String

```java
List<String> ten = Arrays.asList("An", "Bình", "Cường", "Dung");

// Nối không dấu phân cách
String noi = ten.stream().collect(Collectors.joining());
System.out.println(noi); // AnBìnhCườngDung

// Nối với dấu phân cách
String noiPhayVaCach = ten.stream().collect(Collectors.joining(", "));
System.out.println(noiPhayVaCach); // An, Bình, Cường, Dung

// Nối với tiền tố và hậu tố
String noiKhung = ten.stream().collect(Collectors.joining(", ", "[", "]"));
System.out.println(noiKhung); // [An, Bình, Cường, Dung]
```

## Collectors thống kê

### counting() — Đếm phần tử

```java
long soLuong = ten.stream()
    .filter(t -> t.length() > 2)
    .collect(Collectors.counting());
System.out.println(soLuong); // 3
```

### summingInt() / summingLong() / summingDouble() — Tính tổng

```java
List<Integer> diem = Arrays.asList(8, 9, 7, 6, 10);

int tongDiem = diem.stream()
    .collect(Collectors.summingInt(Integer::intValue));
System.out.println("Tổng: " + tongDiem); // 40
```

### averagingInt() — Tính trung bình

```java
double diemTB = diem.stream()
    .collect(Collectors.averagingInt(Integer::intValue));
System.out.println("Điểm TB: " + diemTB); // 8.0
```

### summarizingInt() — Tóm tắt thống kê

```java
IntSummaryStatistics thongKe = diem.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));

System.out.println("Số lượng: " + thongKe.getCount());  // 5
System.out.println("Tổng: " + thongKe.getSum());        // 40
System.out.println("Min: " + thongKe.getMin());         // 6
System.out.println("Max: " + thongKe.getMax());         // 10
System.out.println("TB: " + thongKe.getAverage());      // 8.0
```

## groupingBy() — Nhóm phần tử

Đây là một trong những Collector mạnh mẽ nhất, tương đương mệnh đề `GROUP BY` trong SQL.

```java
import java.util.*;
import java.util.stream.*;

public class NhomHocSinh {
    record HocSinh(String ten, String khoa, double diem) {}

    public static void main(String[] args) {
        List<HocSinh> dsHS = Arrays.asList(
            new HocSinh("An", "CNTT", 8.5),
            new HocSinh("Bình", "Toán", 9.0),
            new HocSinh("Cường", "CNTT", 7.5),
            new HocSinh("Dung", "Toán", 8.0),
            new HocSinh("Em", "CNTT", 9.5)
        );

        // Nhóm theo khoa
        Map<String, List<HocSinh>> nhomTheoKhoa =
            dsHS.stream().collect(Collectors.groupingBy(HocSinh::khoa));

        nhomTheoKhoa.forEach((khoa, svList) -> {
            System.out.println("Khoa " + khoa + ":");
            svList.forEach(sv -> System.out.println("  - " + sv.ten()));
        });

        // Nhóm theo khoa, lấy tên thành List
        Map<String, List<String>> tenTheoKhoa = dsHS.stream()
            .collect(Collectors.groupingBy(
                HocSinh::khoa,
                Collectors.mapping(HocSinh::ten, Collectors.toList())
            ));
        System.out.println(tenTheoKhoa);
        // {CNTT=[An, Cường, Em], Toán=[Bình, Dung]}

        // Nhóm và đếm
        Map<String, Long> soLuongTheoKhoa = dsHS.stream()
            .collect(Collectors.groupingBy(HocSinh::khoa, Collectors.counting()));
        System.out.println(soLuongTheoKhoa); // {CNTT=3, Toán=2}

        // Nhóm và tính điểm TB
        Map<String, Double> diemTBTheoKhoa = dsHS.stream()
            .collect(Collectors.groupingBy(
                HocSinh::khoa,
                Collectors.averagingDouble(HocSinh::diem)
            ));
        System.out.println(diemTBTheoKhoa); // {CNTT=8.5, Toán=8.5}
    }
}
```

## partitioningBy() — Phân vùng theo điều kiện

Phân chia Stream thành hai nhóm: `true` và `false`.

```java
List<Integer> soNguyen = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Map<Boolean, List<Integer>> chanLe = soNguyen.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

System.out.println("Chẵn: " + chanLe.get(true));   // [2, 4, 6, 8, 10]
System.out.println("Lẻ: " + chanLe.get(false));    // [1, 3, 5, 7, 9]
```

## Tóm tắt các Collector quan trọng

| Collector | Mô tả |
|---|---|
| `toList()` | Thu thập thành List |
| `toSet()` | Thu thập thành Set |
| `toMap(k, v)` | Thu thập thành Map |
| `joining(sep)` | Nối String |
| `counting()` | Đếm phần tử |
| `summingInt(f)` | Tính tổng |
| `averagingInt(f)` | Tính trung bình |
| `summarizingInt(f)` | Thống kê đầy đủ |
| `groupingBy(f)` | Nhóm phần tử |
| `partitioningBy(p)` | Phân vùng true/false |
