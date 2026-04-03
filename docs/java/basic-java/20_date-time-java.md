---
sidebar_position: 20
title: "Date & Time trong Java"
---

# Date & Time trong Java

**Xử lý ngày giờ (Date & Time)** là một trong những tác vụ phổ biến nhất trong lập trình: lưu thời điểm tạo tài khoản, tính tuổi, đặt lịch hẹn, xử lý timezone cho ứng dụng quốc tế. Java cung cấp nhiều API để làm việc với ngày giờ, nhưng không phải API nào cũng tốt.

Hãy hình dung việc xử lý ngày giờ như việc **đọc đồng hồ**: API cũ (`Date`, `Calendar`) giống như một chiếc đồng hồ cũ kỹ, kim đang bị lỏng, khó đọc và hay sai. API mới (`java.time`) giống như đồng hồ thông minh - chính xác, dễ đọc, và có nhiều tính năng hữu ích.

Bài này sẽ giúp bạn hiểu cả API cũ (để bảo trì code legacy) và API mới (để viết code mới chất lượng).

---

## 1. API cũ: `Date` và `Calendar` (trước Java 8)

### 1.1 `java.util.Date`

```java
import java.util.Date;

public class OldDateDemo {
    public static void main(String[] args) {
        // Tao doi tuong Date - thoi diem hien tai
        Date now = new Date();
        System.out.println("Hien tai: " + now);
        // Hien tai: Thu Apr 02 10:30:00 ICT 2026

        // Lay timestamp (milli-seconds tu 01/01/1970)
        long timestamp = now.getTime();
        System.out.println("Timestamp: " + timestamp);

        // So sanh 2 thoi diem
        Date earlier = new Date(timestamp - 86400000); // tru 1 ngay
        System.out.println("Truoc do: " + now.after(earlier)); // true
    }
}
```

**Vấn đề của `Date`:**
- **Mutable** (thay đổi được): gọi `setTime()` sẽ thay đổi đối tượng gốc, gây ra lỗi khó debug
- Nhiều method đã bị **deprecated** (`getYear()`, `getMonth()`, `getDay()`)
- **Không thread-safe**: 2 thread cùng dùng 1 đối tượng `Date` có thể gây lỗi
- Không phân biệt rõ "ngày" và "ngày giờ"

### 1.2 `java.util.Calendar`

```java
import java.util.Calendar;

public class CalendarDemo {
    public static void main(String[] args) {
        Calendar cal = Calendar.getInstance();

        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH) + 1; // MONTH bat dau tu 0!
        int day = cal.get(Calendar.DAY_OF_MONTH);
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        int minute = cal.get(Calendar.MINUTE);

        System.out.println("Ngay: " + day + "/" + month + "/" + year);
        System.out.println("Gio: " + hour + ":" + minute);

        // Cong 7 ngay
        cal.add(Calendar.DAY_OF_MONTH, 7);
        System.out.println("7 ngay sau: " + cal.getTime());
    }
}
```

**Vấn đề của `Calendar`:**
- **Month bắt đầu từ 0**: Tháng 1 = 0, Tháng 12 = 11 (rất dễ nhầm)
- **Mutable**: `cal.add()` thay đổi đối tượng gốc
- Code dài dòng, khó đọc
- Không thread-safe

---

## 2. API mới: `java.time` (Java 8+)

Từ Java 8, gói `java.time` ra đời để khắc phục toàn bộ vấn đề của API cũ. Tất cả các lớp trong `java.time` đều là **immutable** (bất biến) và **thread-safe**.

### 2.1 `LocalDate` - Chỉ ngày (không có giờ)

```java
import java.time.LocalDate;
import java.time.Month;

public class LocalDateDemo {
    public static void main(String[] args) {
        // Ngay hien tai
        LocalDate today = LocalDate.now();
        System.out.println("Hom nay: " + today); // 2026-04-02

        // Tao ngay cu the
        LocalDate birthday = LocalDate.of(1995, Month.MARCH, 15);
        // hoac: LocalDate.of(1995, 3, 15)
        System.out.println("Sinh nhat: " + birthday); // 1995-03-15

        // Lay thong tin
        System.out.println("Nam: " + today.getYear());
        System.out.println("Thang: " + today.getMonthValue()); // 1-12 (khong phai 0-11!)
        System.out.println("Ngay: " + today.getDayOfMonth());
        System.out.println("Thu: " + today.getDayOfWeek());     // THURSDAY

        // Kiem tra nam nhuan
        System.out.println("Nam nhuan: " + today.isLeapYear());

        // Parse tu String
        LocalDate parsed = LocalDate.parse("2026-12-25");
        System.out.println("Giang sinh: " + parsed);
    }
}
```

