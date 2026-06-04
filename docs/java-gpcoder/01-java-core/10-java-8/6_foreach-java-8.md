---
sidebar_position: 6
title: "Phương thức forEach() trong Java 8"
---

# Phương thức forEach() trong Java 8

## forEach() là gì?

`forEach()` là phương thức **default method** được thêm vào interface `Iterable` trong Java 8. Phương thức này nhận vào một `Consumer<T>` — một Functional Interface đại diện cho một hành động được thực hiện trên mỗi phần tử — và áp dụng hành động đó lên từng phần tử trong tập hợp.

Cú pháp:

```java
void forEach(Consumer<? super T> action)
```

## So sánh với vòng lặp truyền thống

```java
List<String> danhSach = Arrays.asList("An", "Bình", "Cường", "Dung");

// Cách 1: Vòng lặp for truyền thống
for (int i = 0; i < danhSach.size(); i++) {
    System.out.println(danhSach.get(i));
}

// Cách 2: Vòng lặp for-each (enhanced for)
for (String ten : danhSach) {
    System.out.println(ten);
}

// Cách 3: forEach() với Lambda - Java 8
danhSach.forEach(ten -> System.out.println(ten));

// Cách 4: forEach() với Method Reference - ngắn nhất
danhSach.forEach(System.out::println);
```

## forEach() với List

```java
import java.util.Arrays;
import java.util.List;

List<Integer> diemThi = Arrays.asList(8, 6, 9, 7, 5, 10);

// In điểm đạt (>= 5)
System.out.println("Điểm đạt:");
diemThi.forEach(diem -> {
    if (diem >= 5) {
        System.out.println("  - " + diem);
    }
});

// Tính tổng
int[] tong = {0}; // Dùng mảng để tham chiếu từ Lambda (effectively final)
diemThi.forEach(diem -> tong[0] += diem);
System.out.println("Tổng điểm: " + tong[0]); // 45
```

## forEach() với Map

`Map` không implement `Iterable` trực tiếp nên có phương thức `forEach()` riêng nhận vào `BiConsumer<K, V>` — Consumer với hai tham số (key và value).

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> diemMon = new HashMap<>();
diemMon.put("Toán", 9);
diemMon.put("Văn", 8);
diemMon.put("Anh", 7);
diemMon.put("Lý", 10);

// forEach với BiConsumer
diemMon.forEach((monHoc, diem) ->
    System.out.println(monHoc + ": " + diem + " điểm")
);

// Lọc và in điểm cao
System.out.println("\nMôn điểm cao (>= 9):");
diemMon.forEach((mon, diem) -> {
    if (diem >= 9) {
        System.out.println("  " + mon + " - " + diem);
    }
});
```

## forEach() với Set

```java
import java.util.HashSet;
import java.util.Set;

Set<String> ngoaiNgu = new HashSet<>();
ngoaiNgu.add("Tiếng Anh");
ngoaiNgu.add("Tiếng Nhật");
ngoaiNgu.add("Tiếng Trung");

ngoaiNgu.forEach(ngon -> System.out.println("- " + ngon));
```

## forEach() trong Stream

Trong Stream API, `forEach()` là một **terminal operation** (thao tác kết cuối) — nó tiêu thụ Stream và không trả về Stream mới.

```java
List<String> tenSV = Arrays.asList("nguyễn an", "trần bình", "lê cường");

// Kết hợp Stream với forEach
tenSV.stream()
     .map(ten -> ten.substring(0, 1).toUpperCase() + ten.substring(1))
     .sorted()
     .forEach(System.out::println);
// Lê cường
// Nguyễn an
// Trần bình
```

## Lưu ý quan trọng về biến trong forEach Lambda

Lambda trong `forEach()` chỉ được truy cập các biến **effectively final** (biến không thay đổi giá trị sau khi khởi tạo). Nếu cần thay đổi giá trị, dùng mảng một phần tử hoặc các lớp như `AtomicInteger`.

```java
List<Integer> soList = Arrays.asList(1, 2, 3, 4, 5);

// KHÔNG hợp lệ - biến tong bị thay đổi
// int tong = 0;
// soList.forEach(so -> tong += so); // LỖI BIÊN DỊCH!

// Cách 1: Dùng mảng
int[] tong1 = {0};
soList.forEach(so -> tong1[0] += so);
System.out.println("Tổng (mảng): " + tong1[0]); // 15

// Cách 2: Dùng AtomicInteger
import java.util.concurrent.atomic.AtomicInteger;
AtomicInteger tong2 = new AtomicInteger(0);
soList.forEach(so -> tong2.addAndGet(so));
System.out.println("Tổng (AtomicInteger): " + tong2.get()); // 15

// Cách tốt nhất: Dùng Stream reduce/sum
int tong3 = soList.stream().mapToInt(Integer::intValue).sum();
System.out.println("Tổng (Stream): " + tong3); // 15
```

## Khi nào nên dùng forEach()

- Khi cần duyệt qua tất cả phần tử và thực hiện một hành động (in, log, gửi email...).
- Khi muốn code ngắn gọn và theo phong cách hàm (functional style).
- Kết hợp với Stream khi cần lọc/biến đổi trước khi duyệt.

Nếu cần `break` hoặc `continue` trong vòng lặp, hãy dùng vòng lặp `for` truyền thống vì `forEach()` không hỗ trợ.
