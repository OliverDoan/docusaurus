---
sidebar_position: 1
title: "1. SLF4J (Facade chuẩn)"
---

# SLF4J -- Simple Logging Facade for Java

**SLF4J** không phải là logging implementation -- nó là **facade** (API trừu tượng) cho phép bạn viết code logging mà **không phụ thuộc** thư viện cụ thể. Đây là **chuẩn de facto** cho logging trong Java.

**Tương tự đơn giản:** SLF4J giống **phiên dịch viên**. Bạn nói "log info", phiên dịch chuyển sang ngôn ngữ của thư viện implement (Logback/Log4j2). Đổi implementation -- code không cần sửa.

---

## Mục lục

- [1. SLF4J là gì?](#1-slf4j-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Cách dùng cơ bản](#3-cách-dùng-cơ-bản)
- [4. Parameterized logging](#4-parameterized-logging)
- [5. MDC (Mapped Diagnostic Context)](#5-mdc-mapped-diagnostic-context)
- [6. SLF4J + Lombok](#6-slf4j-lombok)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. SLF4J là gì?

```
        Code Java
            |
        SLF4J API   <-- chi 1 API duy nhat
            |
   +--------+--------+--------+
   |        |        |        |
Logback  Log4j2  java.util JCL  (implementation -- chon 1)
```

Lợi ích:

- **Đổi implementation không sửa code**
- **Parameterized logging** -- chỉ format khi log thực sự ghi
- **Thư viện chia sẻ** dùng SLF4J -- không ép user dùng logger cụ thể

---

## 2. Cài đặt

### SLF4J + Logback (khuyến nghị)

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.9</version>
</dependency>
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.4.14</version>
</dependency>
```

**Spring Boot tự bao gồm** -- không cần thêm.

### SLF4J + Log4j2

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.9</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j2-impl</artifactId>
    <version>2.22.0</version>
</dependency>
```

---

## 3. Cách dùng cơ bản

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public void register(User user) {
        logger.info("Bat dau dang ky user");

        try {
            // logic
            logger.debug("Da kiem tra email: {}", user.getEmail());
            // ...
            logger.info("Dang ky thanh cong: id={}", user.getId());
        } catch (Exception e) {
            logger.error("Loi dang ky user: {}", user.getEmail(), e);
            throw e;
        }
    }
}
```

### 5 mức log

| Level   | Khi nào dùng                                |
| ------- | ------------------------------------------- |
| `TRACE` | Chi tiết nhất, debug sâu                    |
| `DEBUG` | Thông tin debug cho dev                     |
| `INFO`  | Sự kiện quan trọng -- "đăng ký thành công"  |
| `WARN`  | Có vấn đề nhưng không crash                 |
| `ERROR` | Lỗi nghiêm trọng                            |

Production thường log **INFO trở lên**.

---

## 4. Parameterized logging

```java
// SAI -- string concat chay du khong log
logger.debug("User: " + user.toString() + " action: " + action);

// DUNG -- {} placeholder, chi format khi log thuc su ghi
logger.debug("User: {} action: {}", user, action);

// Loi -- exception phai la tham so cuoi, KHONG dung {}
logger.error("Loi xu ly user {}", userId, exception); // co stack trace
```

### Performance comparison

```java
// Cham -- toString va concat luon chay
logger.debug("Result: " + heavyToString(obj));

// Nhanh -- toString chi chay neu DEBUG enable
logger.debug("Result: {}", obj);

// Hoac check truoc
if (logger.isDebugEnabled()) {
    logger.debug("Result: " + heavyToString(obj));
}
```

---

## 5. MDC (Mapped Diagnostic Context)

MDC = **thread-local map** -- thêm context vào mọi log của thread.

```java
import org.slf4j.MDC;

public Result handleRequest(HttpRequest req) {
    MDC.put("requestId", UUID.randomUUID().toString());
    MDC.put("userId", req.getUserId());
    try {
        // moi log trong thread se co requestId, userId
        logger.info("Bat dau xu ly");
        process(req);
        logger.info("Xu ly xong");
    } finally {
        MDC.clear();
    }
}
```

### Cấu hình logback hiển thị MDC

```xml
<!-- logback.xml -->
<pattern>%d{HH:mm:ss} [%thread] [%X{requestId}] [%X{userId}] %-5level %logger - %msg%n</pattern>
```

Output:

```
14:30:00 [http-1] [abc-123] [user-42] INFO  UserService - Bat dau xu ly
```

---

## 6. SLF4J + Lombok

Lombok `@Slf4j` tự tạo logger.

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UserService {
    public void register(User user) {
        log.info("Dang ky: {}", user); // log da co
    }
}
```

Tương đương:

```java
private static final Logger log = LoggerFactory.getLogger(UserService.class);
```

---

## Khi nào dùng?

- **Luôn dùng SLF4J trong production Java code**
- Implementation:
  - **Logback** -- mặc định Spring Boot, đơn giản, đủ tốt
  - **Log4j2** -- performance tốt nhất, nhiều tính năng (async, plugin)
- **Best practice:**
  - `Logger logger = LoggerFactory.getLogger(ClassName.class)` -- static final
  - **Parameterized logging** -- không concat
  - **MDC** cho request tracing
  - Log level **INFO** trong production
  - Đính kèm context (userId, requestId, orderId) vào log

---

## Lỗi thường gặp

### Lỗi 1: String concat

```java
// SAI -- chay du khong log
logger.debug("User: " + user); // toString() chay

// DUNG
logger.debug("User: {}", user);
```

### Lỗi 2: Quên exception

```java
// SAI -- chi log message, mat stack trace
logger.error("Loi: " + e.getMessage());

// DUNG -- exception la tham so cuoi
logger.error("Loi xu ly user {}", userId, e);
```

### Lỗi 3: Log password / PII

```java
// SAI -- lo dau secret
logger.info("Login: {} password: {}", user, password);

// DUNG -- mask
logger.info("Login attempt: {}", user.getEmail());
```

### Lỗi 4: Logger không static

```java
// SAI -- moi instance tao logger moi
private Logger logger = LoggerFactory.getLogger(getClass());

// DUNG -- static final
private static final Logger logger = LoggerFactory.getLogger(UserService.class);
```

### Lỗi 5: Quên clear MDC

```java
// SAI -- MDC vao thread, reused trong pool
MDC.put("userId", "1");
process();
// quen clear -> request sau van co userId=1

// DUNG -- try-finally hoac MDCCloseable
try (MDC.MDCCloseable c = MDC.putCloseable("userId", "1")) {
    process();
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: SLF4J là gì?

**Trả lời:** **Facade pattern** cho logging -- API trừu tượng, không phải implementation. Code dùng SLF4J interface, runtime gắn với implementation cụ thể (Logback, Log4j2). Cho phép đổi implementation mà không sửa code.

### Câu 2: Tại sao dùng `{}` thay vì concat?

**Trả lời:**

- **Performance**: Nếu level không enable (DEBUG tắt), không tốn format. Concat luôn chạy.
- **Readable**: `{}` rõ ràng cho parameter.
- **toString() lazy**: object chỉ `toString()` khi thực sự log.

### Câu 3: MDC dùng để làm gì?

**Trả lời:** Map thread-local thêm context vào log. Ví dụ requestId, userId, traceId. Trong async/concurrent app, MDC giúp **trace** một request qua nhiều log từ các thread khác nhau. Cấu hình appender hiển thị MDC với `%X{key}`.

### Câu 4: SLF4J + Logback vs Log4j2?

**Trả lời:**

- **Logback**: native cho SLF4J (cùng tác giả), default Spring Boot, đơn giản
- **Log4j2**: hiệu năng tốt hơn (async logger), nhiều plugin, lookup linh hoạt

Cả 2 đều OK. Logback chuẩn Spring; Log4j2 chọn khi cần high-throughput.

### Câu 5: 5 log level và khi nào dùng?

**Trả lời:**

- `TRACE`: chi tiết tận cùng (entry/exit method)
- `DEBUG`: dev debug (input/output, state)
- `INFO`: sự kiện business (đăng ký, đăng nhập, order)
- `WARN`: situation đáng chú ý nhưng app vẫn chạy (retry, fallback)
- `ERROR`: lỗi thực sự (exception, failed transaction)

Production: INFO trở lên. Tránh quá nhiều INFO -- log spam.
