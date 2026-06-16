---
sidebar_position: 3
title: "3. Logback"
---

# 3. Logback

Logback là một implementation ghi log thật và là lựa chọn mặc định trong Spring Boot, đóng vai trò "nhà máy điện" thực sự ghi log ra màn hình hoặc file. Bài này hướng dẫn cấu hình Logback qua file `logback.xml`: khai báo appender để chọn nơi ghi log, định dạng dòng log bằng pattern, xoay file theo ngày và kích thước với RollingFile, cùng cách đặt level riêng cho từng package.

---

## Mục lục

- [Vì sao Logback ra đời?](#vì-sao-logback-ra-đời)
- [Logback là gì?](#logback-là-gì)
- [Logback là mặc định của Spring Boot](#logback-là-mặc-định-của-spring-boot)
- [File cấu hình logback.xml](#file-cấu-hình-logbackxml)
- [Appender: ghi log đi đâu?](#appender-ghi-log-đi-đâu)
- [Pattern: định dạng dòng log](#pattern-định-dạng-dòng-log)
- [Rolling File: xoay file theo ngày và kích thước](#rolling-file-xoay-file-theo-ngày-và-kích-thước)
- [Đặt level theo từng package](#đặt-level-theo-từng-package)
- [Một file logback.xml hoàn chỉnh](#một-file-logbackxml-hoàn-chỉnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao Logback ra đời?

**Vấn đề:** Log4j 1.x (ra đời năm 1999) đã phục vụ tốt trong nhiều năm, nhưng dần bộc lộ những điểm yếu khó vá: kiến trúc cũ khiến hiệu năng hạn chế, không hỗ trợ tự reload cấu hình khi file thay đổi, và không có tích hợp native với SLF4J — nghĩa là mọi dự án cần thêm một adapter ở giữa để dùng API chuẩn:

```java
// Log4j 1.x: không triển khai SLF4J natively
// Cần thêm bridge jar "slf4j-log4j12" mới dùng được Logger của SLF4J
import org.apache.log4j.Logger; // API riêng của Log4j, không chuẩn SLF4J
Logger logger = Logger.getLogger(MyApp.class);
logger.info("Log4j 1.x — cần adapter thêm để dùng cùng SLF4J");
```

**Giải pháp:** Chính tác giả của Log4j — Ceki Gülcü — viết lại từ đầu và tạo ra **Logback** (2006) để khắc phục toàn bộ những hạn chế trên: nhanh hơn đáng kể, footprint nhỏ, tự reload cấu hình khi file `logback.xml` thay đổi mà không cần khởi động lại, và quan trọng nhất — **native triển khai SLF4J** nên không cần adapter:

```xml
<!-- pom.xml: Spring Boot kéo logback-classic tự động, không cần thêm gì -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <!-- logback-classic đã được kéo vào, SLF4J hoạt động ngay -->
</dependency>
```

```java
// Logback native SLF4J: dùng thẳng Logger của SLF4J, không cần adapter
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

Logger logger = LoggerFactory.getLogger(MyApp.class); // SLF4J API thuần
logger.info("Logback xử lý log này trực tiếp — không cần bridge jar");
```

:::tip[Dùng thực tế]
- **Spring Boot** chọn Logback làm engine logging mặc định vì tích hợp sẵn, không cần cấu hình thêm.
- **Tự reload cấu hình** cho phép thay đổi log level trên production mà không cần restart ứng dụng.
- **Dự án cần ghi log vào nhiều đích** (console + file + database) cùng lúc nhờ hệ thống Appender linh hoạt.
- **Giảm dung lượng ổ đĩa** với RollingFileAppender tự xoay và xóa file log cũ theo chính sách định sẵn.
:::

---

## Logback là gì?

**Logback** là một **implementation** (bản cài đặt thật) của logging, do chính tác giả
của Log4j viết lại để nhanh và ổn định hơn. Nó là "nhà máy điện" thực sự ghi log ra màn
hình hoặc file, còn SLF4J chỉ là "ổ cắm" chuẩn.

Logback hoạt động ăn khớp hoàn hảo với SLF4J: bạn gọi `logger.info(...)` qua SLF4J, và
Logback lo phần ghi thật.

---

## Logback là mặc định của Spring Boot

Nếu bạn tạo một dự án **Spring Boot**, Logback đã được thêm sẵn. Bạn không cần thêm thư
viện gì cả — chỉ cần tạo logger và ghi log là chạy ngay:

```java
private static final Logger logger = LoggerFactory.getLogger(MyApp.class);

logger.info("Ứng dụng đã khởi động");
```

Spring Boot có sẵn cấu hình mặc định in log ra màn hình rất đẹp. Bạn chỉ cần tùy chỉnh
khi muốn ghi vào file hoặc đổi định dạng.

---

## File cấu hình logback.xml

Để tùy chỉnh Logback, bạn tạo file `logback.xml` (hoặc `logback-spring.xml` nếu dùng
Spring Boot) trong thư mục `src/main/resources/`. Cấu trúc cơ bản:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Khai báo các appender (nơi ghi log) ở đây -->

    <!-- Khai báo level (ngưỡng ghi log) ở đây -->
</configuration>
```

`<configuration>` là thẻ gốc, mọi cấu hình nằm bên trong nó.

> Với Spring Boot nên đặt tên `logback-spring.xml` thay vì `logback.xml`, vì tên này cho
> phép dùng thêm các tính năng riêng của Spring.

---

## Appender: ghi log đi đâu?

**Appender** (bộ ghi đích) quyết định log được ghi vào ĐÂU. Có nhiều loại; hai loại hay
dùng nhất:

- **ConsoleAppender:** ghi ra **màn hình** (console).
- **FileAppender / RollingFileAppender:** ghi vào **file**.

Ví dụ ghi ra màn hình:

```xml
<!-- Appender ghi log ra màn hình (console) -->
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <!-- Định dạng mỗi dòng log -->
        <pattern>%d{HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

Ví dụ ghi vào file:

```xml
<!-- Appender ghi log vào file app.log -->
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>logs/app.log</file>  <!-- Đường dẫn file log -->
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

---

## Pattern: định dạng dòng log

**Pattern** (khuôn mẫu) quy định mỗi dòng log trông như thế nào. Các ký hiệu hay dùng:

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `%d{...}` | **date** — thời gian, ví dụ `%d{yyyy-MM-dd HH:mm:ss}` |
| `%level` hoặc `%-5level` | **level** — mức log (số 5 căn lề cho thẳng cột) |
| `%logger{36}` | tên lớp ghi log (36 = số ký tự tối đa) |
| `%msg` | **message** — nội dung thông điệp |
| `%n` | xuống dòng (newline) |
| `%thread` | tên luồng đang chạy |

Ví dụ pattern và kết quả:

```text
Pattern: %d{HH:mm:ss} %-5level %logger{36} - %msg%n
Kết quả: 08:30:15 INFO  c.example.OrderService - Đơn hàng 1234 đã tạo
```

---

## Rolling File: xoay file theo ngày và kích thước

Nếu ghi mãi vào một file, file sẽ phình to vô tận (vài GB) và không thể mở nổi.
**RollingFileAppender** giải quyết bằng cách **xoay file** (rolling): tự tạo file mới khi
qua ngày hoặc khi file quá lớn, và xóa file cũ.

Tưởng tượng cuốn lịch để bàn: mỗi ngày bạn xé một tờ. RollingFileAppender cũng "xé" file
log mỗi ngày, tạo file mới cho ngày hôm nay.

```xml
<!-- Appender xoay file: mỗi ngày một file, giữ tối đa 30 ngày -->
<appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/app.log</file>  <!-- File log hiện tại -->

    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <!-- Tên file cũ: thêm ngày tháng và số thứ tự -->
        <fileNamePattern>logs/app-%d{yyyy-MM-dd}.%i.log</fileNamePattern>

        <!-- Mỗi file tối đa 10MB, vượt thì tạo file mới (%i tăng dần) -->
        <maxFileSize>10MB</maxFileSize>

        <!-- Giữ log của 30 ngày gần nhất, cũ hơn thì tự xóa -->
        <maxHistory>30</maxHistory>

        <!-- Tổng dung lượng tất cả file log tối đa 1GB -->
        <totalSizeCap>1GB</totalSizeCap>
    </rollingPolicy>

    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

Với cấu hình trên: log hôm nay ghi vào `app.log`; sang ngày mới, file hôm qua được đổi
tên thành `app-2026-06-03.0.log`; nếu file một ngày quá 10MB thì cắt thành nhiều phần
`.0`, `.1`...; và tự xóa file cũ hơn 30 ngày.

---

## Đặt level theo từng package

Bạn có thể đặt **ngưỡng level** khác nhau cho từng phần code. Hai khái niệm:

- **logger:** đặt level cho một package/lớp cụ thể.
- **root logger:** level mặc định áp dụng cho tất cả phần còn lại.

```xml
<!-- Root logger: mặc định ghi từ INFO trở lên cho TOÀN BỘ ứng dụng -->
<root level="INFO">
    <appender-ref ref="CONSOLE"/>  <!-- Dùng appender CONSOLE đã khai báo -->
    <appender-ref ref="ROLLING"/>  <!-- Và ghi cả vào file -->
</root>

<!-- Riêng package của bạn thì ghi chi tiết hơn (DEBUG) để dễ gỡ lỗi -->
<logger name="com.example.myapp" level="DEBUG"/>

<!-- Thư viện Spring chỉ cần WARN trở lên cho đỡ rối màn hình -->
<logger name="org.springframework" level="WARN"/>
```

Cách này rất hữu ích: bạn xem chi tiết code của mình (DEBUG) nhưng vẫn ẩn bớt log "ồn ào"
từ các thư viện bên ngoài (chỉ WARN trở lên).

---

## Một file logback.xml hoàn chỉnh

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 1) Appender ghi ra màn hình -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 2) Appender xoay file theo ngày và kích thước -->
    <appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/app-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 3) Đặt level riêng cho code của bạn -->
    <logger name="com.example.myapp" level="DEBUG"/>

    <!-- 4) Level mặc định cho phần còn lại -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ROLLING"/>
    </root>

</configuration>
```

---

## Lỗi thường gặp

- **Đặt sai tên file cấu hình.** Phải là `logback.xml` (hoặc `logback-spring.xml`) trong
  `src/main/resources/`, đặt sai chỗ thì Logback bỏ qua.
- **Quên `<appender-ref>` trong `<root>`.** Khai báo appender mà không "gắn" vào root thì
  log không được ghi.
- **Đường dẫn file không có quyền ghi.** Logback không tạo được file và báo lỗi. Hãy
  kiểm tra thư mục `logs/` có quyền ghi không.
- **Quên `maxHistory`.** File log sẽ tích lũy mãi và đầy ổ đĩa. Luôn đặt giới hạn.
- **Sửa XML nhưng không chạy lại.** Cấu hình thường chỉ nạp khi khởi động lại ứng dụng.

---

## Tóm tắt

- **Logback** là implementation ghi log thật, **mặc định trong Spring Boot**.
- Cấu hình qua `logback.xml` (hoặc `logback-spring.xml`) trong `src/main/resources/`.
- **Appender** quyết định ghi log đi đâu: `ConsoleAppender` (màn hình),
  `RollingFileAppender` (file).
- **Pattern** định dạng dòng log với các ký hiệu `%d`, `%level`, `%logger`, `%msg`, `%n`.
- **RollingFileAppender** xoay file theo ngày/kích thước và tự xóa file cũ.
- Đặt **level theo package** để xem chi tiết code của mình mà ẩn bớt log thư viện.