### 2.2 `LocalTime` - Chỉ giờ (không có ngày)

```java
import java.time.LocalTime;

public class LocalTimeDemo {
    public static void main(String[] args) {
        // Gio hien tai
        LocalTime now = LocalTime.now();
        System.out.println("Bay gio: " + now); // 14:30:45.123

        // Tao gio cu the
        LocalTime meeting = LocalTime.of(14, 30);       // 14:30
        LocalTime exact = LocalTime.of(14, 30, 45);     // 14:30:45

        System.out.println("Gio: " + now.getHour());
        System.out.println("Phut: " + now.getMinute());
        System.out.println("Giay: " + now.getSecond());

        // So sanh
        LocalTime lunch = LocalTime.of(12, 0);
        System.out.println("Da qua gio an trua: " + now.isAfter(lunch)); // true
    }
}
```

### 2.3 `LocalDateTime` - Ngày + Giờ (không có timezone)

```java
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

public class LocalDateTimeDemo {
    public static void main(String[] args) {
        // Ngay gio hien tai
        LocalDateTime now = LocalDateTime.now();
        System.out.println("Hien tai: " + now);
        // 2026-04-02T14:30:45.123

        // Tao tu ngay va gio rieng
        LocalDate date = LocalDate.of(2026, 6, 15);
        LocalTime time = LocalTime.of(9, 0);
        LocalDateTime event = LocalDateTime.of(date, time);
        System.out.println("Su kien: " + event); // 2026-06-15T09:00

        // Tao truc tiep
        LocalDateTime meeting = LocalDateTime.of(2026, 4, 10, 14, 30);
        System.out.println("Hop: " + meeting); // 2026-04-10T14:30
    }
}
```

### 2.4 `ZonedDateTime` - Ngày giờ với timezone

```java
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.LocalDateTime;

public class ZonedDateTimeDemo {
    public static void main(String[] args) {
        // Ngay gio voi timezone hien tai
        ZonedDateTime now = ZonedDateTime.now();
        System.out.println("VN: " + now);
        // 2026-04-02T14:30:45.123+07:00[Asia/Ho_Chi_Minh]

        // Ngay gio o timezone khac
        ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        System.out.println("Tokyo: " + tokyo);

        ZonedDateTime london = ZonedDateTime.now(ZoneId.of("Europe/London"));
        System.out.println("London: " + london);

        ZonedDateTime newYork = ZonedDateTime.now(ZoneId.of("America/New_York"));
        System.out.println("New York: " + newYork);

        // Chuyen doi timezone
        ZonedDateTime vnTime = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime usTime = vnTime.withZoneSameInstant(ZoneId.of("America/New_York"));
        System.out.println("VN: " + vnTime);
        System.out.println("US (cung thoi diem): " + usTime);

        // Xem tat ca timezone kha dung
        // ZoneId.getAvailableZoneIds().forEach(System.out::println);
    }
}
```

### 2.5 `Instant` - Mốc thời gian tuyệt đối (timestamp)

```java
import java.time.Instant;
import java.time.Duration;

public class InstantDemo {
    public static void main(String[] args) {
        // Thoi diem hien tai (UTC)
        Instant now = Instant.now();
        System.out.println("Instant: " + now);
        // 2026-04-02T07:30:45.123Z (luon la UTC)

        // Lay epoch seconds (so giay tu 01/01/1970 UTC)
        long epochSecond = now.getEpochSecond();
        System.out.println("Epoch seconds: " + epochSecond);

        // Tao tu epoch
        Instant fromEpoch = Instant.ofEpochSecond(1000000000);
        System.out.println("Tu epoch: " + fromEpoch);
        // 2001-09-09T01:46:40Z

        // Do thoi gian thuc thi
        Instant start = Instant.now();
        // ... thuc hien tac vu nao do ...
        for (int i = 0; i < 1000000; i++) { /* simulate work */ }
        Instant end = Instant.now();

        Duration elapsed = Duration.between(start, end);
        System.out.println("Thoi gian thuc thi: " + elapsed.toMillis() + " ms");
    }
}
```

