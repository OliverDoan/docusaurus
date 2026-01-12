# Date & Time trong Java

## 1. Giới thiệu
Xử lý **ngày giờ (Date & Time)** là nhu cầu rất phổ biến trong lập trình:  
- Lưu thời điểm tạo dữ liệu  
- Tính toán khoảng thời gian  
- Định dạng ngày giờ để hiển thị  

Java đã trải qua **nhiều thế hệ API Date-Time**, từ cũ đến mới:
- `Date`, `Calendar` (cũ, nhiều hạn chế)
- `java.time` (Java 8+, khuyến nghị dùng)

---

## 2. Lớp Date (java.util.Date)

### 2.1 Khởi tạo Date

```java
Date now = new Date();
System.out.println(now);
```

👉 Đại diện **thời điểm hiện tại** (timestamp).

### 2.2 Hạn chế của Date
- API khó dùng
- Không thread-safe
- Nhiều method bị deprecated

⚠️ **Không khuyến khích dùng trong code mới**.

---

## 3. Lớp Calendar

```java
Calendar cal = Calendar.getInstance();
int year = cal.get(Calendar.YEAR);
int month = cal.get(Calendar.MONTH) + 1;
int day = cal.get(Calendar.DAY_OF_MONTH);
```

📌 `Calendar.MONTH` bắt đầu từ **0**.

### Hạn chế
- Code dài, khó đọc
- Dễ gây lỗi logic

---

## 4. Java 8 Date-Time API (java.time)

👉 Đây là **API hiện đại – an toàn – dễ dùng**.

---

## 5. LocalDate

### 5.1 Khởi tạo

```java
LocalDate today = LocalDate.now();
LocalDate date = LocalDate.of(2024, 5, 20);
```

### 5.2 Lấy thông tin

```java
int year = today.getYear();
int month = today.getMonthValue();
int day = today.getDayOfMonth();
```

---

## 6. LocalTime

```java
LocalTime time = LocalTime.now();

int hour = time.getHour();
int minute = time.getMinute();
int second = time.getSecond();
```

👉 Chỉ lưu **thời gian**, không có ngày.

---

## 7. LocalDateTime

```java
LocalDateTime dateTime = LocalDateTime.now();
```

👉 Kết hợp **ngày + giờ**, không gắn múi giờ.

---

## 8. ZonedDateTime (có múi giờ)

```java
ZonedDateTime zdt = ZonedDateTime.now();
ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
```

👉 Dùng khi làm việc với hệ thống **đa múi giờ**.

---

## 9. So sánh ngày giờ

```java
LocalDate d1 = LocalDate.of(2024, 1, 1);
LocalDate d2 = LocalDate.now();

d1.isBefore(d2);
d1.isAfter(d2);
d1.isEqual(d2);
```

---

## 10. Cộng / trừ thời gian

```java
LocalDate today = LocalDate.now();

LocalDate nextWeek = today.plusWeeks(1);
LocalDate yesterday = today.minusDays(1);
```

---

## 11. Khoảng thời gian (Period & Duration)

### Period – ngày, tháng, năm

```java
Period p = Period.between(d1, d2);
System.out.println(p.getDays());
```

### Duration – giờ, phút, giây

```java
Duration d = Duration.between(t1, t2);
System.out.println(d.toMinutes());
```

---

## 12. Định dạng ngày giờ (DateTimeFormatter)

```java
DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

String formatted = LocalDateTime.now().format(formatter);
```

Parse chuỗi:

```java
LocalDate date =
    LocalDate.parse("20/05/2024",
        DateTimeFormatter.ofPattern("dd/MM/yyyy"));
```

---

## 13. So sánh Date cũ và java.time

| Tiêu chí | Date / Calendar | java.time |
|--------|-----------------|-----------|
| Dễ dùng | ❌ | ✔ |
| Thread-safe | ❌ | ✔ |
| Immutable | ❌ | ✔ |
| Khuyến nghị | ❌ | ✔ |

---

## 14. Best practices

- Ưu tiên dùng `java.time`
- Tránh `Date` và `Calendar` trong code mới
- Luôn rõ ràng về **múi giờ**
- Dùng `DateTimeFormatter` thay vì tự xử lý chuỗi

---

## 15. Tổng kết

- Java 8+ cung cấp API Date-Time rất mạnh
- `LocalDate`, `LocalTime`, `LocalDateTime` dùng phổ biến nhất
- Hiểu Date-Time giúp tránh nhiều lỗi nghiêm trọng trong hệ thống
