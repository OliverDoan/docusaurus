---
sidebar_position: 20
title: "Date & Time trong Java"
---

# Date & Time trong Java

**Xu ly ngay gio (Date & Time)** la mot trong nhung tac vu pho bien nhat trong lap trinh: luu thoi diem tao tai khoan, tinh tuoi, dat lich hen, xu ly timezone cho ung dung quoc te. Java cung cap nhieu API de lam viec voi ngay gio, nhung khong phai API nao cung tot.

Hay hinh dung viec xu ly ngay gio nhu viec **doc dong ho**: API cu (`Date`, `Calendar`) giong nhu mot chiec dong ho cu ky, kim dang bi long, kho doc va hay sai. API moi (`java.time`) giong nhu dong ho thong minh - chinh xac, de doc, va co nhieu tinh nang huu ich.

Bai nay se giup ban hieu ca API cu (de bao tri code legacy) va API moi (de viet code moi chat luong).

---

## 1. API cu: `Date` va `Calendar` (truoc Java 8)

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

**Van de cua `Date`:**
- **Mutable** (thay doi duoc): goi `setTime()` se thay doi doi tuong goc, gay ra loi kho debug
- Nhieu method da bi **deprecated** (`getYear()`, `getMonth()`, `getDay()`)
- **Khong thread-safe**: 2 thread cung dung 1 doi tuong `Date` co the gay loi
- Khong phan biet ro "ngay" va "ngay gio"

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

**Van de cua `Calendar`:**
- **Month bat dau tu 0**: Thang 1 = 0, Thang 12 = 11 (rat de nham)
- **Mutable**: `cal.add()` thay doi doi tuong goc
- Code dai dong, kho doc
- Khong thread-safe

---

## 2. API moi: `java.time` (Java 8+)

Tu Java 8, goi `java.time` ra doi de khac phuc toan bo van de cua API cu. Tat ca cac lop trong `java.time` deu la **immutable** (bat bien) va **thread-safe**.

### 2.1 `LocalDate` - Chi ngay (khong co gio)

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

### 2.2 `LocalTime` - Chi gio (khong co ngay)

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

### 2.3 `LocalDateTime` - Ngay + Gio (khong co timezone)

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

### 2.4 `ZonedDateTime` - Ngay gio voi timezone

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

### 2.5 `Instant` - Moc thoi gian tuyet doi (timestamp)

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

## 3. DateTimeFormatter - Dinh dang va parse ngay gio

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

**Cac ky hieu pattern thuong dung:**

| Ky hieu | Y nghia | Vi du |
|---|---|---|
| `yyyy` | Nam 4 chu so | 2026 |
| `MM` | Thang (01-12) | 04 |
| `dd` | Ngay (01-31) | 02 |
| `HH` | Gio 24h (00-23) | 14 |
| `hh` | Gio 12h (01-12) | 02 |
| `mm` | Phut (00-59) | 30 |
| `ss` | Giay (00-59) | 45 |
| `a` | AM/PM | PM |
| `EEEE` | Thu (day ten) | Thursday |
| `MMMM` | Thang (day ten) | April |

---

## 4. Period va Duration - Khoang cach thoi gian

### 4.1 `Period` - Khoang cach theo ngay/thang/nam

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

### 4.2 `Duration` - Khoang cach theo gio/phut/giay

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

| Tieu chi | Period | Duration |
|---|---|---|
| Don vi | Nam, Thang, Ngay | Gio, Phut, Giay, Nano |
| Dung cho | `LocalDate` | `LocalTime`, `LocalDateTime`, `Instant` |
| Vi du | "2 nam 3 thang" | "5 gio 30 phut" |

---

## 5. So sanh va cong tru ngay gio

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

## 6. So sanh API cu va API moi