---

## 3. DateTimeFormatter - Định dạng và parse ngày giờ

```java
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class FormatterDemo {
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now();

        // Cac pattern co san
        System.out.println(now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        // 2026-04-02T14:30:45

        // Custom pattern
        DateTimeFormatter vnFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        System.out.println("VN format: " + now.format(vnFormatter));
        // 02/04/2026 14:30:45

        DateTimeFormatter usFormatter = DateTimeFormatter.ofPattern("MM-dd-yyyy hh:mm a");
        System.out.println("US format: " + now.format(usFormatter));
        // 04-02-2026 02:30 PM

        DateTimeFormatter readable = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy");
        System.out.println("Doc duoc: " + now.format(readable));
        // Thursday, 02 April 2026

        // Parse chuoi thanh ngay
        String dateStr = "15/06/2026";
        DateTimeFormatter parser = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate parsedDate = LocalDate.parse(dateStr, parser);
        System.out.println("Parsed: " + parsedDate); // 2026-06-15

        // Parse chuoi co ngay va gio
        String dateTimeStr = "02/04/2026 14:30:00";
        LocalDateTime parsedDateTime = LocalDateTime.parse(dateTimeStr, vnFormatter);
        System.out.println("Parsed datetime: " + parsedDateTime);
    }
}
```

**Các ký hiệu pattern thường dùng:**

| Ký hiệu | Ý nghĩa | Ví dụ |
|---|---|---|
| `yyyy` | Năm 4 chữ số | 2026 |
| `MM` | Tháng (01-12) | 04 |
| `dd` | Ngày (01-31) | 02 |
| `HH` | Giờ 24h (00-23) | 14 |
| `hh` | Giờ 12h (01-12) | 02 |
| `mm` | Phút (00-59) | 30 |
| `ss` | Giây (00-59) | 45 |
| `a` | AM/PM | PM |
| `EEEE` | Thứ (đầy tên) | Thursday |
| `MMMM` | Tháng (đầy tên) | April |

---

## 4. Period và Duration - Khoảng cách thời gian

### 4.1 `Period` - Khoảng cách theo ngày/tháng/năm

```java
import java.time.LocalDate;
import java.time.Period;

public class PeriodDemo {
    public static void main(String[] args) {
        LocalDate birthday = LocalDate.of(1995, 3, 15);
        LocalDate today = LocalDate.of(2026, 4, 2);

        // Tinh khoang cach
        Period age = Period.between(birthday, today);
        System.out.println("Tuoi: " + age.getYears() + " nam, "
            + age.getMonths() + " thang, "
            + age.getDays() + " ngay");
        // Tuoi: 31 nam, 0 thang, 18 ngay

        // Tao Period
        Period twoWeeks = Period.ofWeeks(2);
        Period threeMonths = Period.ofMonths(3);

        // Cong Period vao ngay
        LocalDate futureDate = today.plus(threeMonths);
        System.out.println("3 thang sau: " + futureDate);
    }
}
```

### 4.2 `Duration` - Khoảng cách theo giờ/phút/giây

```java
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.Instant;

public class DurationDemo {
    public static void main(String[] args) {
        LocalTime start = LocalTime.of(8, 0);
        LocalTime end = LocalTime.of(17, 30);

        // Tinh khoang cach
        Duration workHours = Duration.between(start, end);
        System.out.println("Gio lam viec: " + workHours.toHours() + " gio "
            + (workHours.toMinutes() % 60) + " phut");
        // Gio lam viec: 9 gio 30 phut

        // Tao Duration
        Duration fiveMinutes = Duration.ofMinutes(5);
        Duration twoHours = Duration.ofHours(2);

        // Cong Duration vao thoi gian
        LocalTime breakTime = start.plus(Duration.ofHours(4));
        System.out.println("Gio nghi: " + breakTime); // 12:00

        // Do thoi gian bang Instant (chinh xac hon)
        Instant t1 = Instant.now();
        // ... thuc hien tac vu ...
        Instant t2 = Instant.now();
        Duration elapsed = Duration.between(t1, t2);
        System.out.println("Mat: " + elapsed.toMillis() + " ms");
    }
}
```

