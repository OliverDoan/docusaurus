---
sidebar_position: 2
title: "2. Date and Time API (Java 8+)"
---

# Date and Time API -- Xử lý ngày giờ trong Java

Trước Java 8, làm việc với ngày giờ trong Java là "ác mộng" -- `Date`, `Calendar` khó dùng, không thread-safe, dễ sai. Java 8 giới thiệu **`java.time`** dựa trên Joda-Time -- hiện đại, an toàn, dễ dùng.

**Tương tự đơn giản:** Hãy tưởng tượng bạn đặt vé máy bay. Bạn cần:

- **LocalDate** -- chỉ ngày (ngày khởi hành)
- **LocalTime** -- chỉ giờ (giờ bay)
- **LocalDateTime** -- ngày + giờ (giờ địa phương)
- **ZonedDateTime** -- ngày + giờ + múi giờ (giờ Tokyo, giờ Việt Nam)
- **Instant** -- một mốc thời gian tuyệt đối (timestamp)

Mỗi loại cho một tình huống cụ thể.

---

## Mục lục

- [1. Các class chính trong java.time](#1-các-class-chính-trong-javatime)
- [2. LocalDate, LocalTime, LocalDateTime](#2-localdate-localtime-localdatetime)
- [3. ZonedDateTime và múi giờ](#3-zoneddatetime-và-múi-giờ)
- [4. Instant](#4-instant)
- [5. Duration và Period](#5-duration-và-period)
- [6. Format và Parse](#6-format-và-parse)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Các class chính trong java.time

| Class           | Mục đích                                          |
| --------------- | ------------------------------------------------- |
| `LocalDate`     | Ngày (không giờ, không múi giờ): 2026-05-28       |
| `LocalTime`     | Giờ (không ngày): 14:30:00                        |
| `LocalDateTime` | Ngày + giờ (không múi giờ)                        |
| `ZonedDateTime` | Ngày + giờ + múi giờ                              |
| `OffsetDateTime`| Ngày + giờ + offset (+07:00)                      |
| `Instant`       | Mốc thời gian UTC (timestamp)                     |
| `Duration`      | Khoảng thời gian (giờ, phút, giây)                |
| `Period`        | Khoảng thời gian (năm, tháng, ngày)               |

**Tất cả đều immutable và thread-safe.**

---

## 2. LocalDate, LocalTime, LocalDateTime

### LocalDate

```java
import java.time.LocalDate;
import java.time.Month;

public class LocalDateDemo {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalDate specific = LocalDate.of(2026, Month.MAY, 28);
        LocalDate fromString = LocalDate.parse("2026-05-28");

        System.out.println(today);                         // 2026-05-28
        System.out.println(today.getDayOfWeek());          // THURSDAY
        System.out.println(today.getMonth());              // MAY
        System.out.println(today.isLeapYear());            // false
        System.out.println(today.plusDays(7));             // +7 ngay
        System.out.println(today.minusMonths(1));          // -1 thang
        System.out.println(today.withYear(2030));          // Doi nam
    }
}
```

### LocalTime

```java
import java.time.LocalTime;

LocalTime now = LocalTime.now();
LocalTime specific = LocalTime.of(14, 30, 0);

System.out.println(now.plusHours(2));
System.out.println(now.isBefore(specific));
```

### LocalDateTime

```java
import java.time.LocalDateTime;

LocalDateTime now = LocalDateTime.now();
LocalDateTime specific = LocalDateTime.of(2026, 5, 28, 14, 30);

System.out.println(now.plusDays(1).plusHours(2));
System.out.println(now.toLocalDate());  // Lay phan date
System.out.println(now.toLocalTime());  // Lay phan time
```

---

## 3. ZonedDateTime và múi giờ

```java
import java.time.*;

public class ZoneDemo {
    public static void main(String[] args) {
        ZonedDateTime hanoi = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        ZonedDateTime ny = ZonedDateTime.now(ZoneId.of("America/New_York"));

        System.out.println(hanoi);
        System.out.println(tokyo);
        System.out.println(ny);

        // Chuyen doi mui gio
        ZonedDateTime hanoiToNY = hanoi.withZoneSameInstant(ZoneId.of("America/New_York"));
        System.out.println(hanoiToNY);

        // Danh sach tat ca mui gio
        ZoneId.getAvailableZoneIds().stream().limit(5).forEach(System.out::println);
    }
}
```

**Lưu ý:**

- `withZoneSameInstant`: Giữ nguyên **mốc thời gian tuyệt đối**, chỉ đổi cách hiển thị
- `withZoneSameLocal`: Giữ nguyên **giờ hiển thị**, đổi mốc thời gian

---

## 4. Instant

`Instant` là một mốc thời gian **tuyệt đối** -- số nanosecond kể từ epoch (1970-01-01 UTC). Phù hợp lưu vào DB, log, so sánh.

```java
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class InstantDemo {
    public static void main(String[] args) {
        Instant now = Instant.now();
        System.out.println(now); // 2026-05-28T07:30:00Z

        // Chuyen sang mui gio cu the
        ZonedDateTime hanoi = now.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        System.out.println(hanoi);

        // So sanh
        Instant a = Instant.now();
        Instant b = a.plusSeconds(60);
        System.out.println(a.isBefore(b)); // true
    }
}
```

---

## 5. Duration và Period

### Duration -- giờ/phút/giây

```java
import java.time.*;

Duration d = Duration.between(
    LocalTime.of(9, 0),
    LocalTime.of(17, 30)
);
System.out.println(d.toHours());    // 8
System.out.println(d.toMinutes());  // 510
```

### Period -- năm/tháng/ngày

```java
LocalDate start = LocalDate.of(2020, 1, 1);
LocalDate end = LocalDate.of(2026, 5, 28);
Period p = Period.between(start, end);
System.out.println(p);                  // P6Y4M27D
System.out.println(p.getYears());       // 6
System.out.println(p.getMonths());      // 4
System.out.println(p.getDays());        // 27
```

---

## 6. Format và Parse

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FormatDemo {
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now();

        // ISO mac dinh
        System.out.println(now); // 2026-05-28T14:30:00

        // Format tuy chinh
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        System.out.println(now.format(fmt)); // 28/05/2026 14:30

        // Parse tu chuoi
        LocalDate d = LocalDate.parse("28-05-2026", DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        System.out.println(d);
    }
}
```

### Pattern thường dùng

| Pattern        | Nghĩa                  | Ví dụ        |
| -------------- | ---------------------- | ------------ |
| `yyyy`         | Năm 4 chữ số           | 2026         |
| `MM`           | Tháng 2 chữ số         | 05           |
| `MMM`          | Tên tháng viết tắt     | May          |
| `MMMM`         | Tên tháng đầy đủ       | May          |
| `dd`           | Ngày 2 chữ số          | 28           |
| `EEEE`         | Thứ trong tuần         | Thursday     |
| `HH`           | Giờ 24h                | 14           |
| `hh`           | Giờ 12h                | 02           |
| `mm`           | Phút                   | 30           |
| `ss`           | Giây                   | 00           |
| `a`            | AM/PM                  | PM           |

---

## Khi nào dùng?

- **`LocalDate`**: Sinh nhật, ngày hợp đồng (không cần múi giờ)
- **`LocalTime`**: Giờ mở cửa cửa hàng
- **`LocalDateTime`**: Ghi log local, không cross-zone
- **`ZonedDateTime`**: Lịch họp đa quốc gia, đặt vé máy bay
- **`Instant`**: Timestamp lưu DB, audit log, so sánh thời gian
- **`Duration`**: Thời gian thực thi (ms, s)
- **`Period`**: Tuổi, thời gian sử dụng
- **Best practice:**
  - **TRÁNH** `java.util.Date`, `Calendar`, `SimpleDateFormat`
  - Lưu DB dạng UTC (Instant), convert sang local khi hiển thị
  - Dùng `DateTimeFormatter` (thread-safe), không dùng `SimpleDateFormat`

---

## Lỗi thường gặp

### Lỗi 1: Vẫn dùng `Date`/`Calendar`

```java
// SAI
Date now = new Date();
SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd");
// SimpleDateFormat khong thread-safe!

// DUNG
LocalDate now = LocalDate.now();
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // thread-safe
```

### Lỗi 2: Quên `LocalDateTime` không có múi giờ

```java
// SAI -- LocalDateTime cua server A va server B la khac nhau
LocalDateTime time = LocalDateTime.now();
// Khi truyen qua mang, khong biet la gio o dau

// DUNG -- dung ZonedDateTime hoac Instant
ZonedDateTime time = ZonedDateTime.now();
```

### Lỗi 3: Mutate

```java
// SAI -- LocalDate immutable, phep + khong sua nguyen ban
LocalDate today = LocalDate.now();
today.plusDays(1);
System.out.println(today); // Van la today, khong phai mai

// DUNG
LocalDate tomorrow = today.plusDays(1);
```

### Lỗi 4: Pattern sai

```java
// SAI -- YYYY la week-based year, khong phai nam thuong
DateTimeFormatter.ofPattern("YYYY-MM-dd");

// DUNG
DateTimeFormatter.ofPattern("yyyy-MM-dd");
```

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao Java 8 thay thế `Date`/`Calendar`?

**Trả lời:**

- `Date`/`Calendar` **không immutable** -- thay đổi tại chỗ, dễ bug
- **Không thread-safe** -- `SimpleDateFormat` đặc biệt nguy hiểm
- API rối: `Date` có nhiều method deprecated, `Calendar.MONTH` bắt đầu từ 0
- `java.time` rõ ràng, immutable, thread-safe, dựa trên Joda-Time

### Câu 2: `LocalDateTime` vs `ZonedDateTime` vs `Instant`?

**Trả lời:**

- `LocalDateTime`: Ngày + giờ, **không múi giờ** -- chỉ có ý nghĩa trong context cụ thể
- `ZonedDateTime`: Ngày + giờ + **múi giờ đầy đủ** (có quy tắc DST)
- `Instant`: Mốc thời gian **tuyệt đối** (UTC), dùng cho timestamp, log, DB

### Câu 3: Lưu thời gian vào DB nên dùng gì?

**Trả lời:** Khuyến nghị **`Instant`** hoặc **`TIMESTAMP WITH TIME ZONE`** (UTC). Khi hiển thị mới convert sang múi giờ của user. Tránh lưu `LocalDateTime` vì mất context múi giờ.

### Câu 4: `Duration` vs `Period`?

**Trả lời:**

- `Duration`: Thời gian **dựa trên giây/nano** -- dùng cho giờ/phút/giây, thường với `Instant`/`LocalTime`
- `Period`: Thời gian **dựa trên lịch** -- dùng cho năm/tháng/ngày, với `LocalDate`

### Câu 5: DST (Daylight Saving Time) ảnh hưởng thế nào?

**Trả lời:** Một số quốc gia chuyển giờ tiết kiệm ánh sáng -- có ngày 23h hoặc 25h. `ZonedDateTime` xử lý tự động. `LocalDateTime` không biết DST nên tính toán có thể sai. Việt Nam không có DST nhưng cẩn thận khi xử lý dữ liệu quốc tế.
