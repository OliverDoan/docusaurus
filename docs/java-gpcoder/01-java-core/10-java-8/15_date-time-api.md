---
sidebar_position: 15
title: "Date Time API trong Java 8"
---

# Date Time API trong Java 8

## Tại sao cần Date/Time API mới?

Trước Java 8, `java.util.Date` và `java.util.Calendar` có nhiều vấn đề nghiêm trọng:
- **Không thread-safe** (không an toàn với đa luồng) — dùng chung một instance có thể gây lỗi.
- **Thiết kế kỳ lạ** — tháng bắt đầu từ 0 (tháng 1 = 0), năm tính từ 1900.
- **Mutable** (có thể thay đổi) — nguy hiểm khi truyền vào phương thức.
- API khó dùng, tên phương thức không nhất quán.

Java 8 giới thiệu package `java.time` (dựa trên thư viện Joda-Time phổ biến), giải quyết toàn bộ các vấn đề trên.

## Các lớp chính trong java.time

### LocalDate — Chỉ ngày, không có giờ và múi giờ

```java
import java.time.LocalDate;
import java.time.Month;

// Ngày hiện tại
LocalDate homNay = LocalDate.now();
System.out.println(homNay); // 2024-01-15

// Tạo ngày cụ thể
LocalDate sinNhat = LocalDate.of(2000, Month.MARCH, 20);
LocalDate ngay = LocalDate.of(2024, 1, 15); // Dùng số

// Lấy thành phần
System.out.println(homNay.getYear());       // 2024
System.out.println(homNay.getMonthValue()); // 1
System.out.println(homNay.getDayOfMonth()); // 15
System.out.println(homNay.getDayOfWeek());  // MONDAY
System.out.println(homNay.getDayOfYear());  // 15
```

### LocalTime — Chỉ giờ, không có ngày và múi giờ

```java
import java.time.LocalTime;

LocalTime gioHienTai = LocalTime.now();
System.out.println(gioHienTai); // 14:30:25.123456789

LocalTime gio = LocalTime.of(9, 30, 0); // 09:30:00
System.out.println(gio.getHour());   // 9
System.out.println(gio.getMinute()); // 30
System.out.println(gio.getSecond()); // 0

// Kiểm tra trước/sau
LocalTime kinhDoanh = LocalTime.of(8, 0);
LocalTime dongCua = LocalTime.of(17, 30);
boolean dangMoCua = gioHienTai.isAfter(kinhDoanh) && gioHienTai.isBefore(dongCua);
```

### LocalDateTime — Ngày và giờ, không có múi giờ

```java
import java.time.LocalDateTime;

LocalDateTime bayGio = LocalDateTime.now();
System.out.println(bayGio); // 2024-01-15T14:30:25.123

LocalDateTime cuocHen = LocalDateTime.of(2024, 3, 20, 10, 0);
System.out.println(cuocHen); // 2024-03-20T10:00

// Tách ngày và giờ
LocalDate phanNgay = bayGio.toLocalDate();
LocalTime phanGio = bayGio.toLocalTime();
```

### ZonedDateTime — Ngày giờ với múi giờ (time zone)

```java
import java.time.ZonedDateTime;
import java.time.ZoneId;

// Múi giờ Việt Nam
ZonedDateTime vnTime = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
System.out.println(vnTime);

// Chuyển đổi múi giờ
ZonedDateTime tokyoTime = vnTime.withZoneSameInstant(ZoneId.of("Asia/Tokyo"));
System.out.println("Việt Nam: " + vnTime.toLocalTime());
System.out.println("Tokyo: " + tokyoTime.toLocalTime());

// Liệt kê các múi giờ
ZoneId.getAvailableZoneIds().stream()
    .filter(z -> z.contains("Asia"))
    .sorted()
    .limit(5)
    .forEach(System.out::println);
```

## Tính toán với ngày giờ

### plus() và minus() — Cộng/trừ

```java
LocalDate homNay = LocalDate.of(2024, 1, 15);

LocalDate tuanToi = homNay.plusWeeks(1);
System.out.println(tuanToi); // 2024-01-22

LocalDate namTruoc = homNay.minusYears(1);
System.out.println(namTruoc); // 2023-01-15

LocalDateTime gap3Gio = LocalDateTime.now().plusHours(3).plusMinutes(30);
```

### Period — Khoảng thời gian theo ngày/tháng/năm