**Period vs Duration:**

| Tiêu chí | Period | Duration |
|---|---|---|
| Đơn vị | Năm, Tháng, Ngày | Giờ, Phút, Giây, Nano |
| Dùng cho | `LocalDate` | `LocalTime`, `LocalDateTime`, `Instant` |
| Ví dụ | "2 năm 3 tháng" | "5 giờ 30 phút" |

---

## 5. So sánh và cộng trừ ngày giờ

```java
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DateOperations {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();

        // Cong tru ngay
        LocalDate tomorrow = today.plusDays(1);
        LocalDate nextMonth = today.plusMonths(1);
        LocalDate nextYear = today.plusYears(1);
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastWeek = today.minusWeeks(1);

        System.out.println("Hom nay: " + today);
        System.out.println("Ngay mai: " + tomorrow);
        System.out.println("Thang sau: " + nextMonth);
        System.out.println("Hom qua: " + yesterday);

        // So sanh
        LocalDate d1 = LocalDate.of(2026, 1, 1);
        LocalDate d2 = LocalDate.of(2026, 12, 31);

        System.out.println("d1 truoc d2: " + d1.isBefore(d2));  // true
        System.out.println("d1 sau d2: " + d1.isAfter(d2));      // false
        System.out.println("d1 bang d2: " + d1.isEqual(d2));      // false

        // Cong tru gio phut
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime later = now.plusHours(3).plusMinutes(30);
        System.out.println("3h30 sau: " + later);

        // Luu y: immutable - doi tuong goc KHONG thay doi
        LocalDate original = LocalDate.of(2026, 1, 1);
        LocalDate modified = original.plusDays(10);
        System.out.println("Goc: " + original);    // 2026-01-01 (khong doi)
        System.out.println("Moi: " + modified);     // 2026-01-11
    }
}
```

---

## 6. So sánh API cũ và API mới

| Tiêu chí | `Date` / `Calendar` | `java.time` (Java 8+) |
|---|---|---|
| Immutable | Không (mutable) | Có (immutable) |
| Thread-safe | Không | Có |
| Month | 0-based (0 = Jan) | 1-based (1 = Jan) |
| API design | Khó hiểu, dài dòng | Trực quan, gọn gàng |
| Timezone | Phức tạp | Rõ ràng với `ZonedDateTime` |
| Null-safe | Không | Có |
| Khuyến nghị | Chỉ dùng khi bảo trì code cũ | **Luôn dùng cho code mới** |

---

## Khi nào dùng?

**Chọn lớp nào cho phù hợp:**
- **`LocalDate`**: Chỉ cần ngày (sinh nhật, ngày hết hạn, ngày lễ)
- **`LocalTime`**: Chỉ cần giờ (giờ mở cửa, giờ hẹn)
- **`LocalDateTime`**: Cần ngày + giờ nhưng không quan tâm timezone (lịch họp nội bộ)
- **`ZonedDateTime`**: Ứng dụng đa quốc gia, cần chuyển đổi timezone
- **`Instant`**: Lưu timestamp vào database, đo thời gian thực thi, log hệ thống
- **`Period`**: Tính khoảng cách theo ngày/tháng/năm (tính tuổi)
- **`Duration`**: Tính khoảng cách theo giờ/phút/giây (đo performance)

**Best practices:**
- **Luôn dùng `java.time`** cho code mới, tránh `Date` và `Calendar`
- Luôn **rõ ràng về timezone** khi ứng dụng phục vụ nhiều vùng
- Dùng `DateTimeFormatter` để format/parse, không tự xử lý chuỗi
- Lưu thời gian vào database bằng **`Instant`** (UTC), chuyển đổi timezone khi hiển thị
- Dùng `Period.between()` và `Duration.between()` thay vì tự tính toán

---

## Lỗi thường gặp

### 1. Nhầm month 0-based của Calendar

