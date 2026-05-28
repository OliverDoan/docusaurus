---
sidebar_position: 2
title: "2. Logback"
---

# Logback -- Logging implementation phổ biến

**Logback** là logging implementation của **SLF4J** -- cùng tác giả (Ceki Gülcü). Là **default** cho Spring Boot, đơn giản, mạnh mẽ, đủ cho hầu hết production app.

**Tương tự đơn giản:** Nếu SLF4J là "phiên dịch viên", Logback là **người ghi sổ tay** thực sự -- viết log vào file, console, gửi đi đâu đó tùy cấu hình.

---

## Mục lục

- [1. Logback là gì?](#1-logback-là-gì)
- [2. Cấu hình logback.xml](#2-cấu-hình-logbackxml)
- [3. Appender](#3-appender)
- [4. Logger và Level](#4-logger-và-level)
- [5. Pattern Layout](#5-pattern-layout)
- [6. Rolling File](#6-rolling-file)
- [7. Async Appender](#7-async-appender)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Logback là gì?

Đặc điểm:

- **Native SLF4J** -- không cần adapter
- **Tốc độ cao** -- nhanh hơn Log4j 1.x
- **Cấu hình XML/Groovy** -- linh hoạt
- **Hot reload** -- đổi config không restart
- **Async appender** -- log non-blocking

Logback có 3 module:

- `logback-core`: nền tảng
- `logback-classic`: SLF4J implementation
- `logback-access`: HTTP access log (servlet)

---

## 2. Cấu hình logback.xml

Đặt ở `src/main/resources/logback.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <property name="LOG_DIR" value="logs" />
    <property name="LOG_PATTERN"
        value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n" />

    <!-- Console -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <!-- File -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_DIR}/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_DIR}/app.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <!-- Logger cu the -->
    <logger name="com.example" level="DEBUG" />
    <logger name="org.springframework" level="INFO" />

    <!-- Root logger -->
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

---

## 3. Appender

Appender = nơi log được ghi.

### ConsoleAppender

```xml
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d %level %msg%n</pattern>
    </encoder>
</appender>
```

### FileAppender

```xml
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>logs/app.log</file>
    <append>true</append>
    <encoder>
        <pattern>%d %msg%n</pattern>
    </encoder>
</appender>
```

### RollingFileAppender (file xoay)

Tạo file mới theo size hoặc thời gian.

```xml
<appender name="ROLL" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/app.log</file>

    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <!-- Format ten file moi -->
        <fileNamePattern>logs/app.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>

        <!-- Roll khi file >100MB -->
        <maxFileSize>100MB</maxFileSize>

        <!-- Giu 30 ngay -->
        <maxHistory>30</maxHistory>

        <!-- Tong dung luong toi da -->
        <totalSizeCap>3GB</totalSizeCap>
    </rollingPolicy>

    <encoder>
        <pattern>%d %msg%n</pattern>
    </encoder>
</appender>
```

### JSON Appender (Logstash encoder)

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

```xml
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
</appender>
```

Output JSON cho ELK/Datadog.

---

## 4. Logger và Level

### Tree hierarchy

```
ROOT
  com
    com.example
      com.example.user
        com.example.user.UserService
```

Logger con kế thừa level từ cha. Set chi tiết cho từng phần:

```xml
<root level="INFO">...</root>

<logger name="com.example" level="DEBUG" />          <!-- App code DEBUG -->
<logger name="org.springframework" level="WARN" />   <!-- Spring it noise -->
<logger name="org.hibernate.SQL" level="DEBUG" />    <!-- Hibernate query -->
<logger name="org.hibernate.type" level="TRACE" />   <!-- Hibernate params -->
```

### Additivity

```xml
<!-- additivity=false -- chi log vao APPENDER nay, khong propagate len root -->
<logger name="com.example.audit" level="INFO" additivity="false">
    <appender-ref ref="AUDIT_FILE" />
</logger>
```

---

## 5. Pattern Layout

| Pattern        | Mô tả                              |
| -------------- | ---------------------------------- |
| `%d{format}`   | Date/time                          |
| `%thread`      | Tên thread                         |
| `%level`       | Level (INFO, ERROR...)             |
| `%logger{36}`  | Logger name (truncate)             |
| `%msg`         | Message                            |
| `%n`           | Newline                            |
| `%X{key}`      | MDC value                          |
| `%ex`          | Exception stack trace              |
| `%file:%line`  | Filename:line (chậm)               |

Ví dụ:

```xml
<pattern>%d{HH:mm:ss.SSS} [%thread] [%X{requestId}] %highlight(%-5level) %cyan(%logger{36}) - %msg%n</pattern>
```

---

## 6. Rolling File

### Rolling theo thời gian

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <fileNamePattern>logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
    <maxHistory>30</maxHistory>
</rollingPolicy>
```

### Rolling theo size

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
    <fileNamePattern>logs/app.%i.log.zip</fileNamePattern>
    <minIndex>1</minIndex>
    <maxIndex>10</maxIndex>
</rollingPolicy>
<triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
    <maxFileSize>100MB</maxFileSize>
</triggeringPolicy>
```

### Cả 2 (khuyến nghị)

`SizeAndTimeBasedRollingPolicy` -- roll khi đủ size **hoặc** sang ngày mới.

---

## 7. Async Appender

Log đồng bộ chậm dưới load cao. Async đẩy log vào queue, worker thread ghi.

```xml
<appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="FILE" />
    <queueSize>5000</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <includeCallerData>false</includeCallerData>
</appender>

<root level="INFO">
    <appender-ref ref="ASYNC_FILE" />
</root>
```

**Lưu ý:** Crash đột ngột có thể mất log trong queue.

---

## Khi nào dùng?

- **Logback khi:**
  - Spring Boot project (mặc định)
  - Đơn giản, ít magic
  - Đủ performance cho 99% case
- **Log4j2 khi:**
  - Cực high-throughput
  - Cần plugin nhiều
- **Best practice:**
  - Pattern: include thread, level, logger, MDC
  - Rolling theo size + time
  - JSON output cho production (ELK, Datadog)
  - Async appender khi log nhiều
  - **Tắt** Hibernate SQL trong production

---

## Lỗi thường gặp

### Lỗi 1: Log vào working directory không tồn tại

```xml
<!-- SAI -- thu muc khong ton tai -->
<file>/var/log/app.log</file>

<!-- Logback tu tao? Khong luon -->
```

Test trên môi trường thật, đảm bảo permission.

### Lỗi 2: Log không xoay (rolling không hoạt động)

- Sai `fileNamePattern` (thiếu `%d` hoặc `%i`)
- Disk full
- Logback version cũ -- update

### Lỗi 3: Quá nhiều log -> đầy disk

```xml
<totalSizeCap>5GB</totalSizeCap>
<maxHistory>30</maxHistory>
```

### Lỗi 4: Async queue full

```xml
<queueSize>10000</queueSize>     <!-- tang -->
<discardingThreshold>50</discardingThreshold> <!-- discard TRACE/DEBUG khi day 80% -->
```

### Lỗi 5: Slow caller data

```xml
<!-- includeCallerData=true cham -- can stack trace mỗi log -->
<includeCallerData>false</includeCallerData>
```

---

## Câu hỏi phỏng vấn

### Câu 1: Logback vs Log4j2?

**Trả lời:** Cả 2 đều SLF4J implementation, mạnh mẽ:

- **Logback**: default Spring Boot, native SLF4J, đơn giản hơn
- **Log4j2**: async logger built-in (LMAX Disruptor) -- nhanh nhất, nhiều plugin

99% case Logback đủ. Log4j2 chọn khi cần high-throughput (>100k log/sec).

### Câu 2: Rolling file là gì?

**Trả lời:** Tự tạo file log mới khi đủ điều kiện (size, time) -- tránh 1 file lớn vô tận, dễ quản lý. `TimeBasedRollingPolicy` (theo thời gian), `SizeAndTimeBasedRollingPolicy` (cả 2). Set `maxHistory` và `totalSizeCap` để giới hạn.

### Câu 3: Async Appender hoạt động thế nào?

**Trả lời:** Đẩy log event vào **queue** (BlockingQueue), worker thread riêng ghi vào appender thật. Logging method trả về ngay -- không block thread chính. Trade-off: queue full = block hoặc discard, crash = mất log trong queue.

### Câu 4: MDC trong Logback?

**Trả lời:** Logback đọc MDC qua `%X{key}` trong pattern. Mỗi log tự đính kèm context như requestId, userId. Trong async/web app, MDC giúp trace một request qua nhiều log.

### Câu 5: Tại sao tránh `%file:%line`?

**Trả lời:** Để lấy file:line, JVM phải tạo stack trace -- **rất tốn** (chậm 100x). OK trong dev, **tránh production**. Thay bằng `%logger` (đủ thông tin).
