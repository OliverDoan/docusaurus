---
sidebar_position: 2
title: "2. SLF4J"
---

# 2. SLF4J

---

## Mục lục

- [SLF4J là gì?](#slf4j-là-gì)
- [SLF4J chỉ là facade, không ghi log thật](#slf4j-chỉ-là-facade-không-ghi-log-thật)
- [Cài đặt SLF4J](#cài-đặt-slf4j)
- [Tạo logger với LoggerFactory.getLogger](#tạo-logger-với-loggerfactorygetlogger)
- [Ghi log với placeholder dấu ngoặc nhọn](#ghi-log-với-placeholder-dấu-ngoặc-nhọn)
- [Ghi log lỗi kèm exception](#ghi-log-lỗi-kèm-exception)
- [Vì sao nên viết code theo SLF4J?](#vì-sao-nên-viết-code-theo-slf4j)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## SLF4J là gì?

**SLF4J** viết tắt của **Simple Logging Facade for Java** (mặt tiền ghi log đơn giản cho
Java). Nó là **facade** (lớp trừu tượng) phổ biến nhất trong thế giới Java.

Nhớ lại ví dụ ổ cắm điện ở bài trước: SLF4J chính là cái **ổ cắm chuẩn**. Code của bạn
"cắm" vào SLF4J, còn việc ghi log thật do một thư viện khác (Logback, Log4j2) đảm nhận.

---

## SLF4J chỉ là facade, không ghi log thật

Đây là điểm khiến người mới hay bối rối. SLF4J **tự nó KHÔNG ghi được log**. Nếu bạn chỉ
thêm SLF4J vào dự án mà không có một **implementation** (bản cài đặt thật) nào, bạn sẽ
thấy cảnh báo:

```text
SLF4J: No SLF4J providers were found.
SLF4J: Defaulting to no-operation (NOP) logger implementation
```

Dịch ra: "Không tìm thấy bộ ghi log nào, nên mọi lệnh log sẽ KHÔNG làm gì cả".

Để log thật sự xuất hiện, bạn cần cặp đôi:

- **SLF4J** (facade): để gọi `logger.info(...)`.
- **Logback** hoặc **Log4j2** (implementation): để thực sự ghi ra màn hình/file.

May mắn là nếu bạn dùng **Spring Boot**, cặp **SLF4J + Logback** đã được thêm sẵn, bạn
không phải làm gì thêm.

---

## Cài đặt SLF4J

Nếu KHÔNG dùng Spring Boot, bạn cần tự thêm SLF4J và một implementation. Ví dụ dùng
Maven, thêm SLF4J kèm Logback (Logback đã tự kéo theo SLF4J):

```xml
<!-- pom.xml: thêm Logback, nó tự kéo theo SLF4J facade -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.5.6</version>
</dependency>
```

Với Spring Boot, chỉ cần `spring-boot-starter` là đã có sẵn, không cần thêm gì.

---

## Tạo logger với LoggerFactory.getLogger

Trong mỗi lớp cần ghi log, bạn tạo một đối tượng **logger** (bộ ghi log). Cách chuẩn:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrderService {

    // Tạo logger riêng cho lớp OrderService.
    // - private: chỉ dùng trong lớp này.
    // - static: chỉ tạo MỘT lần dùng chung, không tạo lại mỗi đối tượng.
    // - final: không thay đổi sau khi gán.
    // Truyền OrderService.class để logger biết log thuộc về lớp nào.
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    public void taoDonHang(String maDon) {
        logger.info("Đang tạo đơn hàng: {}", maDon);
    }
}
```

Vì sao truyền `OrderService.class`? Để mỗi dòng log tự kèm tên lớp, giúp bạn biết log
này phát ra từ đâu — giống như mỗi lá thư đều có ghi tên người gửi.

---

## Ghi log với placeholder dấu ngoặc nhọn

SLF4J dùng cặp `{}` làm **placeholder** (chỗ giữ chỗ). Giá trị truyền vào sẽ lần lượt
điền vào các `{}`. Đây là cách **đúng** và được khuyến khích:

```java
String email = "an@gmail.com";
int soDon = 5;

// CÁCH ĐÚNG: dùng {} làm placeholder
logger.info("Người dùng {} có {} đơn hàng", email, soDon);
// Kết quả: Người dùng an@gmail.com có 5 đơn hàng
```

So với cách nối chuỗi bằng dấu `+`:

```java
// CÁCH KHÔNG NÊN: nối chuỗi bằng dấu +
logger.debug("Người dùng " + email + " có " + soDon + " đơn hàng");
```

Vì sao nên dùng `{}` thay vì `+`? Vì hiệu năng. Khi dùng `+`, chuỗi được ghép NGAY LẬP
TỨC, kể cả khi log đó bị tắt (ví dụ mức DEBUG đang bị ẩn). Với `{}`, SLF4J chỉ ghép chuỗi
KHI THẬT SỰ cần ghi — nếu log bị tắt thì không tốn công ghép, giúp chương trình nhanh hơn.

---

## Ghi log lỗi kèm exception

Khi có lỗi (exception), bạn nên ghi cả thông điệp lẫn chi tiết lỗi. Truyền đối tượng
exception làm **tham số cuối cùng** (không cần `{}` cho nó):

```java
try {
    thanhToan(maDon);
} catch (Exception e) {
    // Truyền exception ở cuối -> SLF4J in ra cả stack trace (vết gọi hàm dẫn tới lỗi)
    logger.error("Thanh toán thất bại cho đơn hàng {}", maDon, e);
}
```

Stack trace sẽ chỉ cho bạn chính xác dòng code nào gây lỗi — rất quan trọng khi gỡ lỗi.

---

## Vì sao nên viết code theo SLF4J?

1. **Đổi implementation mà không sửa code.** Hôm nay dùng Logback, mai đổi Log4j2 — code
   gọi `logger.info(...)` giữ nguyên. Chỉ cần thay thư viện.

2. **Là chuẩn chung.** Hầu hết thư viện Java nổi tiếng (Spring, Hibernate...) đều log qua
   SLF4J. Dùng SLF4J giúp log của bạn và của thư viện thống nhất một định dạng.

3. **Hiệu năng tốt nhờ placeholder `{}`.** Như đã giải thích, tránh ghép chuỗi thừa.

4. **API đơn giản, dễ học.** Chỉ cần nhớ vài hàm: `trace`, `debug`, `info`, `warn`,
   `error`.

Quy tắc vàng: **luôn viết code log theo SLF4J**, không gọi trực tiếp Logback hay Log4j2.

---

## Lỗi thường gặp

- **Chỉ thêm SLF4J mà quên implementation.** Log không xuất hiện và có cảnh báo "No SLF4J
  providers were found". Hãy thêm Logback hoặc Log4j2.
- **Thêm nhiều implementation cùng lúc** (cả Logback lẫn Log4j2). Sẽ có cảnh báo "Class
  path contains multiple SLF4J providers". Chỉ giữ MỘT cái.
- **Nối chuỗi bằng `+` thay vì dùng `{}`.** Gây tốn hiệu năng khi log bị tắt.
- **Gọi sai số lượng tham số.** Số `{}` nên khớp số giá trị truyền vào (trừ exception ở
  cuối).
- **Import nhầm.** Phải dùng `org.slf4j.Logger`, đừng nhầm với `java.util.logging.Logger`.

---

## Tóm tắt

- **SLF4J** là **facade** ghi log phổ biến nhất cho Java; nó KHÔNG tự ghi log.
- Cần ghép SLF4J với một **implementation** (Logback, Log4j2) thì log mới xuất hiện.
- Tạo logger bằng `LoggerFactory.getLogger(TenLop.class)`, đặt `private static final`.
- Dùng placeholder `{}` để ghi log nhanh và an toàn; truyền exception ở cuối để in stack
  trace.
- Luôn viết code theo SLF4J để dễ thay đổi implementation sau này.
