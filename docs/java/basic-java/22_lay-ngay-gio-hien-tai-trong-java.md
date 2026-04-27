---
sidebar_position: 22
title: "22. Lấy ngày giờ hiện tại"
---

# Lấy ngày giờ hiện tại trong Java

**Lấy ngày giờ hiện tại** là thao tác cơ bản nhưng rất thường xuyên trong mọi ứng dụng: ghi log hệ thống, hiển thị thời gian cho người dùng, tính toán thời hạn, đặt lịch, xử lý giao dịch. Java cung cấp **nhiều cách** để lấy thời gian hiện tại, từ API cũ đến API mới.

Hãy tưởng tượng bạn có **nhiều loại đồng hồ** trong nhà: đồng hồ treo tường (chỉ hiện ngày giờ địa phương), đồng hồ thông minh (hiện cả timezone), và đồng hồ số (hiện timestamp số). Mỗi loại đồng hồ tương ứng với một cách lấy thời gian trong Java. Bài này sẽ giúp bạn biết khi nào nên dùng "đồng hồ" nào.

---


---

## Mục lục

- [1. `LocalDate.now()` - Lấy ngày hiện tại](#1-localdatenow-lấy-ngày-hiện-tại)
- [2. `LocalTime.now()` - Lấy giờ hiện tại](#2-localtimenow-lấy-giờ-hiện-tại)
- [3. `LocalDateTime.now()` - Lấy ngày và giờ hiện tại](#3-localdatetimenow-lấy-ngày-và-giờ-hiện-tại)
- [4. `ZonedDateTime.now()` - Lấy ngày giờ với timezone](#4-zoneddatetimenow-lấy-ngày-giờ-với-timezone)
- [5. `Instant.now()` - Lấy timestamp (mốc thời gian tuyệt đối)](#5-instantnow-lấy-timestamp-mốc-thời-gian-tuyệt-đối)
- [6. `new Date()` - API cũ (legacy)](#6-new-date-api-cũ-legacy)
- [7. `Calendar.getInstance()` - API cũ (legacy)](#7-calendargetinstance-api-cũ-legacy)
- [8. Bảng so sánh tất cả các cách](#8-bảng-so-sánh-tất-cả-các-cách)
- [9. Format output với `DateTimeFormatter` và `SimpleDateFormat`](#9-format-output-với-datetimeformatter-và-simpledateformat)
- [10. Timezone handling](#10-timezone-handling)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. `LocalDate.now()` - Lấy ngày hiện tại

Trả về **chỉ ngày** (năm-tháng-ngày), không có giờ phút.

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CurrentDateDemo {
    public static void main(String[] args) {
        // Lay ngay hien tai
        LocalDate today = LocalDate.now();
        System.out.println("Hom nay: " + today);
        // 2026-04-02

        // Lay thong tin chi tiet
        System.out.println("Nam: " + today.getYear());        // 2026
        System.out.println("Thang: " + today.getMonthValue()); // 4
        System.out.println("Ngay: " + today.getDayOfMonth());  // 2
        System.out.println("Thu: " + today.getDayOfWeek());     // THURSDAY
        System.out.println("Ngay thu may trong nam: " + today.getDayOfYear()); // 92

        // Format theo kieu Viet Nam
        DateTimeFormatter vnFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println("VN: " + today.format(vnFormat));
        // 02/04/2026

        DateTimeFormatter readable = DateTimeFormatter.ofPattern("'Ngay' dd 'thang' MM 'nam' yyyy");
        System.out.println(today.format(readable));
        // Ngay 02 thang 04 nam 2026
    }
}
```

**Khi nào dùng:** Hiển thị ngày hiện tại, kiểm tra ngày sinh, tính ngày hết hạn, không cần thông tin giờ.

---

## 2. `LocalTime.now()` - Lấy giờ hiện tại

Trả về **chỉ giờ** (giờ-phút-giây), không có ngày.

```java
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class CurrentTimeDemo {
    public static void main(String[] args) {
        // Lay gio hien tai
        LocalTime now = LocalTime.now();
        System.out.println("Bay gio: " + now);
        // 14:30:45.123456

        // Lay thong tin chi tiet
        System.out.println("Gio: " + now.getHour());     // 14
        System.out.println("Phut: " + now.getMinute());   // 30
        System.out.println("Giay: " + now.getSecond());   // 45

        // Format
        DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("HH:mm:ss");
        System.out.println("Format: " + now.format(timeFormat));
        // 14:30:45

        DateTimeFormatter time12h = DateTimeFormatter.ofPattern("hh:mm a");
        System.out.println("12h: " + now.format(time12h));
        // 02:30 PM

        // Kiem tra buoi sang hay chieu
        if (now.getHour() < 12) {
            System.out.println("Buoi sang");
        } else if (now.getHour() < 18) {
            System.out.println("Buoi chieu");
        } else {
            System.out.println("Buoi toi");
        }
    }
}
```

**Khi nào dùng:** Hiển thị giờ hiện tại, kiểm tra giờ làm việc, tính thời gian còn lại trong ngày.

---

## 3. `LocalDateTime.now()` - Lấy ngày và giờ hiện tại

Trả về **ngày + giờ** (không có timezone).

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CurrentDateTimeDemo {
    public static void main(String[] args) {
        // Lay ngay gio hien tai
        LocalDateTime now = LocalDateTime.now();
        System.out.println("Hien tai: " + now);
        // 2026-04-02T14:30:45.123456

        // Format cac kieu khac nhau
        DateTimeFormatter f1 = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        System.out.println("VN: " + now.format(f1));
        // 02/04/2026 14:30:45

        DateTimeFormatter f2 = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        System.out.println("ISO: " + now.format(f2));
        // 2026-04-02 14:30

        DateTimeFormatter f3 = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy - HH:mm");
        System.out.println("Day ten: " + now.format(f3));
        // Thursday, 02 April 2026 - 14:30

        // Trich xuat ngay hoac gio rieng
        System.out.println("Chi ngay: " + now.toLocalDate()); // 2026-04-02
        System.out.println("Chi gio: " + now.toLocalTime());  // 14:30:45.123456
    }
}
```

**Khi nào dùng:** Ghi log nội bộ, lưu thời gian tạo record (đơn timezone), hiển thị thời gian cho người dùng.

---

## 4. `ZonedDateTime.now()` - Lấy ngày giờ với timezone

Trả về **ngày + giờ + timezone**.

```java
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class CurrentZonedDemo {
    public static void main(String[] args) {
        // Lay ngay gio voi timezone mac dinh (may tinh)
        ZonedDateTime now = ZonedDateTime.now();
        System.out.println("Local: " + now);
        // 2026-04-02T14:30:45.123+07:00[Asia/Ho_Chi_Minh]

        // Lay ngay gio o cac timezone khac
        ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        ZonedDateTime london = ZonedDateTime.now(ZoneId.of("Europe/London"));
        ZonedDateTime newYork = ZonedDateTime.now(ZoneId.of("America/New_York"));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm z");
        System.out.println("Tokyo:    " + tokyo.format(fmt));
        System.out.println("London:   " + london.format(fmt));
        System.out.println("New York: " + newYork.format(fmt));

        // Hien thi timezone va offset
        System.out.println("Zone: " + now.getZone());       // Asia/Ho_Chi_Minh
        System.out.println("Offset: " + now.getOffset());   // +07:00

        // Chuyen doi timezone (cung thoi diem, khac gio dia phuong)
        ZonedDateTime vnTime = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime usTime = vnTime.withZoneSameInstant(ZoneId.of("America/New_York"));
        System.out.println("VN: " + vnTime.format(fmt));
        System.out.println("US: " + usTime.format(fmt));
    }
}
```

**Khi nào dùng:** Ứng dụng phục vụ nhiều quốc gia, chuyển đổi giờ giữa các vùng, hiển thị giờ theo timezone của người dùng.

---

## 5. `Instant.now()` - Lấy timestamp (mốc thời gian tuyệt đối)

Trả về **thời điểm trên trục thời gian**, luôn ở **UTC**, không có timezone hay calendar.

```java
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDateTime;

public class CurrentInstantDemo {
    public static void main(String[] args) {
        // Lay instant hien tai (UTC)
        Instant now = Instant.now();
        System.out.println("Instant: " + now);
        // 2026-04-02T07:30:45.123456Z (Z = UTC)

        // Lay epoch seconds va milliseconds
        long epochSecond = now.getEpochSecond();
        long epochMilli = now.toEpochMilli();
        System.out.println("Epoch seconds: " + epochSecond);
        System.out.println("Epoch millis: " + epochMilli);

        // Chuyen Instant sang LocalDateTime (can chi dinh timezone)
        LocalDateTime ldt = LocalDateTime.ofInstant(now, ZoneId.of("Asia/Ho_Chi_Minh"));
        System.out.println("VN time: " + ldt);

        // Do thoi gian thuc thi
        Instant start = Instant.now();

        // Simulate work
        long sum = 0;
        for (int i = 0; i < 10_000_000; i++) {
            sum += i;
        }

        Instant end = Instant.now();
        long elapsedMs = java.time.Duration.between(start, end).toMillis();
        System.out.println("Thoi gian thuc thi: " + elapsedMs + " ms");
    }
}
```

**Khi nào dùng:** Lưu timestamp vào database, đo thời gian thực thi, ghi log hệ thống, so sánh thời điểm giữa các server khác timezone.

---

## 6. `new Date()` - API cũ (legacy)

```java
import java.util.Date;
import java.text.SimpleDateFormat;

public class LegacyDateDemo {
    public static void main(String[] args) {
        // Lay thoi gian hien tai bang Date (API cu)
        Date now = new Date();
        System.out.println("Date: " + now);
        // Thu Apr 02 14:30:45 ICT 2026

        // Format voi SimpleDateFormat (API cu)
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        String formatted = sdf.format(now);
        System.out.println("Formatted: " + formatted);
        // 02/04/2026 14:30:45

        // Lay timestamp
        long timestamp = now.getTime();
        System.out.println("Timestamp: " + timestamp);

        // Chuyen Date cu sang Instant moi
        Instant instant = now.toInstant();
        System.out.println("Instant: " + instant);
    }
}
```

**Lưu ý:** `SimpleDateFormat` **KHÔNG thread-safe**. Không chia sẻ giữa các thread. Dùng `DateTimeFormatter` thay thế.

---

## 7. `Calendar.getInstance()` - API cũ (legacy)

```java
import java.util.Calendar;

public class LegacyCalendarDemo {
    public static void main(String[] args) {
        // Lay thoi gian hien tai bang Calendar (API cu)
        Calendar cal = Calendar.getInstance();

        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH) + 1; // CHU Y: +1 vi month bat dau tu 0
        int day = cal.get(Calendar.DAY_OF_MONTH);
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        int minute = cal.get(Calendar.MINUTE);
        int second = cal.get(Calendar.SECOND);

        String formatted = String.format("%02d/%02d/%d %02d:%02d:%02d",
            day, month, year, hour, minute, second);
        System.out.println("Calendar: " + formatted);
        // 02/04/2026 14:30:45
    }
}
```

**Lưu ý:** Code dài, dễ nhầm month 0-based. Nên dùng `java.time` thay thế.

---

## 8. Bảng so sánh tất cả các cách

| Cách | Class | Kết quả | Timezone | Thread-safe | Khuyến nghị |
|---|---|---|---|---|---|
| `LocalDate.now()` | `java.time` | Chỉ ngày | Không | Có | **Có** |
| `LocalTime.now()` | `java.time` | Chỉ giờ | Không | Có | **Có** |
| `LocalDateTime.now()` | `java.time` | Ngày + giờ | Không | Có | **Có** |
| `ZonedDateTime.now()` | `java.time` | Ngày + giờ + TZ | Có | Có | **Có** |
| `Instant.now()` | `java.time` | Timestamp UTC | UTC | Có | **Có** |
| `new Date()` | `java.util` | Ngày + giờ | Không rõ | Không | Không |
| `Calendar.getInstance()` | `java.util` | Ngày + giờ | Có | Không | Không |

---

## 9. Format output với `DateTimeFormatter` và `SimpleDateFormat`

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.text.SimpleDateFormat;

public class FormattingComparison {
    public static void main(String[] args) {
        // ====== API MOI (khuyen nghi) ======
        LocalDateTime now = LocalDateTime.now();

        // Cac kieu format pho bien
        String[] patterns = {
            "dd/MM/yyyy",              // 02/04/2026
            "dd-MM-yyyy HH:mm:ss",     // 02-04-2026 14:30:45
            "yyyy-MM-dd'T'HH:mm:ss",   // 2026-04-02T14:30:45
            "EEEE, dd MMMM yyyy",       // Thursday, 02 April 2026
            "hh:mm a",                  // 02:30 PM
        };

        for (String pattern : patterns) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            System.out.println(pattern + " -> " + now.format(formatter));
        }

        // ====== API CU (legacy) ======
        Date oldDate = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        System.out.println("\nLegacy: " + sdf.format(oldDate));

        // CHU Y: SimpleDateFormat KHONG thread-safe!
    }
}
```

---

## 10. Timezone handling

```java
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Set;

public class TimezoneDemo {
    public static void main(String[] args) {
        // Timezone mac dinh cua he thong
        ZoneId defaultZone = ZoneId.systemDefault();
        System.out.println("Timezone mac dinh: " + defaultZone);
        // Asia/Ho_Chi_Minh

        // Lay thoi gian hien tai tai nhieu timezone
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm:ss z");

        String[] zones = {
            "Asia/Ho_Chi_Minh", "Asia/Tokyo", "Europe/London",
            "America/New_York", "Australia/Sydney"
        };

        System.out.println("\nThoi gian hien tai tren the gioi:");
        for (String zone : zones) {
            ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of(zone));
            System.out.printf("  %-25s %s%n", zone, zdt.format(fmt));
        }

        // Chuyen Instant sang timezone cu the
        Instant instant = Instant.now();
        ZonedDateTime vnTime = instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime usTime = instant.atZone(ZoneId.of("America/New_York"));
        System.out.println("\nCung 1 Instant:");
        System.out.println("  VN: " + vnTime);
        System.out.println("  US: " + usTime);

        // Dem tong so timezone kha dung
        Set<String> allZones = ZoneId.getAvailableZoneIds();
        System.out.println("\nTong so timezone: " + allZones.size());
    }
}
```

---

## Khi nào dùng?

**Hướng dẫn chọn API:**
- **Chỉ cần ngày** (sinh nhật, deadline) -> `LocalDate.now()`
- **Chỉ cần giờ** (giờ mở cửa, giờ hẹn) -> `LocalTime.now()`
- **Cần ngày + giờ** (ghi log, lịch hẹn) -> `LocalDateTime.now()`
- **Ứng dụng đa quốc gia** -> `ZonedDateTime.now()`
- **Lưu vào database / so sánh giữa servers** -> `Instant.now()`
- **Bảo trì code cũ** -> `new Date()` hoặc `Calendar.getInstance()`

**Best practices:**
- **Luôn dùng `java.time`** (Java 8+) cho code mới
- Lưu timestamp vào database bằng `Instant` (UTC), chuyển timezone khi hiển thị
- Dùng `DateTimeFormatter` (thread-safe) thay vì `SimpleDateFormat` (không thread-safe)
- Khi viết unit test, dùng `Clock` để inject thời gian thay vì gọi `now()` trực tiếp

---

## Lỗi thường gặp

### 1. Dùng API cũ trong code mới

```java
// Sai - dung API cu, nhieu van de
Date now = new Date();
SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
String today = sdf.format(now); // SimpleDateFormat khong thread-safe!

// Dung - dung java.time
LocalDate today2 = LocalDate.now();
String formatted = today2.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
```

### 2. Nhầm timezone khi chuyển đổi

```java
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.ZoneId;

// Sai - LocalDateTime KHONG co timezone, chuyen doi vo nghia
LocalDateTime local = LocalDateTime.now();
// local KHONG biet no dang o timezone nao!

// Dung - dung ZonedDateTime khi can lam viec voi timezone
ZonedDateTime vnTime = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
ZonedDateTime usTime = vnTime.withZoneSameInstant(ZoneId.of("America/New_York"));
```

### 3. Nhầm Instant và LocalDateTime

```java
import java.time.Instant;
import java.time.LocalDateTime;

// Instant = thoi diem tuyet doi (UTC), khong co timezone cuc bo
Instant instant = Instant.now(); // 2026-04-02T07:30:45Z (UTC)

// LocalDateTime = ngay gio "dia phuong", khong co timezone
LocalDateTime local = LocalDateTime.now(); // 2026-04-02T14:30:45 (may tinh)

// Sai - so sanh truc tiep Instant va LocalDateTime (khac kieu)
// instant.equals(local); // Khong the so sanh!

// Dung - chuyen ve cung kieu truoc khi so sanh
LocalDateTime fromInstant = LocalDateTime.ofInstant(instant,
    java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
```

---

## Câu hỏi phỏng vấn

### 1. Nên dùng API nào để lấy thời gian hiện tại trong Java?

**Trả lời:** Nên dùng gói `java.time` (từ Java 8). Cụ thể: `LocalDate.now()` cho chỉ ngày, `LocalTime.now()` cho chỉ giờ, `LocalDateTime.now()` cho ngày + giờ, `ZonedDateTime.now()` khi cần timezone, `Instant.now()` khi cần timestamp UTC. Tránh `java.util.Date` và `java.util.Calendar` vì chúng mutable, không thread-safe, và API khó dùng (month bắt đầu từ 0).

### 2. Sự khác biệt giữa `Instant` và `LocalDateTime`?

**Trả lời:** `Instant` đại diện cho một **thời điểm tuyệt đối** trên trục thời gian (lưu bằng epoch seconds, luôn ở UTC), không gắn với bất kỳ timezone nào. `LocalDateTime` đại diện cho **ngày và giờ tại địa phương**, không có thông tin timezone. Ví dụ: "2026-04-02T14:30" (LocalDateTime) có thể là 14:30 ở Việt Nam hoặc 14:30 ở Mỹ - hai thời điểm khác nhau. `Instant` thì chỉ rõ chính xác một thời điểm duy nhất. Dùng `Instant` khi lưu vào database, dùng `LocalDateTime` khi hiển thị cho người dùng.

### 3. Tại sao `SimpleDateFormat` không an toàn trong multi-thread?

**Trả lời:** `SimpleDateFormat` lưu trữ trạng thái nội bộ (internal `Calendar` object) khi format/parse. Khi 2 thread cùng gọi `format()` hoặc `parse()` trên cùng một instance, chúng sẽ ghi đè trạng thái của nhau, dẫn đến kết quả sai hoặc exception. Giải pháp: (1) Dùng `DateTimeFormatter` (java.time) - immutable và thread-safe, (2) Tạo `SimpleDateFormat` mới trong mỗi thread, (3) Dùng `ThreadLocal<SimpleDateFormat>`.
