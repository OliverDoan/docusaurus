---
sidebar_position: 4
title: "4. Log4j2"
---

# 4. Log4j2

Log4j2 là một implementation ghi log của Apache, nổi bật ở hiệu năng cao, đặc biệt khi dùng async logger để ghi log bất đồng bộ. Bài này hướng dẫn cách cài đặt và thay thế Logback trong Spring Boot, cấu hình qua file `log4j2.xml`, bật async logger, so sánh với Logback, và nhắc lại bài học bảo mật quan trọng từ lỗ hổng Log4Shell.

---

## Mục lục

- [Log4j2 là gì?](#log4j2-là-gì)
- [Cài đặt Log4j2](#cài-đặt-log4j2)
- [File cấu hình log4j2.xml](#file-cấu-hình-log4j2xml)
- [Async Logger: ghi log bất đồng bộ, hiệu năng cao](#async-logger-ghi-log-bất-đồng-bộ-hiệu-năng-cao)
- [So sánh Log4j2 với Logback](#so-sánh-log4j2-với-logback)
- [Lỗ hổng Log4Shell và việc cập nhật phiên bản](#lỗ-hổng-log4shell-và-việc-cập-nhật-phiên-bản)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Log4j2 là gì?

**Log4j2** (Apache Log4j 2) là một **implementation** ghi log của tổ chức Apache, thế hệ
thứ hai của thư viện Log4j nổi tiếng. Giống Logback, nó là "nhà máy điện" ghi log thật,
và cũng làm việc qua facade SLF4J.

Điểm nổi bật nhất của Log4j2 là **hiệu năng cao**, đặc biệt khi dùng **async logger**
(ghi log bất đồng bộ). Vì vậy nó thường được chọn cho các hệ thống ghi RẤT NHIỀU log và
cần tốc độ tối đa.

---

## Cài đặt Log4j2

Trong Spring Boot, mặc định là Logback. Muốn dùng Log4j2, bạn phải **gỡ Logback ra** rồi
thêm Log4j2 vào:

```xml
<!-- pom.xml -->

<!-- 1) Gỡ Logback mặc định khỏi spring-boot-starter -->
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

<!-- 2) Thêm starter Log4j2 thay thế -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

Lưu ý quan trọng: không bao giờ để CẢ Logback lẫn Log4j2 cùng tồn tại — sẽ xung đột.

---

## File cấu hình log4j2.xml

Tạo file `log4j2.xml` (hoặc `log4j2-spring.xml`) trong `src/main/resources/`. Cấu trúc
hơi khác Logback nhưng ý tưởng giống nhau:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">

    <Appenders>
        <!-- Ghi log ra màn hình -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss} %-5level %logger{36} - %msg%n"/>
        </Console>

        <!-- Ghi log xoay file theo ngày và kích thước -->
        <RollingFile name="RollingFile"
                     fileName="logs/app.log"
                     filePattern="logs/app-%d{yyyy-MM-dd}-%i.log">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n"/>
            <Policies>
                <!-- Xoay file mỗi ngày -->
                <TimeBasedTriggeringPolicy/>
                <!-- Xoay file khi vượt 10MB -->
                <SizeBasedTriggeringPolicy size="10MB"/>
            </Policies>
            <!-- Giữ tối đa 30 file cũ -->
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
    </Appenders>

    <Loggers>
        <!-- Level riêng cho code của bạn -->
        <Logger name="com.example.myapp" level="debug" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingFile"/>
        </Logger>

        <!-- Level mặc định cho phần còn lại -->
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingFile"/>
        </Root>
    </Loggers>

</Configuration>
```

So với Logback: thẻ viết hoa chữ cái đầu (`<Appenders>`, `<Console>`, `<Root>`), và
appender file được gọi là `<RollingFile>`. Còn lại pattern, level, rolling đều cùng ý
tưởng như bài Logback.

---

## Async Logger: ghi log bất đồng bộ, hiệu năng cao

Đây là "vũ khí" mạnh nhất của Log4j2.

- **Synchronous** (đồng bộ): chương trình phải ĐỢI ghi log xong mới chạy tiếp. Giống như
  bạn gọi món rồi đứng đợi bếp nấu xong mới rời quầy.
- **Asynchronous** (bất đồng bộ): chương trình ĐƯA log cho một luồng khác ghi giúp, rồi
  chạy tiếp ngay. Giống như bạn gọi món, lấy số rồi về bàn ngồi, bếp tự mang ra sau.

Async logger giúp chương trình KHÔNG bị chậm lại vì phải đợi ghi log, đặc biệt hữu ích
khi ghi cực nhiều log. Cách bật đơn giản nhất: thêm thư viện **LMAX Disruptor** rồi đặt
một thuộc tính hệ thống:

```xml
<!-- pom.xml: thư viện Disruptor để Log4j2 chạy async hiệu năng cao -->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.4</version>
</dependency>
```

```properties
# Đặt thuộc tính hệ thống để dùng async cho TẤT CẢ logger
# (truyền qua tham số -D khi chạy ứng dụng)
-Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
```

Lưu ý: code ghi log vẫn y nguyên (`logger.info(...)`) — bạn chỉ đổi cấu hình, không sửa
code nghiệp vụ.

---

## So sánh Log4j2 với Logback

| Tiêu chí | Logback | Log4j2 |
|----------|---------|--------|
| Mặc định Spring Boot | Có (dùng ngay) | Không (phải thay thủ công) |
| Hiệu năng async | Tốt | **Rất tốt** (nhờ Disruptor) |
| Tên file cấu hình | `logback.xml` | `log4j2.xml` |
| Cú pháp XML | thẻ chữ thường | thẻ viết hoa chữ đầu |
| Độ phổ biến | Rất phổ biến | Phổ biến |

Lời khuyên cho người mới: nếu chưa có nhu cầu đặc biệt về hiệu năng, cứ dùng **Logback**
mặc định. Chỉ chuyển sang Log4j2 khi bạn thật sự cần async logger tốc độ cao.

---

## Lỗ hổng Log4Shell và việc cập nhật phiên bản

Cuối năm 2021, Log4j2 dính một lỗ hổng bảo mật cực kỳ nghiêm trọng có tên
**Log4Shell** (mã CVE-2021-44228). Lỗ hổng này nằm ở tính năng JNDI Lookup: kẻ tấn công
chỉ cần gửi một chuỗi đặc biệt vào nội dung được log (ví dụ tên đăng nhập), Log4j2 sẽ
"vô tình" tải và chạy mã độc từ máy chủ của kẻ tấn công.

Mức độ nguy hiểm: kẻ tấn công có thể chiếm quyền điều khiển máy chủ từ xa, chỉ qua một
dòng log. Hàng triệu hệ thống trên thế giới bị ảnh hưởng.

Bài học và cách phòng tránh:

1. **Luôn dùng phiên bản Log4j2 mới và đã vá lỗi** (từ 2.17.1 trở lên, càng mới càng tốt).
   Đừng bao giờ dùng các phiên bản cũ dính lỗ hổng.

2. **Cập nhật thư viện thường xuyên.** Lỗ hổng bảo mật được phát hiện liên tục; cập nhật
   giúp bạn được vá kịp thời.

```xml
<!-- Luôn dùng phiên bản Log4j2 mới đã vá lỗ hổng -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.23.1</version>  <!-- dùng bản mới nhất ổn định -->
</dependency>
```

> Log4Shell là lời nhắc rằng: ngay cả một thư viện logging tưởng "vô hại" cũng có thể là
> cửa ngõ cho tấn công. Giữ thư viện luôn mới là một thói quen bảo mật quan trọng.

---

## Lỗi thường gặp

- **Để cả Logback lẫn Log4j2 trong dự án.** Gây xung đột, log có thể không chạy. Phải gỡ
  Logback trước khi thêm Log4j2.
- **Dùng phiên bản Log4j2 cũ dính Log4Shell.** Rủi ro bảo mật nghiêm trọng. Luôn dùng bản
  mới đã vá.
- **Quên thư viện Disruptor khi muốn async.** Không có Disruptor thì async không hoạt động
  tối ưu.
- **Đặt sai tên/đường dẫn file cấu hình.** Phải là `log4j2.xml` trong
  `src/main/resources/`.
- **Quên `additivity="false"`.** Nếu một logger và root cùng gắn một appender mà không đặt
  `additivity="false"`, log sẽ bị in TRÙNG hai lần.

---

## Tóm tắt

- **Log4j2** là implementation ghi log của Apache, nổi bật ở **hiệu năng cao**.
- Trong Spring Boot phải **gỡ Logback** rồi thêm `spring-boot-starter-log4j2`.
- Cấu hình qua `log4j2.xml`; cú pháp viết hoa chữ đầu, ý tưởng giống Logback.
- **Async logger** (cần thư viện Disruptor) giúp ghi log bất đồng bộ, không làm chậm
  chương trình.
- Nhớ vụ **Log4Shell**: luôn dùng phiên bản mới đã vá lỗi và cập nhật thư viện thường
  xuyên.
- Người mới chưa cần hiệu năng đặc biệt thì cứ dùng Logback mặc định.