```java
import java.util.Calendar;

// Sai - thang 3 (March) nhung truyen 3
Calendar cal = Calendar.getInstance();
cal.set(2026, 3, 15); // Thuc ra la thang 4 (April)!

// Dung - thang 3 (March) phai truyen 2, hoac dung constant
cal.set(2026, Calendar.MARCH, 15);
// Hoac tot hon: dung java.time
// LocalDate.of(2026, 3, 15) -- thang 3 la thang 3!
```

### 2. Quên rằng java.time là immutable

```java
import java.time.LocalDate;

LocalDate date = LocalDate.of(2026, 1, 1);

// Sai - tuong rang date da thay doi
date.plusDays(10); // Ket qua bi bo qua!
System.out.println(date); // Van la 2026-01-01

// Dung - gan ket qua vao bien moi
LocalDate newDate = date.plusDays(10);
System.out.println(newDate); // 2026-01-11
```

### 3. Parse sai format

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

// Sai - format khong khop voi chuoi
try {
    String dateStr = "02/04/2026"; // dd/MM/yyyy
    LocalDate date = LocalDate.parse(dateStr); // Mac dinh la yyyy-MM-dd
    // DateTimeParseException!
} catch (DateTimeParseException e) {
    System.out.println("Loi parse: " + e.getMessage());
}

// Dung - chi dinh dung format
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate date = LocalDate.parse("02/04/2026", formatter);
System.out.println(date); // 2026-04-02
```

### 4. Dùng Date thay vì java.time trong code mới

```java
// Sai - su dung API cu
import java.util.Date;
import java.text.SimpleDateFormat;

Date now = new Date();
SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
String formatted = sdf.format(now);
// SimpleDateFormat KHONG thread-safe!

// Dung - su dung java.time
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

LocalDate today = LocalDate.now();
String formatted2 = today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
// DateTimeFormatter la thread-safe va immutable
```

---

## Câu hỏi phỏng vấn

### 1. Tại sao `java.time` tốt hơn `Date` và `Calendar`?

**Trả lời:** `java.time` tốt hơn vì: (1) **Immutable và thread-safe** - không thể thay đổi đối tượng đã tạo, an toàn khi dùng đa luồng. (2) **API trực quan** - `LocalDate.of(2026, 3, 15)` dễ hiểu hơn Calendar với month 0-based. (3) **Tách biệt rõ ràng** - `LocalDate` (chỉ ngày), `LocalTime` (chỉ giờ), `ZonedDateTime` (có timezone). (4) **DateTimeFormatter thread-safe** - khác với `SimpleDateFormat` của API cũ.

### 2. `LocalDateTime` và `ZonedDateTime` khác nhau như thế nào?

**Trả lời:** `LocalDateTime` lưu ngày và giờ **không có thông tin timezone** - giống như đọc giờ trên đồng hồ treo tường (chỉ biết "14:30" nhưng không biết là 14:30 ở đâu). `ZonedDateTime` lưu ngày giờ **kèm theo timezone cụ thể** (ví dụ "14:30 Asia/Ho_Chi_Minh"). Dùng `LocalDateTime` cho ứng dụng đơn timezone, dùng `ZonedDateTime` khi cần chuyển đổi giờ giữa các vùng.

### 3. `Instant` là gì và khi nào dùng?

**Trả lời:** `Instant` đại diện cho một **thời điểm tuyệt đối trên trục thời gian**, được lưu dưới dạng số giây và nano-giây tính từ epoch (01/01/1970 00:00:00 UTC). Nó không có thông tin timezone hay calendar. Dùng `Instant` khi cần: lưu timestamp vào database, đo thời gian thực thi code, ghi log hệ thống, so sánh 2 thời điểm bất kể timezone.

### 4. Làm sao format ngày giờ với custom pattern?

**Trả lời:** Dùng `DateTimeFormatter.ofPattern()`:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
String result = LocalDateTime.now().format(formatter); // "02/04/2026 14:30:45"
LocalDateTime parsed = LocalDateTime.parse("02/04/2026 14:30:45", formatter);
```

Các ký hiệu: `yyyy` (năm), `MM` (tháng), `dd` (ngày), `HH` (giờ 24h), `mm` (phút), `ss` (giây), `EEEE` (thứ), `a` (AM/PM). `DateTimeFormatter` là immutable và thread-safe, có thể tái sử dụng an toàn.
