# Lấy ngày giờ hiện tại trong Java

## Giới thiệu
Có nhiều cách để **lấy ngày giờ hiện tại trong Java**.  
Tùy theo phiên bản Java và mục đích sử dụng, chúng ta có thể lựa chọn API phù hợp như:
- `java.time` (Java 8+ – khuyến nghị)
- `java.util.Date`, `Calendar` (API cũ)

Tài liệu này tổng hợp **các cách thường dùng nhất**, đúng theo nội dung bài GP Coder.

---

## Nội dung

1. [Lấy ngày hiện tại: java.time.LocalDate](#1-lấy-ngày-hiện-tại-javatimelocaldate)  
2. [Lấy giờ hiện tại: java.time.LocalTime](#2-lấy-giờ-hiện-tại-javatimelocaltime)  
3. [Lấy ngày và giờ hiện tại: java.time.LocalDateTime](#3-lấy-ngày-và-giờ-hiện-tại-javatimelocaldatetime)  
4. [Lấy ngày và giờ hiện tại: java.time.Clock](#4-lấy-ngày-và-giờ-hiện-tại-javatimeclock)  
5. [Lấy ngày và giờ hiện tại: java.util.Date](#5-lấy-ngày-và-giờ-hiện-tại-javautildate)  
6. [Lấy ngày hiện tại: java.sql.Date](#6-lấy-ngày-hiện-tại-javasqldate)  
7. [Lấy ngày và giờ hiện tại: java.util.Calendar](#7-lấy-ngày-và-giờ-hiện-tại-javautilcalendar)  

---

## 1. Lấy ngày hiện tại: java.time.LocalDate

```java
LocalDate today = LocalDate.now();
System.out.println(today);
```

👉 Chỉ lấy **ngày** (năm – tháng – ngày), không có giờ.

---

## 2. Lấy giờ hiện tại: java.time.LocalTime

```java
LocalTime time = LocalTime.now();
System.out.println(time);
```

👉 Chỉ lấy **giờ – phút – giây**.

---

## 3. Lấy ngày và giờ hiện tại: java.time.LocalDateTime

```java
LocalDateTime now = LocalDateTime.now();
System.out.println(now);
```

👉 Không bao gồm múi giờ.

---

## 4. Lấy ngày và giờ hiện tại: java.time.Clock

```java
Clock clock = Clock.systemDefaultZone();
LocalDateTime now = LocalDateTime.now(clock);
```

✔ Dễ test  
✔ Dễ mock thời gian

---

## 5. Lấy ngày và giờ hiện tại: java.util.Date

```java
Date date = new Date();
System.out.println(date);
```

⚠️ API cũ, **không khuyến nghị dùng cho code mới**.

---

## 6. Lấy ngày hiện tại: java.sql.Date

```java
Date sqlDate = new Date(System.currentTimeMillis());
System.out.println(sqlDate);
```

👉 Thường dùng khi làm việc với **Database**.

---

## 7. Lấy ngày và giờ hiện tại: java.util.Calendar

```java
Calendar cal = Calendar.getInstance();

int year = cal.get(Calendar.YEAR);
int month = cal.get(Calendar.MONTH) + 1;
int day = cal.get(Calendar.DAY_OF_MONTH);
```

⚠️ Code dài, dễ lỗi, API cũ.

---

## Tổng kết

- **Nên dùng `java.time` (Java 8+)**
- `LocalDate`, `LocalTime`, `LocalDateTime` là phổ biến nhất
- Tránh `Date` và `Calendar` trong code mới
- Chọn API đúng giúp code rõ ràng và an toàn hơn