```java
import java.time.Period;
import java.time.LocalDate;

LocalDate sinhNhat = LocalDate.of(2000, 3, 20);
LocalDate homNay = LocalDate.of(2024, 1, 15);

Period tuoi = Period.between(sinhNhat, homNay);
System.out.println("Tuổi: " + tuoi.getYears() + " tuổi "
    + tuoi.getMonths() + " tháng "
    + tuoi.getDays() + " ngày");
// Tuổi: 23 tuổi 9 tháng 26 ngày

// Tạo Period trực tiếp
Period p = Period.of(1, 6, 0); // 1 năm 6 tháng
LocalDate ngayKT = homNay.plus(p);
```

### Duration — Khoảng thời gian theo giây/nano giây

```java
import java.time.Duration;
import java.time.LocalTime;

LocalTime batDau = LocalTime.of(9, 0);
LocalTime ketThuc = LocalTime.of(17, 30);

Duration lamViec = Duration.between(batDau, ketThuc);
System.out.println("Thời gian làm việc: " + lamViec.toHours() + " giờ "
    + lamViec.toMinutesPart() + " phút");
// Thời gian làm việc: 8 giờ 30 phút
```

### ChronoUnit — Đơn vị thời gian chuẩn

```java
import java.time.temporal.ChronoUnit;

LocalDate homNay = LocalDate.now();
LocalDate tetNguyenDan = LocalDate.of(2025, 1, 29);

long ngayConLai = ChronoUnit.DAYS.between(homNay, tetNguyenDan);
System.out.println("Còn " + ngayConLai + " ngày đến Tết");

long gio = ChronoUnit.HOURS.between(LocalTime.of(8, 0), LocalTime.of(17, 30));
System.out.println("Số giờ: " + gio); // 9
```

## Định dạng và phân tích ngày giờ

```java
import java.time.format.DateTimeFormatter;

LocalDate ngay = LocalDate.of(2024, 1, 15);
LocalDateTime thoiGian = LocalDateTime.now();

// Định dạng tùy chỉnh
DateTimeFormatter dinhDang = DateTimeFormatter.ofPattern("dd/MM/yyyy");
String chuoi = ngay.format(dinhDang);
System.out.println(chuoi); // 15/01/2024

DateTimeFormatter dinhDangDayDu = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
System.out.println(thoiGian.format(dinhDangDayDu)); // 15/01/2024 14:30:25

// Phân tích từ chuỗi (parse)
String chuoiNgay = "20/03/2000";
LocalDate daNgay = LocalDate.parse(chuoiNgay,
    DateTimeFormatter.ofPattern("dd/MM/yyyy"));
System.out.println(daNgay); // 2000-03-20

// Định dạng có sẵn
System.out.println(ngay.format(DateTimeFormatter.ISO_DATE)); // 2024-01-15
System.out.println(ngay.format(DateTimeFormatter.BASIC_ISO_DATE)); // 20240115
```

## Instant — Thời điểm tuyệt đối (Unix timestamp)

`Instant` đại diện cho một thời điểm chính xác trên trục thời gian UTC, tính bằng mili giây từ 01/01/1970 (Unix epoch). Thường dùng để log, lưu trữ, đo thời gian thực thi.

```java
import java.time.Instant;

Instant batDau = Instant.now();
// ... thực hiện tác vụ ...
Thread.sleep(100); // Mô phỏng tác vụ 100ms
Instant ketThuc = Instant.now();

long ms = ketThuc.toEpochMilli() - batDau.toEpochMilli();
System.out.println("Thời gian thực thi: " + ms + "ms");

// Chuyển đổi
long epochMs = Instant.now().toEpochMilli();
Instant tuEpoch = Instant.ofEpochMilli(epochMs);
```

## Tóm tắt các lớp trong java.time

| Lớp | Mô tả |
|---|---|
| `LocalDate` | Ngày (yyyy-MM-dd), không có giờ/múi giờ |
| `LocalTime` | Giờ (HH:mm:ss), không có ngày/múi giờ |
| `LocalDateTime` | Ngày và giờ, không có múi giờ |
| `ZonedDateTime` | Ngày, giờ và múi giờ |
| `Instant` | Thời điểm UTC tuyệt đối |
| `Period` | Khoảng thời gian theo năm/tháng/ngày |
| `Duration` | Khoảng thời gian theo giây/nano giây |
| `DateTimeFormatter` | Định dạng và phân tích ngày giờ |
