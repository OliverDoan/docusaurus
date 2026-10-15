---
sidebar_position: 12
title: "12. Logging"
---

# 12. Logging

## 1. Tổng quan về Logging

Bài học: [1. Tổng quan về Logging](../../java/12-logging/1_tong-quan-logging.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Logging khác gì với việc dùng `System.out.println` để debug? Nêu ít nhất ba lý do nên dùng logging framework trong dự án thật.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Có level (mức độ)**: phân biệt được log quan trọng (`ERROR`) với log chi tiết (`DEBUG`), trong khi `println` in mọi thứ giống hệt nhau.
- **Bật/tắt được không cần sửa code**: chỉ cần đổi cấu hình ngưỡng level, không phải xóa/thêm dòng `println` bằng tay.
- **Ghi được ra file, xoay vòng (rotate), gửi tới hệ thống giám sát**: `println` chỉ in ra console rồi mất, không lưu lại để tra cứu sau sự cố.
- **Tự động kèm metadata**: timestamp, tên thread, tên class được thêm tự động, không cần tự gõ.
- **Hiệu năng và an toàn đa luồng tốt hơn**: các thư viện logging tối ưu I/O (ví dụ ghi bất đồng bộ), còn `System.out` ghi đồng bộ và có thể là điểm nghẽn khi nhiều luồng cùng in.

</details>

**2. Liệt kê các mức log (log level) trong Java từ thấp tới cao. Nếu đặt ngưỡng là `WARN`, log ở mức `INFO` có được ghi ra không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự từ thấp tới cao: `TRACE` → `DEBUG` → `INFO` → `WARN` → `ERROR`.

- **Không**, log ở mức `INFO` sẽ **bị bỏ qua** vì `INFO` thấp hơn ngưỡng `WARN` đã đặt.
- Quy tắc chung: chỉ những log có level **bằng hoặc cao hơn** ngưỡng mới được ghi ra đích (console/file). Với ngưỡng `WARN`, chỉ `WARN` và `ERROR` được ghi.

</details>

**3. Facade và implementation trong logging là gì? Vì sao Java lại tách riêng hai khái niệm này thay vì gộp chung một thư viện?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Facade** (`SLF4J`) là lớp trừu tượng chuẩn, chỉ định nghĩa API gọi log (`logger.info(...)`) nhưng không tự ghi log ra đâu cả.
- **Implementation** (`Logback`, `Log4j2`) mới là thư viện thực sự xử lý và ghi log ra console/file/hệ thống tập trung.
- Tách riêng để code nghiệp vụ chỉ phụ thuộc vào facade (`SLF4J`), không phụ thuộc trực tiếp vào một implementation cụ thể. Nhờ vậy có thể **đổi implementation** (ví dụ từ `Logback` sang `Log4j2`) chỉ bằng cách đổi dependency, mà **không cần sửa một dòng code nghiệp vụ nào** — tương tự nguyên lý lập trình theo interface thay vì implementation cụ thể.
- Đây cũng là lý do các thư viện bên thứ ba (ví dụ một thư viện HTTP client) thường chỉ phụ thuộc `SLF4J` API, để ứng dụng dùng thư viện đó có thể tự chọn implementation ghi log của riêng mình.

</details>

**4. So sánh `SLF4J`, `Logback`, `Log4j2` và `TinyLog` — cái nào là facade, cái nào là implementation?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thư viện | Vai trò | Đặc điểm |
|---|---|---|
| `SLF4J` | Facade | Chuẩn API chung, không tự ghi log |
| `Logback` | Implementation | Mặc định của Spring Boot, ổn định, dễ cấu hình XML |
| `Log4j2` | Implementation | Hiệu năng cao, hỗ trợ ghi log bất đồng bộ (async logging) qua LMAX Disruptor |
| `TinyLog` | Cả facade lẫn implementation gộp gọn | Siêu nhẹ, không cần cấu hình phức tạp, hợp ứng dụng nhỏ |

- `SLF4J` không đứng một mình được — luôn cần một implementation (`Logback` hoặc `Log4j2`) đi kèm mới thực sự ghi log.
- `TinyLog` là ngoại lệ: nó tự cung cấp cả hai vai trò trong cùng một thư viện gọn nhẹ.

</details>

**5. Đoạn code sau có vấn đề gì về hiệu năng? Nên viết lại thế nào cho đúng?**

```java
logger.debug("Chi tiết đơn hàng: " + donHang.toChuoiChiTiet());
```

<details className="qa">
<summary>Xem đáp án</summary>

**Vấn đề**: Biểu thức nối chuỗi `"Chi tiết đơn hàng: " + donHang.toChuoiChiTiet()` **luôn được tính toán** trước khi gọi `logger.debug(...)`, bất kể level `DEBUG` có đang bật hay không. Nếu `toChuoiChiTiet()` tốn kém (ví dụ build chuỗi lớn, truy vấn thêm dữ liệu), chi phí này vẫn xảy ra ngay cả khi ngưỡng log đang đặt ở `INFO` trở lên và dòng log này sẽ bị bỏ qua.

**Cách viết đúng** — dùng **parameterized logging** (log có tham số) với placeholder `{}`:

```java
logger.debug("Chi tiết đơn hàng: {}", donHang.toChuoiChiTiet());
```

- Với SLF4J, cách này vẫn phải tính `toChuoiChiTiet()` trước khi truyền vào (Java luôn evaluate tham số của method), nên nếu phần tính toán thực sự nặng, cách an toàn nhất là bọc thêm điều kiện kiểm tra level:

```java
if (logger.isDebugEnabled()) {
    logger.debug("Chi tiết đơn hàng: {}", donHang.toChuoiChiTiet());
}
```

- Với các tham số đơn giản (biến có sẵn, không cần tính toán tốn kém) thì chỉ cần dùng `{}` là đủ, không cần bọc `isDebugEnabled()`.

</details>

**6. Tại sao không nên ghi mật khẩu hay số thẻ tín dụng vào log, kể cả ở môi trường development? Nêu cách xử lý phù hợp khi cần log dữ liệu nhạy cảm.**

<details className="qa">
<summary>Xem đáp án</summary>

- File log thường được lưu lại lâu dài, sao lưu, và có thể được nhiều người (đội vận hành, đội hỗ trợ) truy cập — dữ liệu nhạy cảm ghi vào log coi như bị "rò rỉ" ra ngoài phạm vi kiểm soát ban đầu, kể cả khi hệ thống chính đã mã hóa dữ liệu đó.
- Nhiều tiêu chuẩn bảo mật/tuân thủ (ví dụ PCI-DSS cho dữ liệu thẻ) **cấm tuyệt đối** việc ghi log thông tin thẻ, mật khẩu dạng rõ.
- Cách xử lý phù hợp:
  - **Che bớt (masking)**: chỉ log vài ký tự cuối, ví dụ số thẻ `**** **** **** 1234`.
  - **Không log field nhạy cảm**: loại trừ các field như `password`, `token` khi log toàn bộ object (nhiều framework có annotation để đánh dấu field cần ẩn khi serialize).
  - **Log ID thay vì dữ liệu thật**: ví dụ log `orderId` thay vì toàn bộ thông tin thanh toán.

</details>

**7. Một dòng log thật (ví dụ `2026-06-04 08:30:15.123 INFO 10240 --- [main] c.example.OrderService : Đơn hàng 1234 đã tạo`) gồm những thành phần nào? Vì sao các thành phần này hữu ích khi truy vết sự cố?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Timestamp** (`2026-06-04 08:30:15.123`): xác định chính xác thời điểm sự kiện xảy ra, quan trọng để sắp xếp thứ tự sự kiện và đối chiếu với báo cáo lỗi từ người dùng.
- **Level** (`INFO`): cho biết mức độ nghiêm trọng, giúp lọc nhanh log quan trọng khi hệ thống có hàng triệu dòng log mỗi ngày.
- **Thread** (`[main]`): trong ứng dụng đa luồng, cho biết log này thuộc luồng xử lý nào — cực kỳ quan trọng khi debug race condition hoặc request bị xử lý đồng thời.
- **Tên class** (`c.example.OrderService`): xác định chính xác vị trí trong code phát ra log, giúp nhảy thẳng tới đoạn code liên quan.
- **Message**: nội dung nghiệp vụ cụ thể.
- Nhờ có đầy đủ các thành phần này mà một dòng log có thể tái hiện lại "ai, ở đâu, lúc nào, làm gì" mà không cần đọc lại toàn bộ mã nguồn.

</details>

**8. Trong một hệ thống production xử lý hàng triệu request/ngày, bạn nên chọn ngưỡng log level nào, và tại sao đặt toàn bộ log ở mức `DEBUG` khi chạy thật lại là một sai lầm phổ biến?**

<details className="qa">
<summary>Xem đáp án</summary>

- Thường chọn ngưỡng **`INFO`** cho môi trường production, chỉ hạ xuống `DEBUG` tạm thời khi cần điều tra một sự cố cụ thể rồi trả lại `INFO` ngay sau đó.
- Đặt `DEBUG` (hoặc `TRACE`) làm mặc định ở production gây ra:
  - **File log phình to rất nhanh**, tốn dung lượng đĩa và chi phí lưu trữ (đặc biệt nếu dùng dịch vụ log tập trung tính phí theo dung lượng).
  - **Giảm hiệu năng ứng dụng**: việc build message và ghi I/O cho hàng triệu dòng log dư thừa tiêu tốn CPU và có thể làm chậm luồng xử lý chính.
  - **Khó tìm thông tin quan trọng**: log `ERROR`/`WARN` bị "chìm" giữa hàng nghìn dòng `DEBUG` không cần thiết.
- Giải pháp thực tế: cấu hình ngưỡng theo môi trường (development dùng `DEBUG`, production dùng `INFO`) thông qua file cấu hình, không hard-code trong source.

</details>

**9. `SLF4J` một mình có ghi được log ra file không? Nếu dự án chỉ khai báo dependency `slf4j-api` mà quên thêm implementation, điều gì sẽ xảy ra khi chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Không.** `SLF4J` chỉ là facade — cung cấp API để gọi (`Logger`, `LoggerFactory`), bản thân nó không có logic ghi log ra đích nào.
- Nếu chỉ có `slf4j-api` mà thiếu implementation, khi chạy chương trình `SLF4J` sẽ in ra cảnh báo dạng:

```text
SLF4J: No SLF4J providers were found.
SLF4J: Defaulting to no-operation (NOP) logger implementation
```

- Chương trình vẫn chạy bình thường (không crash), nhưng **mọi lệnh gọi `logger.info(...)`, `logger.error(...)` đều bị "nuốt mất"** — không có gì được ghi ra console hay file, vì SLF4J rơi về "no-operation logger" (logger không làm gì cả).
- Cách khắc phục: thêm dependency implementation phù hợp, ví dụ `logback-classic` (Logback) hoặc `log4j-slf4j2-impl` (Log4j2), vào classpath.

</details>

---

## 2. SLF4J

Bài học: [2. SLF4J](../../java/12-logging/2_slf4j.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `SLF4J` là gì? Nó có tự ghi log ra file/console được không?**

<details className="qa">
<summary>Xem đáp án</summary>

`SLF4J` (Simple Logging Facade for Java) là **facade** (lớp trừu tượng chuẩn) cho việc ghi log trong Java, cung cấp API thống nhất (`Logger`, `LoggerFactory`) để gọi log.

- **Không**, `SLF4J` tự nó **không ghi được log** ra bất kỳ đâu. Nó chỉ định nghĩa API gọi log; việc ghi log thật sự do một **implementation** đi kèm (`Logback`, `Log4j2`) đảm nhiệm.
- Nếu chỉ có `SLF4J` mà thiếu implementation, chương trình vẫn chạy nhưng log sẽ rơi vào "no-operation logger" — không in ra gì cả.

</details>

**2. Cách tạo logger đúng chuẩn trong một class Java là gì? Vì sao logger thường được khai báo `private static final`?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
```

- **`private`**: logger chỉ dùng nội bộ trong class, không cần expose ra ngoài.
- **`static`**: chỉ tạo **một instance dùng chung** cho mọi object của class, tránh tạo lại logger mỗi khi khởi tạo object mới — tiết kiệm bộ nhớ và tài nguyên.
- **`final`**: tham chiếu logger không đổi sau khi gán, đúng tinh thần bất biến và tránh vô tình gán lại logger ở nơi khác trong code.
- Truyền `OrderService.class` (chứ không phải class khác) để mỗi dòng log tự động gắn kèm đúng tên class phát ra log, giúp tra vết log về đúng nguồn.

</details>

**3. So sánh hai cách ghi log sau. Cách nào tốt hơn về hiệu năng, và vì sao?**

```java
// Cách A
logger.debug("Người dùng " + email + " có " + soDon + " đơn hàng");

// Cách B
logger.debug("Người dùng {} có {} đơn hàng", email, soDon);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Cách B (dùng placeholder `{}`) tốt hơn.**

- Ở cách A, biểu thức nối chuỗi `"..." + email + "..." + soDon + "..."` được Java **tính toán ngay lập tức** trước khi gọi `logger.debug(...)`, bất kể level `DEBUG` có đang được bật hay không. Nếu `DEBUG` bị tắt (thường gặp ở production), công sức ghép chuỗi này hoàn toàn lãng phí.
- Ở cách B, `SLF4J` chỉ thực hiện ghép chuỗi (thay thế `{}` bằng giá trị tham số) **khi thật sự cần ghi log**, tức là chỉ khi level `DEBUG` đang được bật. Nếu bị tắt, `SLF4J` bỏ qua ngay từ đầu mà không tốn công ghép chuỗi.
- Với ứng dụng log nhiều, sự khác biệt này tích lũy lại có thể ảnh hưởng rõ rệt tới hiệu năng.

</details>

**4. Cách ghi log kèm exception dưới đây có đúng không? Giải thích cách SLF4J xử lý tham số cuối cùng là một exception.**

```java
try {
    thanhToan(maDon);
} catch (Exception e) {
    logger.error("Thanh toán thất bại cho đơn hàng {}", maDon, e);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Đúng.** Đây là cách chuẩn để ghi log kèm exception trong `SLF4J`.

- Chuỗi format `"Thanh toán thất bại cho đơn hàng {}"` chỉ có **một** placeholder `{}`, tương ứng với tham số `maDon`.
- Tham số cuối cùng (`e`) là một `Throwable`/`Exception` — `SLF4J` **tự động nhận diện** đây là exception (không phải giá trị điền vào placeholder) và in kèm **toàn bộ stack trace** của nó bên dưới message, thay vì cố gắng thay thế nó vào một `{}` nào.
- Nếu số `{}` khớp đúng với số tham số thường (không tính exception ở cuối), log sẽ hiển thị chính xác; nếu không có exception, các tham số phải khớp đủ số `{}`.

</details>

**5. Vì sao trong dự án Spring Boot, bạn thường không cần tự thêm dependency Logback hay Log4j2?**

<details className="qa">
<summary>Xem đáp án</summary>

- `spring-boot-starter` (và mọi starter khác kế thừa nó) đã **kéo theo sẵn** `spring-boot-starter-logging`, trong đó bao gồm cả `SLF4J` (facade) và `Logback` (implementation mặc định).
- Vì vậy chỉ cần thêm một starter Spring Boot bất kỳ vào dự án là đã có đủ cặp `SLF4J + Logback` để ghi log ngay, không cần khai báo thêm dependency thủ công.
- Nếu muốn đổi sang `Log4j2`, cần loại trừ (`exclude`) `spring-boot-starter-logging` rồi thêm `spring-boot-starter-log4j2` thay thế.

</details>

**6. Điều gì xảy ra nếu một dự án vô tình khai báo cả `logback-classic` lẫn `log4j-slf4j2-impl` trong classpath cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

`SLF4J` sẽ phát hiện có **nhiều hơn một implementation** cùng đăng ký, và in ra cảnh báo tương tự:

```text
SLF4J: Class path contains multiple SLF4J providers.
```

- `SLF4J` sẽ tự chọn một trong số đó để dùng (thứ tự chọn phụ thuộc vào cách classpath được nạp), điều này gây ra hành vi **khó đoán trước** và có thể khác nhau giữa các lần chạy hoặc giữa các môi trường.
- Cách khắc phục: chỉ giữ **đúng một** implementation trong dependency của dự án — loại bỏ (`exclude`) implementation còn lại.

</details>

**7. Vì sao thư viện SLF4J lại trở thành lựa chọn phổ biến để các thư viện Java bên thứ ba (ví dụ Hibernate, một HTTP client) dùng để log, thay vì gọi trực tiếp `Logback` hoặc `java.util.logging`?**

<details className="qa">
<summary>Xem đáp án</summary>

- Nếu một thư viện bên thứ ba log trực tiếp qua `Logback`, mọi ứng dụng dùng thư viện đó **buộc phải** kéo theo `Logback` — dù ứng dụng muốn dùng `Log4j2` hay implementation khác cũng không thể tránh xung đột.
- Bằng cách log qua `SLF4J` (chỉ là API, không ràng buộc implementation), thư viện bên thứ ba để ngỏ quyền chọn implementation cho ứng dụng dùng nó — ứng dụng chỉ cần thêm implementation mình muốn (Logback, Log4j2...) vào classpath là mọi log, kể cả từ thư viện bên thứ ba, đều tự động chảy qua cùng một implementation đó.
- Đây là lý do `SLF4J` gần như trở thành chuẩn "de facto" (mặc nhiên) trong hệ sinh thái Java hiện đại, giúp thống nhất định dạng log giữa code của bạn và log của các thư viện đang dùng.

</details>

**8. Trong đoạn code sau, dòng log có in ra chính xác giá trị của `soDon` không? Nếu số lượng `{}` không khớp số tham số truyền vào thì điều gì xảy ra?**

```java
int soDon = 5;
logger.info("Người dùng có đơn hàng", soDon);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Message `"Người dùng có đơn hàng"` không có placeholder `{}` nào, nên tham số `soDon` được truyền vào **không được sử dụng** — dòng log chỉ in ra đúng `"Người dùng có đơn hàng"`, không có giá trị `5` xuất hiện ở đâu cả.

- `SLF4J` **không ném lỗi (exception)** khi số `{}` không khớp số tham số — đây không phải lỗi biên dịch hay runtime, chỉ là placeholder thừa/thiếu bị bỏ qua hoặc không được điền.
- Nếu có nhiều `{}` hơn số tham số truyền vào, các `{}` dư sẽ được giữ nguyên dạng chữ trong message.
- Đây là lỗi khó phát hiện vì code biên dịch và chạy bình thường, chỉ có thể phát hiện bằng cách đọc kỹ log output hoặc review code cẩn thận.

</details>

**9. Bạn được giao review một class mới, thấy khai báo `import java.util.logging.Logger;` thay vì `import org.slf4j.Logger;`. Đây có phải vấn đề không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có, đây là lỗi cần sửa** trong một dự án đã chuẩn hóa dùng SLF4J.

- `java.util.logging.Logger` (thường viết tắt JUL) là API logging **có sẵn trong JDK**, hoàn toàn khác và không tương thích với `org.slf4j.Logger`.
- Nếu một class vô tình import nhầm `java.util.logging.Logger`, log của class đó sẽ **không đi qua** cấu hình Logback/Log4j2 chung của dự án (định dạng, ngưỡng level, đích ghi log riêng), dẫn tới log bị thiếu nhất quán — ví dụ không xuất hiện trong file log tập trung, hoặc định dạng khác hẳn phần còn lại.
- Cách sửa: đổi lại đúng `import org.slf4j.Logger;` và `import org.slf4j.LoggerFactory;`, đảm bảo mọi class trong dự án dùng chung một cơ chế logging.

</details>

---

## 3. Logback

Bài học: [3. Logback](../../java/12-logging/3_logback.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Logback là gì? Nó liên quan thế nào tới SLF4J?**

<details className="qa">
<summary>Xem đáp án</summary>

**Logback** là một **implementation** (bản cài đặt thật) của logging cho Java — thứ thực sự ghi log ra console, file hoặc đích khác. Nó do chính tác giả của Log4j 1.x (Ceki Gülcü) viết lại từ đầu năm 2006 để khắc phục các hạn chế của Log4j 1.x.

- **SLF4J** là facade (chuẩn API gọi log), còn **Logback** là implementation đứng phía sau thực thi việc ghi.
- Logback triển khai **native** API của SLF4J — nghĩa là code gọi `logger.info(...)` qua `SLF4J` sẽ được Logback xử lý trực tiếp, không cần một adapter/bridge jar trung gian nào, khác với Log4j 1.x.
- Logback là implementation **mặc định** đi kèm khi tạo dự án Spring Boot.

</details>

**2. Khác biệt giữa `logback.xml` và `logback-spring.xml`? Vì sao trong dự án Spring Boot nên dùng file thứ hai?**

<details className="qa">
<summary>Xem đáp án</summary>

- `logback.xml` là tên file cấu hình chuẩn của Logback (dùng được cả trong dự án Java thuần lẫn Spring Boot).
- `logback-spring.xml` là tên file dành riêng để Spring Boot xử lý **trước khi** Logback nạp cấu hình, cho phép dùng thêm các phần tử mở rộng riêng của Spring, ví dụ `<springProfile name="...">` để áp dụng cấu hình khác nhau theo profile (`dev`, `prod`...).
- Nếu dùng `logback.xml` thông thường trong dự án Spring Boot, các phần tử mở rộng như `<springProfile>` sẽ **không hoạt động** vì Logback không hiểu cú pháp riêng của Spring — đây là lý do tài liệu Spring Boot khuyến nghị đặt tên `logback-spring.xml`.

</details>

**3. Appender trong Logback là gì? So sánh `ConsoleAppender` và `RollingFileAppender`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Appender** (bộ ghi đích) là thành phần quyết định một dòng log được ghi ra **đâu**.

| | `ConsoleAppender` | `RollingFileAppender` |
|---|---|---|
| Đích ghi | Màn hình (console/stdout) | File, có xoay vòng (rolling) |
| Dùng khi | Development, xem log trực tiếp khi chạy | Production, cần lưu trữ lâu dài |
| Quản lý dung lượng | Không áp dụng (không lưu trữ) | Có, qua `rollingPolicy` (`maxFileSize`, `maxHistory`, `totalSizeCap`) |

- Một cấu hình Logback thường dùng **cả hai cùng lúc**: `ConsoleAppender` để xem log ngay khi phát triển, `RollingFileAppender` để lưu lại phục vụ tra cứu sau này — cả hai được gắn vào cùng một `<root>` hoặc `<logger>`.

</details>

**4. Cho pattern `%d{HH:mm:ss} %-5level %logger{36} - %msg%n`, hãy giải thích từng ký hiệu và dự đoán output cho một log `logger.warn("Ổ đĩa gần đầy")` phát ra lúc 09:15:42 từ class `com.example.DiskMonitor`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `%d{HH:mm:ss}`: thời gian theo định dạng giờ:phút:giây.
- `%-5level`: level, căn trái (`-`) và chiếm tối thiểu 5 ký tự để các dòng log thẳng cột.
- `%logger{36}`: tên class phát log, rút gọn tối đa 36 ký tự.
- `%msg`: nội dung message.
- `%n`: xuống dòng.

Output dự kiến:

```text
09:15:42 WARN  com.example.DiskMonitor - Ổ đĩa gần đầy
```

(Lưu ý `WARN ` có khoảng trắng đệm thêm phía sau để đủ 5 ký tự căn lề, đúng với `%-5level`.)

</details>

**5. `RollingFileAppender` với `SizeAndTimeBasedRollingPolicy` giải quyết vấn đề gì? Giải thích ý nghĩa của `maxFileSize`, `maxHistory`, và `totalSizeCap`.**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: nếu ghi log mãi vào một file duy nhất, file sẽ phình to vô hạn, khó mở và có thể làm đầy ổ đĩa.

- **`maxFileSize`**: giới hạn kích thước tối đa của **mỗi** file log; khi vượt quá, Logback tự tạo file mới (tăng số thứ tự `%i`) dù vẫn trong cùng một ngày.
- **`maxHistory`**: số ngày lịch sử log được **giữ lại**; file cũ hơn con số này sẽ tự động bị xóa.
- **`totalSizeCap`**: giới hạn **tổng dung lượng** của toàn bộ các file log lịch sử cộng lại; khi vượt quá, Logback xóa bớt file cũ nhất cho tới khi tổng dung lượng nằm dưới ngưỡng, kể cả khi chưa hết `maxHistory` ngày.

Ba cơ chế này phối hợp để vừa xoay file theo thời gian, vừa giới hạn dung lượng ổ đĩa tiêu tốn, phù hợp cho hệ thống chạy liên tục nhiều tháng/năm.

</details>

**6. `logger` và `root` trong file cấu hình Logback khác nhau thế nào? Cho ví dụ cấu hình để package `com.example.myapp` log ở `DEBUG` nhưng `org.springframework` chỉ log `WARN` trở lên.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`<root>`**: định nghĩa level và appender **mặc định** áp dụng cho toàn bộ ứng dụng, khi không có `<logger>` riêng nào khớp cụ thể hơn.
- **`<logger name="...">`**: ghi đè level cho một package/class **cụ thể**, có độ ưu tiên cao hơn `<root>` — Logback chọn logger có tên khớp gần nhất với class đang log.

```xml
<logger name="com.example.myapp" level="DEBUG"/>
<logger name="org.springframework" level="WARN"/>

<root level="INFO">
    <appender-ref ref="CONSOLE"/>
</root>
```

- Nhờ vậy, code của bạn (`com.example.myapp`) log chi tiết ở `DEBUG` để dễ gỡ lỗi, trong khi log "ồn ào" từ Spring framework bị hạn chế chỉ còn `WARN` trở lên, và mọi package khác không được khai báo riêng sẽ dùng mặc định `INFO` từ `root`.

</details>

**7. Đoạn cấu hình sau có bug gì? Vì sao log không xuất hiện dù chương trình chạy không lỗi?**

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
    </root>
</configuration>
```

<details className="qa">
<summary>Xem đáp án</summary>

**Bug**: `<root>` **thiếu `<appender-ref ref="CONSOLE"/>`** bên trong.

- Khai báo một `<appender>` chỉ **định nghĩa** appender đó tồn tại và cấu hình ra sao — nó chưa tự động được dùng ở đâu cả.
- Phải **gắn** appender vào một `<logger>` hoặc `<root>` cụ thể thông qua `<appender-ref ref="TÊN_APPENDER"/>` thì log mới thực sự được ghi qua appender đó.
- Trong ví dụ trên, dù `root` có level `INFO` hợp lệ, nhưng vì không tham chiếu tới appender nào, **không có nơi nào để ghi log ra** — chương trình vẫn chạy bình thường (không lỗi), chỉ đơn giản là không log gì cả.

Sửa lại:

```xml
<root level="INFO">
    <appender-ref ref="CONSOLE"/>
</root>
```

</details>

**8. Một hệ thống production cần thay đổi log level tạm thời để điều tra sự cố, nhưng không muốn restart ứng dụng (vì ảnh hưởng người dùng đang online). Logback hỗ trợ việc này như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Logback hỗ trợ **tự động quét lại (scan) file cấu hình** mà không cần khởi động lại ứng dụng, bằng cách thêm thuộc tính `scan` và `scanPeriod` vào thẻ gốc:

```xml
<configuration scan="true" scanPeriod="30 seconds">
    ...
</configuration>
```

- Với cấu hình này, Logback tự kiểm tra file `logback.xml`/`logback-spring.xml` mỗi 30 giây; nếu phát hiện thay đổi, nó **nạp lại cấu hình ngay lập tức** mà không cần restart JVM.
- Trong hệ sinh thái Spring Boot, một cách khác phổ biến hơn là dùng **Spring Boot Actuator** với endpoint `/actuator/loggers`, cho phép đổi log level của một package cụ thể qua HTTP request (`POST`) ngay khi ứng dụng đang chạy, không cần sửa file XML.
- Cả hai cách đều rất hữu ích để tạm thời hạ level xuống `DEBUG` khi điều tra sự cố, rồi trả lại `INFO` sau khi xong mà không gây gián đoạn dịch vụ.

</details>

**9. So sánh Logback và Log4j2 về mặt hiệu năng và kiến trúc. Vì sao nhiều hệ thống có traffic rất lớn lại chọn Log4j2 thay vì Logback mặc định của Spring Boot?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Log4j2** được thiết kế với kiến trúc hỗ trợ **ghi log bất đồng bộ (async logging)** hiệu quả hơn, dựa trên thư viện **LMAX Disruptor** — một cấu trúc hàng đợi (queue) không khóa (lock-free) hiệu năng rất cao, giúp giảm độ trễ (latency) khi ghi log ở mức thông lượng lớn.
- **Logback** cũng hỗ trợ ghi log bất đồng bộ qua `AsyncAppender`, nhưng theo nhiều benchmark công khai, Log4j2 ở chế độ async thường cho thông lượng (throughput) cao hơn và độ trễ ổn định hơn khi tải lớn.
- Với đa số ứng dụng thông thường, sự khác biệt hiệu năng giữa hai thư viện **không đáng kể** và không phải yếu tố quyết định — Logback vẫn là lựa chọn mặc định hợp lý nhờ tích hợp sẵn trong Spring Boot. Chỉ những hệ thống có khối lượng log cực lớn (ví dụ hàng chục nghìn dòng log/giây) mới cần cân nhắc chuyển sang Log4j2 để tối ưu thêm.

</details>

**10. Thuộc tính `additivity` của thẻ `<logger>` trong Logback dùng để làm gì? Cho ví dụ tình huống nếu không hiểu rõ thuộc tính này sẽ gây ra log bị in trùng lặp.**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, một `<logger>` **kế thừa** (propagate) sự kiện log của nó lên các appender của logger cha (bao gồm cả `root`), ngoài các appender được gắn trực tiếp cho chính nó — hành vi này gọi là **additivity**, mặc định là `true`.

```xml
<logger name="com.example.myapp" level="DEBUG" additivity="true">
    <appender-ref ref="FILE_RIENG"/>
</logger>

<root level="INFO">
    <appender-ref ref="CONSOLE"/>
</root>
```

- Với cấu hình trên, một log từ `com.example.myapp` sẽ được ghi **cả vào** `FILE_RIENG` (appender riêng) **lẫn** `CONSOLE` (appender của `root`, do additivity mặc định là `true` khiến sự kiện log "chảy" tiếp lên root) — nếu vô tình dùng chung một appender ở cả hai chỗ, log có thể bị **in trùng lặp hai lần**.
- Để tránh trùng lặp, đặt `additivity="false"` cho logger riêng, khi đó log của package này **chỉ** đi qua appender được gắn trực tiếp cho nó, không "chảy tiếp" lên `root` nữa:

```xml
<logger name="com.example.myapp" level="DEBUG" additivity="false">
    <appender-ref ref="FILE_RIENG"/>
</logger>
```

</details>

**11. Nếu file `logback-spring.xml` được đặt sai vị trí (ví dụ trong `src/main/java/` thay vì `src/main/resources/`), điều gì xảy ra khi chạy ứng dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Logback (và Spring Boot) chỉ tìm file cấu hình trong **classpath**, mà khi build, chỉ nội dung của `src/main/resources/` mới được copy vào classpath (thư mục `target/classes` hoặc tương đương) — code Java trong `src/main/java/` được biên dịch thành `.class`, không mang theo file XML đặt sai chỗ vào cùng vị trí mong đợi.
- Kết quả: Logback **không tìm thấy** file cấu hình tùy chỉnh, và **âm thầm dùng cấu hình mặc định** (ví dụ cấu hình console mặc định của Spring Boot) — không có exception nào được ném ra, khiến lỗi này rất dễ bị bỏ sót khi debug ("tại sao cấu hình của tôi không có tác dụng?").
- Cách khắc phục: đảm bảo file cấu hình luôn nằm trong `src/main/resources/` để được đóng gói đúng vào classpath.

</details>

---

## 4. Log4j2

Bài học: [4. Log4j2](../../java/12-logging/4_log4j2.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Log4j2 là gì? Nó khác Log4j 1.x ở những điểm cốt lõi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Log4j2** (Apache Log4j 2) là implementation ghi log của Apache, thế hệ thứ hai của Log4j, được viết lại hoàn toàn (không phải nâng cấp dần) từ Log4j 1.x.

Khác biệt cốt lõi:

- **Ghi log bất đồng bộ (async logging)**: Log4j 1.x ghi đồng bộ, luồng chính phải chờ I/O ghi xong; Log4j2 hỗ trợ **Async Loggers** dựa trên LMAX Disruptor, đẩy sự kiện log vào hàng đợi rồi trả quyền điều khiển ngay cho luồng chính.
- **Lazy evaluation qua lambda**: cho phép trì hoãn việc tạo chuỗi log tốn kém cho tới khi chắc chắn level đang được bật.
- **Tích hợp SLF4J tốt hơn** và kiến trúc plugin linh hoạt hơn cho appender/layout/filter.
- Log4j 1.x đã ngừng phát triển (end-of-life) từ 2015, không còn được vá lỗi bảo mật mới.

</details>

**2. Muốn dùng Log4j2 thay Logback trong dự án Spring Boot, cần làm những bước nào? Vì sao không được để cả hai cùng tồn tại?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai bước bắt buộc:

1. **Loại trừ (`exclude`)** `spring-boot-starter-logging` khỏi `spring-boot-starter` (hoặc bất kỳ starter nào khác đang kéo theo nó) — starter này chứa Logback mặc định.
2. **Thêm** `spring-boot-starter-log4j2` để thay thế.

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

- Cả hai đều đăng ký làm **SLF4J provider** (implementation). Nếu để cả hai cùng tồn tại trong classpath, `SLF4J` sẽ báo cảnh báo "multiple SLF4J providers" và tự chọn một cái để dùng theo thứ tự nạp classpath — hành vi khó đoán trước, có thể khiến cấu hình bạn viết cho Log4j2 hoàn toàn không có tác dụng vì Logback lại được chọn.

</details>

**3. So sánh cấu trúc file cấu hình `log4j2.xml` với `logback.xml` — điểm giống và khác nhau về cú pháp?**

<details className="qa">
<summary>Xem đáp án</summary>

Giống nhau về ý tưởng: đều có phần khai báo appender (nơi ghi log) và phần khai báo logger/level.

Khác nhau về cú pháp:

| | Logback (`logback.xml`) | Log4j2 (`log4j2.xml`) |
|---|---|---|
| Tên thẻ | chữ thường (`<appender>`, `<root>`) | viết hoa chữ đầu (`<Appenders>`, `<Root>`) |
| Appender ghi màn hình | `ConsoleAppender` | `<Console>` |
| Appender xoay file | `RollingFileAppender` | `<RollingFile>` |
| Định dạng pattern | `<pattern>...</pattern>` trong `<encoder>` | `<PatternLayout pattern="..."/>` |
| Gắn appender vào logger | `<appender-ref ref="..."/>` | `<AppenderRef ref="..."/>` |

- Cả hai đều dùng chung ký hiệu pattern tương tự (`%d`, `%level`, `%logger`, `%msg`, `%n`) vì cùng kế thừa ý tưởng định dạng dòng log từ Log4j gốc.

</details>

**4. Async Logger trong Log4j2 hoạt động dựa trên cơ chế gì? Tại sao nó giúp ứng dụng không bị chậm lại khi ghi rất nhiều log?**

<details className="qa">
<summary>Xem đáp án</summary>

Async Logger dựa trên thư viện **LMAX Disruptor** — một cấu trúc hàng đợi vòng (ring buffer) hiệu năng cực cao, hầu như không cần khóa (lock-free).

- Ở chế độ **đồng bộ (synchronous)**: luồng ứng dụng gọi `logger.info(...)` phải **chờ** cho tới khi dữ liệu được ghi xong ra đích (file/console) mới được chạy tiếp code nghiệp vụ.
- Ở chế độ **bất đồng bộ (asynchronous)**: luồng ứng dụng chỉ cần đẩy sự kiện log vào hàng đợi Disruptor rồi **trả quyền điều khiển ngay lập tức**; một luồng riêng biệt khác đảm nhận việc lấy sự kiện ra khỏi hàng đợi và ghi thật ra đích.
- Nhờ vậy, chi phí I/O (ghi file, gửi qua mạng...) không còn nằm trên đường xử lý chính (critical path) của request, giúp giảm độ trễ và tăng thông lượng đáng kể cho hệ thống ghi log dày đặc.

</details>

**5. Giải thích vì sao cách viết log sau tối ưu hơn cách nối chuỗi truyền thống, đặc biệt khi `buildExpensiveDetail(order)` tốn nhiều tài nguyên để chạy.**

```java
logger.debug(() -> "Chi tiết đơn hàng: " + buildExpensiveDetail(order));
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là kỹ thuật **lazy evaluation** (tính toán trễ) bằng cách truyền vào một **lambda / `Supplier`** thay vì một `String` đã tính sẵn.

- Nếu viết `logger.debug("Chi tiết đơn hàng: " + buildExpensiveDetail(order))` như thông thường, Java **luôn phải chạy** `buildExpensiveDetail(order)` trước khi gọi `debug(...)`, bất kể level `DEBUG` có đang bật hay không.
- Với cách dùng lambda, Log4j2 chỉ **gọi hàm bên trong lambda** (tức mới chạy `buildExpensiveDetail(order)`) khi nó đã xác nhận level `DEBUG` đang được bật. Nếu `DEBUG` bị tắt, lambda **không bao giờ được thực thi**, tránh lãng phí tài nguyên cho phần tính toán tốn kém mà kết quả sẽ bị bỏ đi ngay.
- Đây là ưu điểm hơn cả cách dùng placeholder `{}` thông thường của SLF4J trong trường hợp tham số cần một phép tính phức tạp, chứ không chỉ là một biến có sẵn.

</details>

**6. Nêu ít nhất ba tiêu chí để quyết định chọn Log4j2 thay vì giữ Logback mặc định của Spring Boot trong một dự án thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Yêu cầu thông lượng ghi log cực lớn**: hệ thống ghi hàng chục nghìn dòng log/giây trở lên (ví dụ hệ thống giao dịch tài chính tốc độ cao, hệ thống game server thời gian thực) — Async Logger của Log4j2 với Disruptor thường cho độ trễ ổn định và thông lượng cao hơn.
- **Độ nhạy cảm với độ trễ (latency)**: ứng dụng mà mỗi mili-giây đều quan trọng, không chấp nhận được việc luồng chính bị chặn bởi I/O ghi log.
- **Đã có kinh nghiệm/hạ tầng sẵn với Log4j2**: đội ngũ vận hành đã quen thuộc với cấu hình, công cụ giám sát cho Log4j2 từ trước.
- Ngược lại, nếu ứng dụng không có yêu cầu hiệu năng đặc biệt, nên **giữ Logback mặc định** để tận dụng tích hợp sẵn có của Spring Boot, giảm rủi ro cấu hình sai khi phải tự thay thế thủ công.

</details>

**7. Log4Shell (CVE-2021-44228) là gì? Lỗ hổng này khai thác cơ chế nào của Log4j2, và vì sao mức độ nguy hiểm được đánh giá cực kỳ nghiêm trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Log4Shell** là lỗ hổng bảo mật nghiêm trọng (CVE-2021-44228, điểm CVSS gần tối đa 10.0) được công bố cuối năm 2021, ảnh hưởng các phiên bản Log4j2 từ 2.0-beta9 đến 2.14.1.

- Cơ chế: Log4j2 có tính năng **JNDI Lookup** — cho phép cú pháp đặc biệt trong message log (ví dụ `${jndi:ldap://...}`) tự động **tra cứu và tải tài nguyên từ xa** qua JNDI (Java Naming and Directory Interface).
- Nếu một chuỗi do người dùng nhập (ví dụ tên đăng nhập, User-Agent header, tên file upload) bị ghi thẳng vào log mà chứa cú pháp JNDI Lookup độc hại, Log4j2 sẽ **tự động kết nối tới máy chủ của kẻ tấn công** và **tải, thực thi mã Java độc hại** — dẫn tới remote code execution (thực thi mã từ xa) ngay trên máy chủ nạn nhân.
- Mức độ nguy hiểm cực cao vì: (1) khai thác rất đơn giản, chỉ cần gửi một chuỗi trong bất kỳ input nào bị log lại; (2) Log4j2 được dùng trong hàng triệu ứng dụng Java trên thế giới, kể cả gián tiếp qua các thư viện phụ thuộc; (3) hậu quả là chiếm quyền điều khiển hoàn toàn máy chủ.

</details>

**8. Ngoài việc nâng cấp lên phiên bản đã vá, còn cách nào khác để giảm thiểu rủi ro Log4Shell nếu vì lý do nào đó chưa thể nâng cấp ngay?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Nâng cấp lên phiên bản đã vá** vẫn là giải pháp triệt để nhất — từ **2.17.1 trở lên** đã khắc phục đầy đủ cả Log4Shell (CVE-2021-44228) lẫn các lỗ hổng liên quan phát hiện sau đó (ví dụ CVE-2021-45105 về DoS, CVE-2021-44832).
- Nếu chưa thể nâng cấp ngay (ví dụ hệ thống legacy khó thay đổi), các biện pháp giảm thiểu tạm thời từng được khuyến nghị:
  - Đặt system property `log4j2.formatMsgNoLookups=true` để tắt tính năng lookup trong message (hiệu quả với một số phiên bản trung gian).
  - **Xóa thủ công class `JndiLookup.class`** khỏi file `log4j-core-*.jar` để vô hiệu hóa hoàn toàn tính năng JNDI Lookup.
  - Chặn kết nối mạng ra ngoài (outbound) từ máy chủ ứng dụng tới các giao thức LDAP/RMI không cần thiết, hạn chế khả năng khai thác dù lỗ hổng còn tồn tại.
- Các biện pháp giảm thiểu chỉ nên là **giải pháp tạm thời**, nâng cấp phiên bản vẫn là ưu tiên hàng đầu.

</details>

**9. Thuộc tính `additivity="false"` trong `<Logger>` của Log4j2 có tác dụng gì? Vì sao thiếu nó có thể gây log bị in trùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, một `<Logger>` không chỉ ghi log qua các `<AppenderRef>` của chính nó, mà còn **truyền tiếp (propagate)** sự kiện log lên `<Root>` (và các logger cha khác nếu có) — hành vi này gọi là **additivity**, mặc định `true`.

```xml
<Logger name="com.example.myapp" level="debug">
    <AppenderRef ref="Console"/>
</Logger>

<Root level="info">
    <AppenderRef ref="Console"/>
</Root>
```

- Với cấu hình trên (thiếu `additivity="false"`), một log từ `com.example.myapp` sẽ được ghi ra `Console` **hai lần**: một lần qua `AppenderRef` của chính `Logger`, một lần nữa vì sự kiện tiếp tục "chảy" lên `Root` và được ghi qua `AppenderRef` của `Root`.
- Đặt `additivity="false"` để log chỉ đi qua đúng appender được khai báo cho logger đó, không lan tiếp lên logger cha, tránh bị in trùng.

</details>

**10. Với đoạn cấu hình sau, một log `logger.debug(...)` phát ra từ class `com.example.myapp.OrderService` có được ghi ra không? Còn từ class `com.example.other.Utils` thì sao?**

```xml
<Loggers>
    <Logger name="com.example.myapp" level="debug" additivity="false">
        <AppenderRef ref="Console"/>
    </Logger>
    <Root level="info">
        <AppenderRef ref="Console"/>
    </Root>
</Loggers>
```

<details className="qa">
<summary>Xem đáp án</summary>

- **`com.example.myapp.OrderService`**: log `DEBUG` sẽ **được ghi ra**. Log4j2 chọn logger có tên khớp **gần nhất** (theo package) với class đang log; `com.example.myapp.OrderService` khớp với `<Logger name="com.example.myapp">` (khớp theo tiền tố package), nên áp dụng level `debug` của logger này, thấp hơn ngưỡng nên vẫn được ghi.
- **`com.example.other.Utils`**: log `DEBUG` sẽ **KHÔNG được ghi**. Class này không khớp với logger `com.example.myapp` nào, nên rơi về `<Root level="info">` — mà `DEBUG` thấp hơn ngưỡng `INFO` của root, nên bị lọc bỏ.
- Đây là ví dụ điển hình cho việc log level được áp dụng theo package cụ thể, ưu tiên logger khớp gần nhất trước khi rơi về `Root`.

</details>

**11. Vì sao nói Log4Shell không chỉ là lỗi của riêng Log4j2, mà còn là bài học chung về rủi ro bảo mật khi dùng thư viện bên thứ ba trong dự án Java?**

<details className="qa">
<summary>Xem đáp án</summary>

- Rất nhiều dự án **không trực tiếp** khai báo Log4j2, mà nó bị kéo vào **gián tiếp** qua một thư viện phụ thuộc khác (transitive dependency) — nhiều đội phát triển thậm chí không biết mình đang dùng Log4j2 cho tới khi lỗ hổng được công bố.
- Bài học rút ra:
  - Cần công cụ quét dependency (SCA — software composition analysis, ví dụ OWASP Dependency-Check) để phát hiện thư viện có lỗ hổng đã biết, kể cả dependency gián tiếp.
  - Nguyên tắc **"không tin dữ liệu đầu vào"** áp dụng cả cho những nơi tưởng chừng vô hại như logging — dữ liệu người dùng nhập vào không nên được xử lý bằng các tính năng "thông minh" tự động (như JNDI Lookup) mà không kiểm soát chặt.
  - Luôn có quy trình **cập nhật bản vá bảo mật nhanh** cho mọi dependency, không chỉ dependency chính của dự án mà cả các thư viện logging, utility tưởng chừng không quan trọng.

</details>

---

## 5. TinyLog

Bài học: [5. TinyLog](../../java/12-logging/5_tinylog.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. TinyLog khác gì so với cách dùng SLF4J trong việc tạo logger cho mỗi lớp?**

<details className="qa">
<summary>Xem đáp án</summary>

- Với **SLF4J**, mỗi lớp phải tự khai báo một logger riêng: `private static final Logger log = LoggerFactory.getLogger(TenLop.class);`, rồi mới gọi `log.info(...)`.
- Với **TinyLog**, bạn gọi thẳng phương thức **static** trên lớp `Logger`: `Logger.info(...)`, không cần khai báo hay tạo instance gì trong từng lớp. TinyLog tự nhận diện lớp/phương thức/dòng code phát ra log dựa trên stack trace tại thời điểm gọi.
- Đánh đổi: cách gọi thẳng của TinyLog tiện lợi hơn nhưng phải trả giá bằng việc phân tích stack trace mỗi lần log, có thể chậm hơn một chút so với việc đã biết sẵn context qua đối tượng logger tạo trước.

</details>

**2. TinyLog gồm những thành phần dependency nào? Nếu chỉ thêm `tinylog-api` mà quên `tinylog-impl` thì xảy ra chuyện gì?**

<details className="qa">
<summary>Xem đáp án</summary>

TinyLog gồm hai phần tách biệt, giống mô hình facade/implementation:

- **`tinylog-api`**: cung cấp lớp `Logger` để gọi log trong code.
- **`tinylog-impl`**: implementation thực sự xử lý và ghi log ra đích (console/file).

Nếu chỉ thêm `tinylog-api` mà quên `tinylog-impl`, chương trình vẫn biên dịch và chạy được (không lỗi), nhưng **log sẽ không xuất hiện ở đâu cả** vì thiếu phần thực thi việc ghi — tương tự tình huống dùng `SLF4J` mà quên thêm implementation như Logback.

</details>

**3. Trong TinyLog, vị trí tham số exception khi ghi log lỗi khác gì so với SLF4J? Cho ví dụ minh họa.**

<details className="qa">
<summary>Xem đáp án</summary>

- Ở **SLF4J**, exception được truyền làm tham số **cuối cùng**:

```java
logger.error("Thanh toán thất bại cho đơn {}", maDon, e);
```

- Ở **TinyLog**, exception được truyền làm tham số **đầu tiên**:

```java
Logger.error(e, "Thanh toán thất bại cho đơn {}", maDon);
```

- Đây là điểm khác biệt dễ gây nhầm lẫn nhất khi chuyển đổi qua lại giữa hai thư viện, cần đặc biệt lưu ý khi review code hoặc migrate giữa các dự án dùng logging khác nhau.

</details>

**4. `writer` trong file `tinylog.properties` tương đương với khái niệm nào trong Logback? Viết một cấu hình có cả writer ghi ra console lẫn writer ghi ra file cùng lúc.**

<details className="qa">
<summary>Xem đáp án</summary>

`writer` trong TinyLog tương đương với **appender** trong Logback — cả hai đều quyết định log được ghi ra đích nào (console, file...).

Cấu hình nhiều writer cùng lúc bằng cách đánh số:

```properties
level = info

writer1        = console
writer1.format = {level}: {message}

writer2        = file
writer2.file   = logs/app.log
writer2.format = {date: yyyy-MM-dd HH:mm:ss} {level}: {class} - {message}
```

- Với cấu hình này, mỗi dòng log sẽ được ghi đồng thời ra cả console lẫn file `logs/app.log`, mỗi writer có định dạng (`format`) riêng độc lập với nhau.

</details>

**5. So sánh dung lượng, độ phức tạp cấu hình, và mức độ phù hợp của TinyLog so với Logback/Log4j2. Khi nào nên chọn TinyLog, khi nào tuyệt đối không nên?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | TinyLog | Logback / Log4j2 |
|---|---|---|
| Dung lượng thư viện | Vài trăm KB, rất nhỏ | Lớn hơn đáng kể |
| Cấu hình | File `.properties` vài dòng | File XML dài, nhiều thành phần |
| Hệ sinh thái/tính linh hoạt | Vừa đủ cho nhu cầu cơ bản | Rất phong phú (nhiều appender, filter, layout, tích hợp) |

- **Nên chọn TinyLog** khi: viết công cụ CLI, script nhỏ, bài demo/học tập, ứng dụng Android hoặc môi trường nhúng cần giữ dung lượng tối thiểu.
- **Không nên dùng TinyLog** khi: dự án Spring Boot lớn (đã có sẵn Logback tích hợp tốt hơn), hoặc hệ thống cần cấu hình logging phức tạp — nhiều đích ghi log khác nhau, nhiều quy tắc lọc, tích hợp với hệ thống giám sát tập trung — nơi hệ sinh thái đầy đủ của Logback/Log4j2 phù hợp hơn nhiều.

</details>

**6. Đoạn cấu hình sau có vấn đề gì khiến lập trình viên tưởng rằng "logging không hoạt động", dù thực chất code hoàn toàn đúng?**

```properties
level = error

writer        = console
writer.format = {level}: {message}
```

```java
Logger.info("Đơn hàng {} đã tạo", maDon);
Logger.debug("Chi tiết xử lý: {}", chiTiet);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không có bug trong code** — nguyên nhân là **`level = error`** đặt ngưỡng quá cao.

- Với ngưỡng `error`, chỉ log ở mức `ERROR` mới được ghi ra; cả `Logger.info(...)` lẫn `Logger.debug(...)` đều **thấp hơn** ngưỡng này nên bị bỏ qua hoàn toàn, không xuất hiện ở console.
- Đây là lỗi cấu hình rất dễ mắc phải: người mới thường để `level` mặc định hoặc copy nhầm từ một cấu hình khác, rồi tưởng rằng logging "không chạy" trong khi thực chất code log vẫn đúng, chỉ là bị lọc bởi ngưỡng level quá cao.
- Cách sửa: hạ `level` xuống `info` hoặc `debug` tùy nhu cầu quan sát.

</details>

**7. Bạn cần viết một công cụ CLI nhỏ chuyển đổi định dạng file, chạy độc lập (không phải Spring Boot), muốn có log ra cả console và file mà không muốn viết cấu hình XML phức tạp. Bạn sẽ chọn thư viện logging nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**TinyLog** là lựa chọn phù hợp nhất cho tình huống này.

- Không cần khai báo logger riêng cho từng lớp — chỉ cần `import org.tinylog.Logger;` rồi gọi thẳng `Logger.info(...)` ở bất cứ đâu.
- Cấu hình chỉ cần một file `tinylog.properties` vài dòng để khai báo hai writer (console + file), thay vì phải viết `logback.xml`/`log4j2.xml` với appender, encoder, pattern layout dài dòng.
- Dung lượng thư viện nhỏ giúp công cụ CLI khởi động nhanh, phù hợp với những công cụ chạy ngắn hạn không cần một hệ sinh thái logging đầy đủ như Logback/Log4j2 vốn hướng tới ứng dụng server chạy dài hạn, phức tạp hơn.

</details>

**8. Nếu một dự án Spring Boot đã dùng sẵn Logback, có nên thêm TinyLog vào để dùng cho một module riêng biệt trong cùng dự án không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không nên.** Dù về mặt kỹ thuật TinyLog và Logback có thể cùng tồn tại trong classpath (chúng không cạnh tranh vai trò SLF4J provider như Logback với Log4j2, vì TinyLog dùng API riêng `org.tinylog.Logger` chứ không qua SLF4J), việc trộn hai hệ thống logging trong cùng một dự án gây ra:

- **Log không đồng nhất định dạng**: log từ Logback và log từ TinyLog có thể xuất hiện với format khác nhau, khó đọc và khó tổng hợp khi tra cứu sự cố.
- **Khó quản lý cấu hình tập trung**: phải duy trì cả `logback-spring.xml` lẫn `tinylog.properties`, tăng chi phí bảo trì và dễ gây nhầm lẫn cho thành viên mới trong đội.
- **Không tận dụng được các tính năng tích hợp** như đổi level runtime qua Spring Boot Actuator, vốn chỉ hoạt động với hệ thống logging chính thức của Spring Boot.
- Nguyên tắc chung: một dự án nên **thống nhất một implementation logging duy nhất** trong toàn bộ codebase để dễ vận hành và giám sát.

</details>
