---
sidebar_position: 1
title: "Giới thiệu Java 8"
---

# Giới thiệu Java 8

Java 8 (phát hành tháng 3 năm 2014) là một trong những phiên bản quan trọng nhất trong lịch sử ngôn ngữ Java. Phiên bản này mang đến hàng loạt tính năng mới, đặc biệt là hỗ trợ lập trình hàm (functional programming) — một mô hình lập trình tập trung vào việc xử lý dữ liệu thông qua các hàm thuần túy (pure functions).

## Các tính năng nổi bật trong Java 8

### 1. Lambda Expression (Biểu thức Lambda)

Lambda Expression cho phép viết các hàm ẩn danh (anonymous function) ngắn gọn hơn, thay thế cho Anonymous Class khi làm việc với Functional Interface.

```java
// Trước Java 8 - dùng Anonymous Class
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Chạy trước Java 8");
    }
};

// Java 8 - dùng Lambda
Runnable r2 = () -> System.out.println("Chạy với Lambda");
```

### 2. Functional Interface (Giao diện hàm)

Functional Interface là interface chỉ có **một phương thức trừu tượng** duy nhất. Java 8 cung cấp sẵn nhiều Functional Interface trong package `java.util.function` như `Predicate<T>`, `Function<T,R>`, `Consumer<T>`, `Supplier<T>`.

### 3. Stream API

Stream API cho phép xử lý tập hợp dữ liệu (Collection) theo phong cách khai báo (declarative), hỗ trợ xử lý tuần tự và song song.

```java
List<String> names = Arrays.asList("An", "Bình", "Cường", "Dung");

// Lọc tên có độ dài > 2 ký tự, chuyển hoa, sắp xếp
List<String> result = names.stream()
    .filter(name -> name.length() > 2)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());

System.out.println(result); // [BÌNH, CƯỜNG, DUNG]
```

### 4. Default Method và Static Method trong Interface

Java 8 cho phép Interface có phương thức với phần thân (body) thông qua `default` và `static` keyword, giúp mở rộng interface mà không làm vỡ (break) các lớp đã implement.

```java
interface Chao {
    default void xinChao() {
        System.out.println("Xin chào từ Interface!");
    }

    static void tamBiet() {
        System.out.println("Tạm biệt từ Interface!");
    }
}
```

### 5. Optional

`Optional<T>` là một lớp bao (wrapper class) giúp tránh lỗi `NullPointerException` bằng cách biểu diễn rõ ràng khả năng một giá trị có thể vắng mặt (absent).

```java
Optional<String> ten = Optional.ofNullable(layTenTuDatabase());
ten.ifPresent(t -> System.out.println("Tên: " + t));
```

### 6. Method Reference (Tham chiếu phương thức)

Method Reference là cú pháp ngắn gọn của Lambda khi Lambda chỉ gọi đúng một phương thức đã tồn tại.

```java
List<String> ds = Arrays.asList("An", "Bình", "Cường");

// Lambda
ds.forEach(ten -> System.out.println(ten));

// Method Reference - ngắn gọn hơn
ds.forEach(System.out::println);
```

### 7. Date/Time API mới

Package `java.time` (dựa trên thư viện Joda-Time) thay thế cho `java.util.Date` và `java.util.Calendar` vốn có nhiều bất cập.

```java
LocalDate homNay = LocalDate.now();
LocalDate sinhNhat = LocalDate.of(2000, Month.JANUARY, 15);
long tuoi = ChronoUnit.YEARS.between(sinhNhat, homNay);
System.out.println("Tuổi: " + tuoi);
```

### 8. Base64 Encoding/Decoding

Java 8 tích hợp sẵn lớp `java.util.Base64` để mã hóa và giải mã Base64 — một định dạng mã hóa nhị phân-sang-văn-bản (binary-to-text encoding) phổ biến.

```java
String goc = "Xin chào Java 8!";
String encoded = Base64.getEncoder().encodeToString(goc.getBytes());
String decoded = new String(Base64.getDecoder().decode(encoded));
System.out.println("Mã hóa: " + encoded);
System.out.println("Giải mã: " + decoded);
```

### 9. forEach() trong Collection

Phương thức `forEach()` được thêm vào interface `Iterable` giúp duyệt phần tử theo phong cách hàm.

```java
Map<String, Integer> diemSo = new HashMap<>();
diemSo.put("An", 9);
diemSo.put("Bình", 8);
diemSo.forEach((ten, diem) -> System.out.println(ten + ": " + diem));
```

## Tóm tắt

| Tính năng | Mục đích chính |
|---|---|
| Lambda Expression | Viết code ngắn gọn, biểu thị hàm ẩn danh |
| Functional Interface | Nền tảng cho Lambda, định nghĩa kiểu hàm |
| Stream API | Xử lý tập hợp dữ liệu theo phong cách khai báo |
| Default/Static Method | Mở rộng Interface không phá vỡ code cũ |
| Optional | Xử lý an toàn giá trị null |
| Method Reference | Cú pháp ngắn hơn Lambda |
| Date/Time API | API ngày giờ hiện đại, an toàn với đa luồng |
| Base64 | Mã hóa/giải mã tích hợp sẵn |

Java 8 đánh dấu bước chuyển mình lớn của Java sang lập trình hàm, giúp code ngắn gọn hơn, dễ đọc hơn và ít lỗi hơn.
