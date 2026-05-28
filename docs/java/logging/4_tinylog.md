---
sidebar_position: 4
title: "4. TinyLog"
---

# TinyLog -- Logging nhẹ và đơn giản

**TinyLog** là logging framework Java **nhỏ gọn nhất** (~80KB) -- đơn giản, không config, nhanh. Phù hợp **library, CLI tool, project nhỏ** không muốn dependency lớn.

**Tương tự đơn giản:** Logback/Log4j 2 giống **xe tải lớn** -- chở nhiều, tính năng nhiều. TinyLog giống **xe đạp** -- nhỏ, nhanh, không cần gì phức tạp.

---

## Mục lục

- [1. TinyLog là gì?](#1-tinylog-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Cách dùng](#3-cách-dùng)
- [4. Cấu hình tinylog.properties](#4-cấu-hình-tinylogproperties)
- [5. Writer (Appender)](#5-writer-appender)
- [6. Tag (giống Logger name)](#6-tag-giống-logger-name)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. TinyLog là gì?

Đặc điểm:

- **Cực nhỏ** -- ~80KB jar
- **API static** -- không cần `Logger` instance
- **Không có dependency** -- standalone
- **Config qua properties** -- 1 file đơn giản
- **Fluent API** (TinyLog 2.x) -- chain builder

TinyLog 2.x là phiên bản hiện tại.

---

## 2. Cài đặt

```xml
<dependency>
    <groupId>org.tinylog</groupId>
    <artifactId>tinylog-api</artifactId>
    <version>2.6.2</version>
</dependency>
<dependency>
    <groupId>org.tinylog</groupId>
    <artifactId>tinylog-impl</artifactId>
    <version>2.6.2</version>
</dependency>
```

### Bridge SLF4J (nếu app dùng SLF4J)

```xml
<dependency>
    <groupId>org.tinylog</groupId>
    <artifactId>slf4j-tinylog</artifactId>
    <version>2.6.2</version>
</dependency>
```

---

## 3. Cách dùng

### Static API (đặc trưng TinyLog)

```java
import org.tinylog.Logger;

public class App {
    public static void main(String[] args) {
        Logger.info("Hello TinyLog!");
        Logger.debug("Debug message");
        Logger.error("Loi xay ra");

        // Voi exception
        try {
            // ...
        } catch (Exception e) {
            Logger.error(e, "Loi xu ly user {}", userId);
        }

        // Voi tham so
        Logger.info("User {} co {} bai post", userName, postCount);
    }
}
```

**Khác biệt:** Không có `LoggerFactory.getLogger(Class)` -- gọi `Logger.info` trực tiếp. TinyLog **tự xác định** class gọi.

### Fluent API (2.x)

```java
Logger.tag("DB").info("Connected to MySQL");

// Voi message provider (lazy)
Logger.info(() -> "Heavy computation: " + heavy());
```

---

## 4. Cấu hình tinylog.properties

Đặt ở `src/main/resources/tinylog.properties`:

```properties
# Level toan he thong
level = info

# Format
format = {date: yyyy-MM-dd HH:mm:ss} [{thread}] {level}: {class}.{method}() - {message}

# Writers (appenders)
writer1 = console
writer1.level = info

writer2 = rolling file
writer2.file = logs/app_{date:yyyy-MM-dd}.log
writer2.policies = startup, size: 100mb
writer2.backups = 30
writer2.level = debug

# Level per package
level@com.example = debug
level@org.hibernate = warn
```

### Format placeholder

| Placeholder       | Mô tả                       |
| ----------------- | --------------------------- |
| `{date:format}`   | Date/time                   |
| `{thread}`        | Tên thread                  |
| `{level}`         | INFO, DEBUG...              |
| `{class}`         | Class name                  |
| `{method}`        | Method name                 |
| `{line}`          | Line number                 |
| `{message}`       | Log message                 |
| `{tag}`           | Tag                         |
| `{exception}`     | Stack trace                 |

---

## 5. Writer (Appender)

```properties
# Console
writer_console = console
writer_console.format = {level}: {message}
writer_console.stream = err          # stdout / err

# File
writer_file = file
writer_file.file = logs/app.log
writer_file.append = true            # noi tiep

# Rolling file
writer_roll = rolling file
writer_roll.file = logs/app_{date:yyyy-MM-dd}.log
writer_roll.policies = startup, daily, size: 100mb
writer_roll.backups = 30
writer_roll.convert = gzip           # nen file cu

# JSON
writer_json = json
writer_json.file = logs/app.json
writer_json.format = LDJSON          # newline-delimited JSON

# SQL writer (insert vao DB)
writer_db = jdbc
writer_db.url = jdbc:postgresql://localhost/logs
writer_db.user = log_user
writer_db.password = secret
writer_db.table = log_entries
writer_db.fields = level=level, message=message
```

---

## 6. Tag (giống Logger name)

TinyLog không có cấu trúc "logger hierarchy" như Logback. Thay vào đó dùng **tag**.

```java
Logger.tag("DB").info("Query executed");
Logger.tag("AUTH").warn("Failed login: {}", email);
```

```properties
# Chi log "DB" tag
level@DB = debug
level@AUTH = warn

# Writer chi nhan tag cu the
writer1 = file
writer1.tag = AUDIT  # chi nhan log co tag=AUDIT
```

---

## Khi nào dùng?

- **TinyLog khi:**
  - CLI tool, app nhỏ
  - Library không muốn ép user logger
  - Embedded system, IoT
  - Cần dependency cực nhỏ
- **Logback/Log4j 2 khi:**
  - Enterprise app
  - Cần ecosystem rộng (appender JSON, integration ELK)
  - Spring Boot
- **Best practice:**
  - Cấu hình qua `tinylog.properties`
  - Dùng tag thay logger hierarchy
  - Lazy logging với `() -> ...` cho heavy computation
  - Async writer nếu cần

---

## Lỗi thường gặp

### Lỗi 1: Trộn TinyLog với SLF4J

```xml
<!-- KHONG can ca 2 trong app cua minh -->
<dependency>slf4j-api</dependency>
<dependency>slf4j-tinylog</dependency>
<dependency>tinylog-api</dependency>
<dependency>tinylog-impl</dependency>
```

Chỉ cần nếu lib bên ngoài dùng SLF4J.

### Lỗi 2: Static API gây khó test

```java
// SAI -- kho mock
Logger.info("Test");

// Co the dung TaggedLogger field neu can test
```

### Lỗi 3: Quên properties file

TinyLog tìm `tinylog.properties` trong classpath -- nếu không có, dùng default (Console, INFO).

### Lỗi 4: Format sai

```properties
# SAI -- thieu placeholder
format = {time}: {message}  # {time} khong ton tai

# DUNG
format = {date: HH:mm:ss}: {message}
```

---

## Câu hỏi phỏng vấn

### Câu 1: TinyLog khác Logback/Log4j 2 thế nào?

**Trả lời:**

- **Kích thước**: TinyLog ~80KB, Logback/Log4j 2 lớn hơn nhiều
- **API**: TinyLog static (`Logger.info()`), Logback/Log4j 2 instance-based
- **Hierarchy**: TinyLog không có logger tree -- dùng tag
- **Config**: TinyLog properties file, Logback XML

TinyLog phù hợp project nhỏ, embedded. Logback/Log4j 2 phù hợp enterprise.

### Câu 2: Tại sao TinyLog static API?

**Trả lời:** Đơn giản hóa -- không cần khai báo `Logger logger = LoggerFactory.getLogger(...)` ở mỗi class. TinyLog tự xác định class gọi bằng stack trace (cache để tối ưu). Trade-off: hơi tốn performance, khó mock test.

### Câu 3: Tag thay logger hierarchy?

**Trả lời:** Logback/Log4j 2 dùng cây package -- `com.example.user` kế thừa từ `com.example`. TinyLog không có cây -- dùng tag tự do (`DB`, `AUTH`, `API`). Linh hoạt nhưng mất khả năng kế thừa level.

### Câu 4: TinyLog có hỗ trợ async không?

**Trả lời:** **Có** -- writer có thuộc tính `buffered=true` và async write. Tuy nhiên không mạnh như Log4j 2 Disruptor. Phù hợp throughput vừa phải.

### Câu 5: Khi nào nên dùng TinyLog?

**Trả lời:**

- **Library** -- không muốn ép user dùng SLF4J/Logback (mặc dù SLF4J facade phổ biến hơn)
- **CLI tool, embedded** -- jar size quan trọng
- **App đơn giản** -- không cần feature phức tạp
- **Phụ thuộc 0** -- TinyLog không có transitive dep

Production enterprise -- vẫn nên Logback/Log4j 2.
