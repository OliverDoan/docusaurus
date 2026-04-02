---
sidebar_position: 22
title: "Lấy ngày giờ hiện tại"
---

# Lay ngay gio hien tai trong Java

**Lay ngay gio hien tai** la thao tac co ban nhung rat thuong xuyen trong moi ung dung: ghi log he thong, hien thi thoi gian cho nguoi dung, tinh toan thoi han, dat lich, xu ly giao dich. Java cung cap **nhieu cach** de lay thoi gian hien tai, tu API cu den API moi.

Hay tuong tuong ban co **nhieu loai dong ho** trong nha: dong ho treo tuong (chi hien ngay gio dia phuong), dong ho thong minh (hien ca timezone), va dong ho so (hien timestamp so). Moi loai dong ho tuong ung voi mot cach lay thoi gian trong Java. Bai nay se giup ban biet khi nao nen dung "dong ho" nao.

---

## 1. `LocalDate.now()` - Lay ngay hien tai

Tra ve **chi ngay** (nam-thang-ngay), khong co gio phut.

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

**Khi nao dung:** Hien thi ngay hien tai, kiem tra ngay sinh, tinh ngay het han, khong can thong tin gio.

---

## 2. `LocalTime.now()` - Lay gio hien tai

Tra ve **chi gio** (gio-phut-giay), khong co ngay.

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

**Khi nao dung:** Hien thi gio hien tai, kiem tra gio lam viec, tinh thoi gian con lai trong ngay.

---

## 3. `LocalDateTime.now()` - Lay ngay va gio hien tai

Tra ve **ngay + gio** (khong co timezone).

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

**Khi nao dung:** Ghi log noi bo, luu thoi gian tao record (don timezone), hien thi thoi gian cho nguoi dung.

---

## 4. `ZonedDateTime.now()` - Lay ngay gio voi timezone

Tra ve **ngay + gio + timezone**.

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

**Khi nao dung:** Ung dung phuc vu nhieu quoc gia, chuyen doi gio giua cac vung, hien thi gio theo timezone cua nguoi dung.

---

## 5. `Instant.now()` - Lay timestamp (moc thoi gian tuyet doi)

Tra ve **thoi diem tren truc thoi gian**, luon o **UTC**, khong co timezone hay calendar.

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

**Khi nao dung:** Luu timestamp vao database, do thoi gian thuc thi, ghi log he thong, so sanh thoi diem giua cac server khac timezone.

---

## 6. `new Date()` - API cu (legacy)

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

**Luu y:** `SimpleDateFormat` **KHONG thread-safe**. Khong chia se giua cac thread. Dung `DateTimeFormatter` thay the.

---

## 7. `Calendar.getInstance()` - API cu (legacy)

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

**Luu y:** Code dai, de nham month 0-based. Nen dung `java.time` thay the.

---

## 8. Bang so sanh tat ca cac cach

| Cach | Class | Ket qua | Timezone | Thread-safe | Khuyen nghi |
|---|---|---|---|---|---|
| `LocalDate.now()` | `java.time` | Chi ngay | Khong | Co | **Co** |
| `LocalTime.now()` | `java.time` | Chi gio | Khong | Co | **Co** |
| `LocalDateTime.now()` | `java.time` | Ngay + gio | Khong | Co | **Co** |
| `ZonedDateTime.now()` | `java.time` | Ngay + gio + TZ | Co | Co | **Co** |
| `Instant.now()` | `java.time` | Timestamp UTC | UTC | Co | **Co** |
| `new Date()` | `java.util` | Ngay + gio | Khong ro | Khong | Khong |
| `Calendar.getInstance()` | `java.util` | Ngay + gio | Co | Khong | Khong |

---

## 9. Format output voi `DateTimeFormatter` va `SimpleDateFormat`

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

## Khi nao dung?

**Huong dan chon API:**
- **Chi can ngay** (sinh nhat, deadline) -> `LocalDate.now()`
- **Chi can gio** (gio mo cua, gio hen) -> `LocalTime.now()`
- **Can ngay + gio** (ghi log, lich hen) -> `LocalDateTime.now()`
- **Ung dung da quoc gia** -> `ZonedDateTime.now()`
- **Luu vao database / so sanh giua servers** -> `Instant.now()`
- **Bao tri code cu** -> `new Date()` hoac `Calendar.getInstance()`

**Best practices:**
- **Luon dung `java.time`** (Java 8+) cho code moi
- Luu timestamp vao database bang `Instant` (UTC), chuyen timezone khi hien thi
- Dung `DateTimeFormatter` (thread-safe) thay vi `SimpleDateFormat` (khong thread-safe)
- Khi viet unit test, dung `Clock` de inject thoi gian thay vi goi `now()` truc tiep

---

## Loi thuong gap

### 1. Dung API cu trong code moi

```java
// Sai - dung API cu, nhieu van de
Date now = new Date();
SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
String today = sdf.format(now); // SimpleDateFormat khong thread-safe!

// Dung - dung java.time
LocalDate today2 = LocalDate.now();
String formatted = today2.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
```

### 2. Nham timezone khi chuyen doi

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

### 3. Nham Instant va LocalDateTime

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

## Cau hoi phong van

### 1. Nen dung API nao de lay thoi gian hien tai trong Java?

**Tra loi:** Nen dung goi `java.time` (tu Java 8). Cu the: `LocalDate.now()` cho chi ngay, `LocalTime.now()` cho chi gio, `LocalDateTime.now()` cho ngay + gio, `ZonedDateTime.now()` khi can timezone, `Instant.now()` khi can timestamp UTC. Tranh `java.util.Date` va `java.util.Calendar` vi chung mutable, khong thread-safe, va API kho dung (month bat dau tu 0).

### 2. Su khac biet giua `Instant` va `LocalDateTime`?

**Tra loi:** `Instant` dai dien cho mot **thoi diem tuyet doi** tren truc thoi gian (luu bang epoch seconds, luon o UTC), khong gan voi bat ky timezone nao. `LocalDateTime` dai dien cho **ngay va gio tai dia phuong**, khong co thong tin timezone. Vi du: "2026-04-02T14:30" (LocalDateTime) co the la 14:30 o Viet Nam hoac 14:30 o My - hai thoi diem khac nhau. `Instant` thi chi ro chinh xac mot thoi diem duy nhat. Dung `Instant` khi luu vao database, dung `LocalDateTime` khi hien thi cho nguoi dung.

### 3. Tai sao `SimpleDateFormat` khong an toan trong multi-thread?

**Tra loi:** `SimpleDateFormat` luu tru trang thai noi bo (internal `Calendar` object) khi format/parse. Khi 2 thread cung goi `format()` hoac `parse()` tren cung mot instance, chung se ghi de trang thai cua nhau, dan den ket qua sai hoac exception. Giai phap: (1) Dung `DateTimeFormatter` (java.time) - immutable va thread-safe, (2) Tao `SimpleDateFormat` moi trong moi thread, (3) Dung `ThreadLocal<SimpleDateFormat>`.