| Tieu chi | `Date` / `Calendar` | `java.time` (Java 8+) |
|---|---|---|
| Immutable | Khong (mutable) | Co (immutable) |
| Thread-safe | Khong | Co |
| Month | 0-based (0 = Jan) | 1-based (1 = Jan) |
| API design | Kho hieu, dai dong | Truc quan, gon gang |
| Timezone | Phuc tap | Ro rang voi `ZonedDateTime` |
| Null-safe | Khong | Co |
| Khuyen nghi | Chi dung khi bao tri code cu | **Luon dung cho code moi** |

---

## Khi nao dung?

**Chon lop nao cho phu hop:**
- **`LocalDate`**: Chi can ngay (sinh nhat, ngay het han, ngay le)
- **`LocalTime`**: Chi can gio (gio mo cua, gio hen)
- **`LocalDateTime`**: Can ngay + gio nhung khong quan tam timezone (lich hop noi bo)
- **`ZonedDateTime`**: Ung dung da quoc gia, can chuyen doi timezone
- **`Instant`**: Luu timestamp vao database, do thoi gian thuc thi, log he thong
- **`Period`**: Tinh khoang cach theo ngay/thang/nam (tinh tuoi)
- **`Duration`**: Tinh khoang cach theo gio/phut/giay (do performance)

**Best practices:**
- **Luon dung `java.time`** cho code moi, tranh `Date` va `Calendar`
- Luon **ro rang ve timezone** khi ung dung phuc vu nhieu vung
- Dung `DateTimeFormatter` de format/parse, khong tu xu ly chuoi
- Luu thoi gian vao database bang **`Instant`** (UTC), chuyen doi timezone khi hien thi
- Dung `Period.between()` va `Duration.between()` thay vi tu tinh toan

---

## Loi thuong gap

### 1. Nham month 0-based cua Calendar

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

### 2. Quen rang java.time la immutable

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

### 4. Dung Date thay vi java.time trong code moi

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

## Cau hoi phong van

### 1. Tai sao `java.time` tot hon `Date` va `Calendar`?

**Tra loi:** `java.time` tot hon vi: (1) **Immutable va thread-safe** - khong the thay doi doi tuong da tao, an toan khi dung da luong. (2) **API truc quan** - `LocalDate.of(2026, 3, 15)` de hieu hon Calendar voi month 0-based. (3) **Tach biet ro rang** - `LocalDate` (chi ngay), `LocalTime` (chi gio), `ZonedDateTime` (co timezone). (4) **DateTimeFormatter thread-safe** - khac voi `SimpleDateFormat` cua API cu.

### 2. `LocalDateTime` va `ZonedDateTime` khac nhau nhu the nao?

**Tra loi:** `LocalDateTime` luu ngay va gio **khong co thong tin timezone** - giong nhu doc gio tren dong ho treo tuong (chi biet "14:30" nhung khong biet la 14:30 o dau). `ZonedDateTime` luu ngay gio **kem theo timezone cu the** (vi du "14:30 Asia/Ho_Chi_Minh"). Dung `LocalDateTime` cho ung dung don timezone, dung `ZonedDateTime` khi can chuyen doi gio giua cac vung.

### 3. `Instant` la gi va khi nao dung?

**Tra loi:** `Instant` dai dien cho mot **thoi diem tuyet doi tren truc thoi gian**, duoc luu duoi dang so giay va nano-giay tinh tu epoch (01/01/1970 00:00:00 UTC). No khong co thong tin timezone hay calendar. Dung `Instant` khi can: luu timestamp vao database, do thoi gian thuc thi code, ghi log he thong, so sanh 2 thoi diem bat ke timezone.

### 4. Lam sao format ngay gio voi custom pattern?

**Tra loi:** Dung `DateTimeFormatter.ofPattern()`:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
String result = LocalDateTime.now().format(formatter); // "02/04/2026 14:30:45"
LocalDateTime parsed = LocalDateTime.parse("02/04/2026 14:30:45", formatter);
```

Cac ky hieu: `yyyy` (nam), `MM` (thang), `dd` (ngay), `HH` (gio 24h), `mm` (phut), `ss` (giay), `EEEE` (thu), `a` (AM/PM). `DateTimeFormatter` la immutable va thread-safe, co the tai su dung an toan.
