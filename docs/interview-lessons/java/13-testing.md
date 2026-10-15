---
sidebar_position: 13
title: "13. Testing"
---

# 13. Testing

## 1. Unit Testing (Kiểm thử đơn vị)

Bài học: [1. Unit Testing (Kiểm thử đơn vị)](../../java/13-testing/1_unit-testing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Unit test là gì? Nêu ba đặc điểm chính phân biệt nó với các loại test khác (ví dụ integration test).**

<details className="qa">
<summary>Xem đáp án</summary>

**Unit test** (kiểm thử đơn vị) là loại test kiểm tra từng phần **nhỏ nhất** của chương trình một cách **độc lập** — trong Java thường là một method hoặc một class.

Ba đặc điểm chính:

- **Nhỏ**: chỉ test một hàm hoặc một hành vi cụ thể, không kiểm tra cả một luồng nghiệp vụ lớn.
- **Nhanh**: chạy trong vài mili-giây vì không gọi database, mạng, file hệ thống — mọi phụ thuộc bên ngoài thường được thay thế bằng mock/stub.
- **Độc lập**: không phụ thuộc vào test khác hay thứ tự chạy, mỗi test có thể chạy riêng lẻ và cho kết quả giống nhau mỗi lần.

Khác với integration test (kiểm thử tích hợp) — vốn kiểm tra sự phối hợp giữa nhiều thành phần thật (database, API, service khác), unit test cô lập hoàn toàn đơn vị đang test khỏi các phụ thuộc bên ngoài.

</details>

**2. Mô hình AAA trong việc viết test là gì? Vì sao việc tách rõ ba bước này lại giúp test dễ đọc hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

**AAA** gồm ba bước:

- **Arrange** (chuẩn bị): tạo đối tượng, chuẩn bị dữ liệu đầu vào.
- **Act** (hành động): gọi phương thức/hành vi cần test.
- **Assert** (khẳng định): so sánh kết quả thực tế với kết quả mong đợi.

```java
// Arrange
Calculator calc = new Calculator();
int a = 10, b = 5;

// Act
int ketQua = calc.add(a, b);

// Assert
assertEquals(15, ketQua);
```

- Tách rõ ba bước giúp bất kỳ ai đọc test cũng nhanh chóng nhận ra: dữ liệu đầu vào là gì, hành động nào đang được kiểm tra, và kỳ vọng kết quả ra sao — mà không cần đọc kỹ toàn bộ logic. Đây cũng là cấu trúc chuẩn được hầu hết framework test (JUnit, TestNG) và tài liệu ngành khuyến nghị.

</details>

**3. Nguyên tắc FIRST trong thiết kế unit test tốt bao gồm những gì? Giải thích ý nghĩa từng chữ cái.**

<details className="qa">
<summary>Xem đáp án</summary>

| Chữ | Ý nghĩa | Giải thích |
|---|---|---|
| **F**ast | Nhanh | Test phải chạy rất nhanh để có thể chạy thường xuyên (mỗi lần lưu code, mỗi lần build) |
| **I**ndependent | Độc lập | Không phụ thuộc test khác, chạy theo bất kỳ thứ tự nào cũng ra kết quả đúng |
| **R**epeatable | Lặp lại được | Chạy bao nhiêu lần, trên máy nào, kết quả cũng phải giống nhau |
| **S**elf-validating | Tự kiểm tra | Test tự báo pass/fail rõ ràng (qua assertion), không cần con người tự nhìn output để phán đoán |
| **T**imely | Đúng lúc | Viết test gần thời điểm viết code, không để dồn lại viết sau cùng |

Ngoài FIRST, một nguyên tắc quan trọng khác là mỗi test chỉ nên kiểm tra **một hành vi duy nhất**, giúp dễ xác định nguyên nhân khi test fail.

</details>

**4. Đoạn test sau có vấn đề gì? Vì sao nó luôn pass dù code có lỗi?**

```java
@Test
void testTinhTong() {
    Calculator calc = new Calculator();
    calc.add(2, 3);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Vấn đề**: test **thiếu bước Assert** — chỉ gọi `calc.add(2, 3)` (bước Act) rồi kết thúc, không hề kiểm tra kết quả trả về có đúng bằng `5` hay không.

- Vì không có assertion nào, test này sẽ **luôn pass** miễn là `add(...)` không ném exception — dù giá trị trả về có sai (ví dụ hàm bị lỗi trả về `0` hoặc `-1`), test vẫn báo xanh, tạo cảm giác an toàn giả (false sense of security).
- Sửa lại: thêm assertion để thực sự kiểm tra kết quả.

```java
@Test
void testTinhTong() {
    Calculator calc = new Calculator();
    int ketQua = calc.add(2, 3);
    assertEquals(5, ketQua);
}
```

</details>

**5. Test sau vi phạm nguyên tắc nào của một test tốt? Vì sao nó gây khó khăn khi cần xác định lỗi?**

```java
@Test
void testTatCaPhepTinh() {
    Calculator calc = new Calculator();
    assertEquals(5, calc.add(2, 3));
    assertEquals(6, calc.subtract(10, 4));
    assertEquals(20, calc.multiply(4, 5));
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Test này vi phạm nguyên tắc **"mỗi test chỉ nên kiểm tra một hành vi duy nhất"** — nó gộp cả ba phép tính (`add`, `subtract`, `multiply`) vào một test.

- Nếu `subtract` bị lỗi (giả sử `assertEquals(6, calc.subtract(10, 4))` fail), JUnit sẽ dừng ngay tại assertion đó và báo test `testTatCaPhepTinh` fail — nhưng **không rõ ràng** liệu `multiply` phía sau có đúng hay không, vì nó chưa kịp chạy tới.
- Việc gộp nhiều hành vi vào một test khiến tên test (`testTatCaPhepTinh`) không mô tả chính xác lỗi gì đang xảy ra, và khi báo cáo test fail, người đọc phải mở code test ra xem chi tiết mới biết assertion nào fail.
- Cách sửa: tách thành ba test riêng biệt (`testAdd`, `testSubtract`, `testMultiply`), mỗi test chỉ kiểm tra một phép tính.

</details>

**6. TDD (Test-Driven Development) là gì? Trình bày vòng lặp Red - Green - Refactor.**

<details className="qa">
<summary>Xem đáp án</summary>

**TDD** là cách phát triển phần mềm theo hướng viết **test trước, code sau** — đảo ngược thứ tự thông thường.

Vòng lặp gồm ba bước:

1. **Red (đỏ)**: viết một test cho tính năng chưa tồn tại, chạy test → **fail** (vì code chưa được viết, thậm chí có thể chưa biên dịch được).
2. **Green (xanh)**: viết code **tối thiểu** đủ để test pass, không cần tối ưu hay đẹp đẽ ngay.
3. **Refactor (cải tiến)**: dọn dẹp, cải thiện chất lượng code trong khi vẫn đảm bảo tất cả test vẫn pass (xanh).

Sau đó lặp lại chu trình cho tính năng tiếp theo. Lợi ích: code luôn có test bao phủ ngay từ đầu, và người viết bị "ép" phải suy nghĩ rõ ràng về hành vi mong đợi trước khi bắt tay viết logic.

</details>

**7. Vì sao đoạn test sau được xem là "flaky test" (test chập chờn)? Cách khắc phục?**

```java
@Test
void testTaoThongBao() {
    Notification n = new Notification();
    String ketQua = n.taoThongDiep();
    assertEquals("Thông báo lúc " + LocalDateTime.now(), ketQua);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Vấn đề**: test phụ thuộc vào `LocalDateTime.now()` — giá trị này **thay đổi liên tục theo từng mili-giây**, nên gần như chắc chắn thời điểm gọi `LocalDateTime.now()` trong assertion sẽ **khác** với thời điểm được dùng bên trong `taoThongDiep()`, dù chỉ lệch vài mili-giây.

- Đây là ví dụ điển hình của **flaky test**: test có thể pass hoặc fail một cách ngẫu nhiên/không nhất quán dù code không hề thay đổi, phá vỡ nguyên tắc **Repeatable** trong FIRST.
- Cách khắc phục phổ biến:
  - **Tiêm (inject) một `Clock` hoặc nguồn thời gian giả (fake)** vào class cần test, thay vì gọi trực tiếp `LocalDateTime.now()` — khi test, truyền vào một `Clock` cố định để kiểm soát được giá trị thời gian.
  - Hoặc chỉ assert **một phần** không phụ thuộc thời gian chính xác tuyệt đối, ví dụ kiểm tra định dạng chuỗi hoặc dùng khoảng dung sai (tolerance) khi so sánh thời gian.

</details>

**8. Trong thực tế, việc viết unit test mang lại lợi ích gì ngoài việc "bắt lỗi"? Giải thích khái niệm "tài liệu sống" (living documentation) trong ngữ cảnh test.**

<details className="qa">
<summary>Xem đáp án</summary>

Ngoài phát hiện lỗi, unit test còn mang lại:

- **Tự tin khi refactor/sửa code**: khi thay đổi logic, bộ test chạy lại ngay lập tức báo cho biết có làm hỏng hành vi cũ (regression) hay không, giúp lập trình viên mạnh dạn cải tiến code mà không sợ "đụng vào đâu hỏng đó".
- **Tài liệu sống (living documentation)**: tên test và nội dung assertion mô tả rõ ràng **hành vi mong đợi** của một method trong các tình huống khác nhau. Một lập trình viên mới đọc bộ test của một class có thể hiểu được class đó nên hoạt động ra sao mà không cần đọc hết code triển khai — và khác với comment/document thông thường, test "sống" theo nghĩa nó **tự động được xác minh lại** mỗi lần chạy, nên không bao giờ bị lỗi thời (out-of-date) so với hành vi thực tế của code.

</details>

**9. Vì sao unit test nên tránh phụ thuộc vào database thật, gọi API mạng thật, hay đọc/ghi file hệ thống thật?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Vi phạm tính chất Fast**: gọi database/mạng/file thật luôn chậm hơn nhiều lần so với xử lý thuần túy trong bộ nhớ, khiến bộ test chạy chậm, giảm động lực chạy test thường xuyên.
- **Vi phạm tính chất Independent/Repeatable**: dữ liệu trong database thật có thể thay đổi giữa các lần chạy (ai đó xóa/sửa dữ liệu), kết nối mạng có thể gián đoạn, file hệ thống có thể bị khóa bởi tiến trình khác — khiến test lúc pass lúc fail dù code không đổi.
- **Khó tái tạo môi trường**: mỗi máy chạy test (máy dev, CI server) cần có cùng database/API/file để test chạy đúng, gây phức tạp khi thiết lập môi trường CI/CD.
- Giải pháp: dùng **mock/stub/fake** để giả lập các phụ thuộc bên ngoài trong unit test (sẽ học kỹ ở bài Mockito), giữ database/API/file thật cho **integration test** — loại test dành riêng để kiểm tra sự phối hợp thật giữa các thành phần.

</details>

---

## 2. JUnit

Bài học: [2. JUnit](../../java/13-testing/2_junit.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JUnit 5 (Jupiter) khác gì so với JUnit 4 ở mức cơ bản? Vì sao không nên trộn lẫn import của hai phiên bản trong cùng một class?**

<details className="qa">
<summary>Xem đáp án</summary>

- **JUnit 5** (còn gọi **JUnit Jupiter**) là bản viết lại kiến trúc so với JUnit 4, tách thành ba module: **JUnit Platform** (nền tảng chạy test), **Jupiter** (API và engine test mới), và **Vintage** (engine cho phép chạy lại test viết bằng JUnit 3/4 cũ).
- Package import cũng đổi: JUnit 5 dùng `org.junit.jupiter.api.*` (ví dụ `org.junit.jupiter.api.Test`), còn JUnit 4 dùng `org.junit.*` (ví dụ `org.junit.Test`).
- Nếu vô tình trộn lẫn (ví dụ import `@Test` từ `org.junit.jupiter.api` nhưng lại import `assertEquals` từ `org.junit.Assert` của JUnit 4), code có thể biên dịch nhưng annotation sẽ không được engine tương ứng nhận diện đúng cách, hoặc test không chạy như mong đợi, thậm chí bị bỏ qua âm thầm mà không báo lỗi rõ ràng.

</details>

**2. Annotation `@Test` có tác dụng gì? Điều gì xảy ra nếu bạn viết một phương thức test đầy đủ logic nhưng quên thêm `@Test`?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Test` đánh dấu một phương thức là một **test case** để JUnit tự động phát hiện và chạy khi thực thi test suite.

- Nếu quên `@Test`, phương thức đó vẫn biên dịch bình thường (nó chỉ là một method Java thông thường), nhưng **JUnit sẽ hoàn toàn bỏ qua nó** — không chạy, không báo pass, không báo fail.
- Đây là lỗi nguy hiểm vì âm thầm: khi xem báo cáo test, bạn sẽ thấy tổng số test ít hơn dự kiến (thiếu mất test đó), nhưng dễ nhầm tưởng "mọi test đều pass" nếu không để ý kỹ số lượng test đã chạy — tạo cảm giác an toàn giả trong khi thực chất một hành vi quan trọng chưa hề được kiểm tra.

</details>

**3. `assertEquals(mongDoi, thucTe)` — thứ tự hai tham số này quan trọng như thế nào? Cho ví dụ về thông báo lỗi khi viết ngược.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy ước của JUnit: `assertEquals(expected, actual)` — tham số **đầu tiên** là giá trị **mong đợi (expected)**, tham số **thứ hai** là giá trị **thực tế (actual)** mà code trả về.

- Việc này không ảnh hưởng đến kết quả pass/fail (vì so sánh bằng nhau có tính đối xứng), nhưng ảnh hưởng trực tiếp tới **nội dung thông báo lỗi** khi test fail.
- Ví dụ nếu viết đúng và test fail:

```text
expected: <5> but was: <6>
```

- Nếu viết ngược `assertEquals(ketQua, 5)` (tức truyền giá trị thực tế làm "expected"), khi fail thông báo sẽ hiển thị ngược, gây hiểu nhầm khi debug:

```text
expected: <6> but was: <5>
```

- Dù cùng một lỗi, thông báo ngược khiến người đọc mất thời gian hiểu sai vấn đề — vì vậy luôn giữ đúng thứ tự "mong đợi trước, thực tế sau".

</details>

**4. Phân biệt `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll`. Vì sao `@BeforeAll`/`@AfterAll` bắt buộc phải là phương thức `static` (theo lifecycle mặc định)?**

<details className="qa">
<summary>Xem đáp án</summary>

| Annotation | Chạy khi nào |
|---|---|
| `@BeforeEach` | Trước **mỗi** phương thức `@Test` |
| `@AfterEach` | Sau **mỗi** phương thức `@Test` |
| `@BeforeAll` | **Một lần duy nhất** trước tất cả test trong class |
| `@AfterAll` | **Một lần duy nhất** sau tất cả test trong class |

- Theo lifecycle **mặc định** của JUnit 5 (`PER_METHOD`), JUnit tạo một **instance mới** của lớp test cho **mỗi** phương thức `@Test` (để đảm bảo test độc lập, không chia sẻ trạng thái ngoài ý muốn). Vì vậy `@BeforeAll`/`@AfterAll` — chỉ chạy một lần cho cả class — không thể là phương thức instance (vì không gắn với một instance cụ thể nào cố định); chúng buộc phải là `static` để tồn tại độc lập với các instance được tạo/hủy liên tục.
- Ngoại lệ: nếu đổi lifecycle sang `@TestInstance(Lifecycle.PER_CLASS)` (chỉ tạo một instance dùng chung cho cả class), `@BeforeAll`/`@AfterAll` **không cần** `static` nữa.

</details>

**5. Vì sao mỗi phương thức `@Test` trong JUnit 5 (mặc định) chạy trên một instance riêng của class test, thay vì dùng chung một instance cho cả class?**

<details className="qa">
<summary>Xem đáp án</summary>

- Lifecycle mặc định của JUnit 5 là `PER_METHOD`: mỗi khi chạy một phương thức `@Test`, JUnit tạo **một instance hoàn toàn mới** của class test.
- Mục đích: đảm bảo các test **độc lập (Independent)** với nhau — field instance được set trong test này (hoặc trong `@BeforeEach`) không thể vô tình "rò rỉ" sang test khác, vì mỗi test có bộ field riêng, khởi tạo lại từ đầu.
- Nếu dùng chung một instance cho cả class (như `PER_CLASS`), lập trình viên phải tự cẩn thận reset trạng thái trong `@BeforeEach`, nếu không dữ liệu để lại từ test trước có thể ảnh hưởng ngầm tới test sau — vi phạm nguyên tắc Independent và Repeatable trong FIRST.

</details>

**6. `assertThrows` dùng để làm gì? Viết một test kiểm tra rằng `calc.divide(10, 0)` ném ra `ArithmeticException`, và giải thích vì sao cách viết bằng lambda lại cần thiết (thay vì gọi trực tiếp `calc.divide(10, 0)` trong `assertThrows`).**

<details className="qa">
<summary>Xem đáp án</summary>

`assertThrows` dùng để kiểm tra rằng một đoạn code **thực sự ném ra đúng loại exception mong đợi** — kiểm tra "đường đi lỗi" (error path), không chỉ đường đi thành công.

```java
assertThrows(ArithmeticException.class, () -> {
    calc.divide(10, 0);
});
```

- Phải bọc lời gọi `calc.divide(10, 0)` trong một **lambda** (`() -> ...`, kiểu `Executable`) vì nếu gọi trực tiếp `calc.divide(10, 0)` như một tham số bình thường, exception sẽ được ném ra **ngay khi Java đánh giá tham số** đó — tức là trước khi lời gọi `assertThrows(...)` thực sự bắt đầu chạy logic kiểm tra của nó, khiến test bị crash bởi exception không được xử lý thay vì được `assertThrows` bắt và xác nhận đúng loại.
- Lambda trì hoãn việc thực thi `calc.divide(10, 0)` cho tới khi `assertThrows` chủ động gọi nó bên trong một khối `try-catch` nội bộ, từ đó bắt được exception và so sánh với class mong đợi.

</details>

**7. `@ParameterizedTest` giải quyết vấn đề gì so với việc viết nhiều `@Test` riêng lẻ? Với đoạn `@CsvSource` sau, test sẽ chạy bao nhiêu lần và với bộ giá trị nào?**

```java
@ParameterizedTest
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "10, 20, 30",
    "-1, 1, 0"
})
void testAddNhieuTruongHop(int a, int b, int mongDoi) {
    assertEquals(mongDoi, calc.add(a, b));
}
```

<details className="qa">
<summary>Xem đáp án</summary>

`@ParameterizedTest` cho phép chạy **cùng một logic test** với **nhiều bộ dữ liệu đầu vào** khác nhau, tránh phải copy-paste nhiều phương thức test gần giống hệt nhau (chỉ khác số liệu).

- Với `@CsvSource` gồm 4 dòng, test `testAddNhieuTruongHop` sẽ chạy **4 lần độc lập**, mỗi lần với một bộ `(a, b, mongDoi)` tương ứng:
  1. `a=1, b=1, mongDoi=2`
  2. `a=2, b=3, mongDoi=5`
  3. `a=10, b=20, mongDoi=30`
  4. `a=-1, b=1, mongDoi=0`
- Nếu một trong bốn lần fail (ví dụ dòng thứ 3), JUnit vẫn báo cáo riêng biệt lần chạy đó là fail, các lần khác vẫn hiển thị pass — giúp xác định chính xác bộ dữ liệu nào gây lỗi.

</details>

**8. Ngoài `@CsvSource`, JUnit 5 còn hỗ trợ những nguồn dữ liệu nào khác cho `@ParameterizedTest`? Khi nào nên dùng `@MethodSource` thay vì `@CsvSource`?**

<details className="qa">
<summary>Xem đáp án</summary>

Các nguồn dữ liệu phổ biến khác:

- **`@ValueSource`**: cung cấp một danh sách giá trị đơn giản cùng kiểu (ví dụ danh sách `int`, `String`), dùng khi test chỉ cần **một** tham số đầu vào.
- **`@MethodSource`**: lấy dữ liệu test từ một phương thức trả về `Stream`/`List` các đối tượng phức tạp hơn (ví dụ đối tượng tùy chỉnh, hoặc bộ dữ liệu cần logic tính toán để tạo ra).
- **`@EnumSource`**: cung cấp dữ liệu test từ các giá trị của một `enum`.

Nên dùng `@MethodSource` khi:

- Dữ liệu test **quá phức tạp** để viết gọn trong một chuỗi CSV (ví dụ cần truyền đối tượng, danh sách lồng nhau).
- Dữ liệu test cần được **tính toán động** (ví dụ sinh ngẫu nhiên có kiểm soát seed, hoặc đọc từ một cấu trúc dữ liệu có sẵn trong code) thay vì viết cứng.

</details>

**9. Vì sao khi so sánh số thực (`double`/`float`), không nên dùng `assertEquals(0.3, ketQua)` mà cần dùng `assertEquals(0.3, ketQua, delta)`?**

<details className="qa">
<summary>Xem đáp án</summary>

- Số thực (`double`/`float`) trong Java được biểu diễn theo chuẩn dấu phẩy động (floating-point, IEEE 754), vốn **không thể biểu diễn chính xác tuyệt đối** hầu hết các số thập phân — dẫn tới sai số làm tròn (rounding error) rất nhỏ trong tính toán. Ví dụ `0.1 + 0.2` trong Java thường không cho ra chính xác `0.3` mà là `0.30000000000000004`.
- Nếu dùng `assertEquals(0.3, ketQua)` để so sánh **chính xác tuyệt đối**, test có thể fail dù về mặt toán học hai giá trị "coi như bằng nhau", chỉ vì lệch nhau ở phần thập phân rất nhỏ do sai số làm tròn.
- Cách đúng: truyền thêm tham số thứ ba là **delta** (sai số cho phép), ví dụ `assertEquals(0.3, ketQua, 0.0001)` — test chỉ fail nếu độ chênh lệch giữa hai giá trị **vượt quá** delta này, phù hợp với bản chất không chính xác tuyệt đối của số thực.

</details>

**10. `@Nested` và `assertAll` trong JUnit 5 dùng để giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`@Nested`**: cho phép định nghĩa các class test **lồng nhau** bên trong một class test chính, giúp nhóm các test liên quan theo ngữ cảnh (ví dụ nhóm test cho "khi tài khoản có số dư dương" tách biệt với "khi tài khoản âm"), làm báo cáo test có cấu trúc rõ ràng và dễ đọc hơn khi số lượng test case lớn.
- **`assertAll`**: cho phép nhóm **nhiều assertion độc lập** vào một khối, sao cho nếu một assertion fail, các assertion còn lại **vẫn được chạy và báo cáo đầy đủ**, thay vì dừng ngay ở assertion đầu tiên fail như cách gọi `assertEquals` liên tiếp thông thường.

```java
@Test
void testThongTinNguoiDung() {
    User user = getUser();
    assertAll(
        () -> assertEquals("An", user.getTen()),
        () -> assertEquals("an@gmail.com", user.getEmail()),
        () -> assertTrue(user.getTuoi() > 0)
    );
}
```

- Với `assertAll`, nếu cả `getTen()` và `getEmail()` đều sai, báo cáo test sẽ liệt kê **cả hai** lỗi cùng lúc, giúp sửa nhanh hơn thay vì phải sửa từng lỗi rồi chạy lại nhiều lần mới thấy lỗi tiếp theo.

</details>

**11. Trong một dự án CI/CD, nếu một test bị lỗi không ổn định (flaky) do phụ thuộc vào thứ tự chạy giữa các test trong cùng một class, nguyên nhân thường gặp nhất là gì và JUnit 5 có đảm bảo thứ tự chạy test theo thứ tự khai báo trong code không?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Không**, theo mặc định JUnit 5 **không đảm bảo** thứ tự chạy các phương thức `@Test` trong cùng một class theo đúng thứ tự khai báo trong source code — thứ tự thực thi có thể khác nhau giữa các lần chạy hoặc giữa các phiên bản JUnit.
- Nguyên nhân phổ biến nhất gây flaky do phụ thuộc thứ tự: dùng **biến `static` hoặc trạng thái chia sẻ** giữa các test (ví dụ một danh sách static được test A thêm phần tử, rồi test B kỳ vọng danh sách đó đã có sẵn dữ liệu) — vi phạm nguyên tắc **Independent** của FIRST.
- Nếu thực sự cần một thứ tự chạy cụ thể (trường hợp hiếm, thường không khuyến khích vì phá vỡ tính độc lập), JUnit 5 cung cấp `@TestMethodOrder` kèm một `MethodOrderer` cụ thể (ví dụ `OrderAnnotation` kết hợp `@Order(n)`) để ép thứ tự chạy tường minh.
- Giải pháp bền vững hơn: thiết kế lại test để mỗi test tự chuẩn bị đầy đủ dữ liệu nó cần trong `@BeforeEach`, không phụ thuộc vào "tàn dư" trạng thái từ test chạy trước.

</details>

---

## 3. TestNG

Bài học: [3. TestNG](../../java/13-testing/3_testng.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. TestNG ra đời để giải quyết những hạn chế nào của JUnit (đặc biệt là JUnit 3/4)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Không có cơ chế nhóm test (groups)** built-in: JUnit 3/4 khó chạy chọn lọc một tập con test (ví dụ chỉ chạy "smoke test") mà không tách thành class/package riêng.
- **`@Parameterized` của JUnit 4 cồng kềnh**: phải viết constructor riêng và một phương thức static trả về `Collection<Object[]>`, nhiều boilerplate hơn `@DataProvider` của TestNG.
- **Khó cấu hình chạy song song (parallel)**: JUnit 4 không hỗ trợ tốt việc chạy nhiều test cùng lúc để rút ngắn thời gian.
- **Không có cơ chế khai báo phụ thuộc giữa các test**: JUnit 4 không có cách chuẩn để nói "testB chỉ nên chạy nếu testA đã pass", trong khi TestNG hỗ trợ qua `dependsOnMethods`.
- TestNG (ra đời 2004) bổ sung `groups`, `@DataProvider`, `priority`, và hệ thống vòng đời phong phú hơn để giải quyết các hạn chế này.

</details>

**2. Cho đoạn code sau, đâu là lỗi phổ biến khi lập trình viên quen JUnit chuyển sang viết test bằng TestNG?**

```java
import org.testng.Assert;

@Test
void testAdd() {
    Calculator calc = new Calculator();
    int ketQua = calc.add(2, 3);
    Assert.assertEquals(5, ketQua);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi**: viết `Assert.assertEquals(5, ketQua)` theo thói quen JUnit (mong đợi trước, thực tế sau), nhưng **TestNG quy ước ngược lại**: `assertEquals(thucTe, mongDoi)` — tham số đầu là giá trị **thực tế**, tham số sau mới là giá trị **mong đợi**.

- Về mặt kết quả pass/fail, thứ tự này **không ảnh hưởng** vì so sánh bằng nhau có tính đối xứng — test vẫn pass nếu `ketQua == 5`.
- Nhưng nếu test fail, **thông báo lỗi sẽ bị đọc ngược**: TestNG sẽ hiển thị dạng `expected [ketQua_value] but found [5]`, gây hiểu nhầm khi debug vì "expected" và "actual" bị hoán đổi vai trò so với những gì lập trình viên quen với JUnit mong đợi.
- Cách viết đúng theo quy ước TestNG: `Assert.assertEquals(ketQua, 5)` — thực tế trước, mong đợi sau.

</details>

**3. `priority` trong TestNG dùng để làm gì? Vì sao tài liệu khuyến cáo không nên lạm dụng thuộc tính này cho unit test thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

`priority` chỉ định **thứ tự chạy** các phương thức `@Test` — số càng nhỏ chạy càng sớm (mặc định TestNG chạy theo thứ tự bảng chữ cái tên phương thức nếu không đặt `priority`).

```java
@Test(priority = 1) void dangNhap() { ... }
@Test(priority = 2) void themSanPhamVaoGio() { ... }
@Test(priority = 3) void thanhToan() { ... }
```

- Không nên lạm dụng cho **unit test** vì unit test tốt phải **độc lập (Independent)** — không phụ thuộc thứ tự chạy, có thể chạy riêng lẻ hoặc song song mà vẫn ra kết quả đúng.
- `priority` chỉ thực sự hữu ích khi mô phỏng một **luồng nghiệp vụ tuần tự** có thật (ví dụ test kịch bản E2E: đăng nhập → thêm giỏ hàng → thanh toán, nơi các bước phụ thuộc lẫn nhau một cách tự nhiên), chứ không nên dùng để "vá" cho một unit test thiết kế sai khiến nó phụ thuộc trạng thái từ test khác.

</details>

**4. `groups` trong TestNG giải quyết vấn đề gì trong CI/CD? Cho ví dụ cấu hình `testng.xml` chỉ chạy nhóm `smoke`.**

<details className="qa">
<summary>Xem đáp án</summary>

`groups` cho phép gắn "nhãn" lên từng test, sau đó **chạy chọn lọc** theo nhãn thay vì phải chạy toàn bộ test suite mỗi lần.

- Trong CI/CD, điều này rất hữu ích: pipeline có thể chạy nhóm **`smoke`** (test nhanh, kiểm tra các chức năng cốt lõi) ngay sau mỗi lần commit để phản hồi nhanh, còn nhóm **`regression`** (test đầy đủ, chạy lâu hơn) chỉ chạy định kỳ hoặc trước khi release.

```xml
<suite name="BoTestCuaToi">
    <test name="ChiChaySmoke">
        <groups>
            <run>
                <include name="smoke"/>
            </run>
        </groups>
        <classes>
            <class name="GroupTest"/>
        </classes>
    </test>
</suite>
```

- Một test có thể thuộc **nhiều nhóm cùng lúc** (`@Test(groups = {"smoke", "regression"})`), giúp linh hoạt tổ chức nhiều chiến lược chạy test khác nhau từ cùng một bộ test case.

</details>

**5. So sánh `@DataProvider` của TestNG với `@ParameterizedTest` + `@CsvSource` của JUnit 5. Vì sao `@DataProvider` được xem là linh hoạt hơn trong một số trường hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều giải quyết cùng vấn đề: chạy một logic test với nhiều bộ dữ liệu, tránh copy-paste.

```java
@DataProvider(name = "duLieuPhepCong")
public Object[][] cungCapDuLieu() {
    return new Object[][] { {1, 1, 2}, {2, 3, 5} };
}

@Test(dataProvider = "duLieuPhepCong")
void testAdd(int a, int b, int mongDoi) {
    Assert.assertEquals(calc.add(a, b), mongDoi);
}
```

- `@DataProvider` là **một phương thức Java bình thường** trả về `Object[][]` — có thể chứa **logic tùy ý**: đọc từ file Excel, gọi database, gọi API, tính toán động dữ liệu test.
- `@CsvSource` của JUnit 5 chỉ nhận **chuỗi tĩnh viết cứng** trong annotation, phù hợp với dữ liệu đơn giản; khi cần dữ liệu phức tạp hoặc động, JUnit 5 phải chuyển sang dùng `@MethodSource` (tương tự về bản chất với `@DataProvider`, nhưng cú pháp khai báo khác).
- Nhìn chung, `@DataProvider` của TestNG có phần **gọn và mạnh hơn ngay từ đầu** cho các trường hợp dữ liệu phức tạp, không cần "chuyển đổi" sang một annotation khác như JUnit 5.

</details>

**6. Trình bày đầy đủ thứ tự chạy các annotation vòng đời trong TestNG khi một class có nhiều `@Test`, gồm `@BeforeSuite`, `@BeforeClass`, `@BeforeMethod`, `@AfterMethod`, `@AfterClass`, `@AfterSuite`.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự chạy:

1. **`@BeforeSuite`** — chạy **một lần duy nhất** trước toàn bộ suite (tập hợp nhiều test class).
2. **`@BeforeClass`** — chạy **một lần** trước tất cả test trong class.
3. Với **mỗi** phương thức `@Test`:
   - **`@BeforeMethod`** chạy trước.
   - **`@Test`** chạy.
   - **`@AfterMethod`** chạy sau.
4. **`@AfterClass`** — chạy **một lần** sau khi tất cả test trong class đã chạy xong.
5. **`@AfterSuite`** — chạy **một lần duy nhất** sau toàn bộ suite.

- Đây là hệ thống vòng đời **phong phú hơn** JUnit 5 (chỉ có `@BeforeAll`/`@BeforeEach`/`@AfterEach`/`@AfterAll` ở cấp class), vì TestNG có thêm cấp độ **suite** — hữu ích khi tổ chức nhiều class test thành một bộ suite lớn qua `testng.xml`.

</details>

**7. So sánh `@BeforeEach`/`@AfterEach` của JUnit 5 với `@BeforeMethod`/`@AfterMethod` của TestNG — chúng có tương đương hoàn toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Về mặt **thời điểm chạy**, chúng tương đương: cả hai đều chạy **trước/sau mỗi phương thức test**.

Khác biệt:

- **Import**: JUnit dùng `org.junit.jupiter.api.BeforeEach`/`AfterEach`; TestNG dùng `org.testng.annotations.BeforeMethod`/`AfterMethod`.
- **Cấp độ vòng đời**: TestNG có thêm các cấp **suite** (`@BeforeSuite`/`@AfterSuite`) mà JUnit 5 không có khái niệm tương đương trực tiếp ở cấp class đơn lẻ (JUnit 5 quản lý việc gom nhiều class qua cấu hình runner/IDE/build tool, không qua annotation trong code).
- **Instance lifecycle**: JUnit 5 mặc định tạo instance mới cho mỗi test method (`PER_METHOD`), còn TestNG theo mặc định dùng **chung một instance** cho tất cả test method trong class — đây là khác biệt quan trọng ảnh hưởng tới cách quản lý state giữa các test.

</details>

**8. Vì sao trong một dự án dùng Gradle, nếu quên cấu hình `useTestNG()` trong khối `test { ... }`, các test viết bằng TestNG có thể hoàn toàn không được chạy dù không báo lỗi biên dịch?**

<details className="qa">
<summary>Xem đáp án</summary>

- Gradle mặc định dùng **JUnit Platform** để chạy test, nên nếu không khai báo rõ `useTestNG()`, Gradle sẽ cố tìm và chạy test theo cơ chế nhận diện của JUnit — mà annotation `@Test` của TestNG (`org.testng.annotations.Test`) **không được JUnit engine nhận diện**.
- Kết quả: các test class dùng TestNG **âm thầm không được chạy** — Gradle không báo lỗi (vì code biên dịch bình thường), báo cáo test có thể hiển thị "0 test" hoặc bỏ qua hoàn toàn các class đó, dễ khiến lập trình viên tưởng nhầm là "không có test nào cần chạy" hoặc mọi thứ đều ổn.
- Cách khắc phục: thêm `useTestNG()` vào khối `test { ... }` trong `build.gradle` để báo Gradle chuyển sang dùng TestNG engine.

```groovy
test {
    useTestNG()
}
```

</details>

**9. Trong tình huống nào nên chọn TestNG thay vì JUnit 5 cho một dự án mới? Nêu ít nhất hai lý do cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Nên cân nhắc TestNG khi:

- **Automation testing với Selenium/Appium**: TestNG là lựa chọn phổ biến nhất trong cộng đồng automation testing nhờ khả năng quản lý nhóm test (`groups`) tách biệt smoke/regression, và tích hợp `testng.xml` mạnh để cấu hình chạy theo môi trường (dev/staging/prod).
- **Cần khai báo phụ thuộc rõ ràng giữa các test**: ví dụ test kịch bản E2E nhiều bước, nơi bước sau chỉ có ý nghĩa khi bước trước đã pass (`dependsOnMethods`), mà JUnit 5 không có cơ chế tương đương trực tiếp trong core.
- **Cần chạy test song song ở nhiều cấp độ** (method, class, suite) với cấu hình linh hoạt qua XML, phù hợp cho bộ test E2E lớn cần tối ưu thời gian chạy trong CI/CD.
- Ngược lại, nếu chỉ cần **unit test thông thường** cho logic nghiệp vụ, JUnit 5 vẫn là lựa chọn phổ biến, đơn giản và đủ dùng hơn cho đa số dự án.

</details>

**10. Một team đang có sẵn hàng trăm unit test viết bằng JUnit 5, giờ muốn thêm bộ test automation bằng Selenium dùng TestNG trong cùng dự án. Điều này có khả thi không, và cần lưu ý gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Khả thi**, và trên thực tế khá phổ biến — nhiều dự án dùng JUnit 5 cho unit test và TestNG riêng cho automation/E2E test, vì hai framework không nhất thiết loại trừ lẫn nhau trong cùng một dự án (miễn có đủ dependency cho cả hai).

Lưu ý quan trọng:

- **Tách rõ thư mục/package** giữa hai loại test để tránh nhầm lẫn khi maintain, ví dụ `src/test/java/unit/` (JUnit 5) và `src/test/java/e2e/` (TestNG).
- **Cấu hình build tool đúng cách**: với Maven, Surefire plugin cần được cấu hình để nhận diện cả hai loại test engine (JUnit Platform và TestNG); với Gradle, cần tách task test riêng cho từng loại nếu muốn chạy độc lập, vì mặc định một khối `test { }` chỉ dùng một engine tại một thời điểm.
- **Nhất quán trong team**: cần thống nhất rõ ràng khi nào dùng framework nào (ví dụ "TestNG chỉ dùng cho automation, JUnit 5 dùng cho mọi unit test khác") để tránh tình trạng lẫn lộn, mỗi người viết theo một kiểu khác nhau không có lý do rõ ràng.

</details>

**11. Đoạn code TestNG sau minh họa cơ chế `dependsOnMethods`. Nếu `testDangNhap()` fail, điều gì xảy ra với `testMuaHang()`?**

```java
@Test(groups = "smoke")
public void testDangNhap() {
    Assert.assertTrue(dangNhapThanhCong());
}

@Test(groups = "regression", dependsOnMethods = "testDangNhap")
public void testMuaHang() {
    Assert.assertTrue(muaHangThanhCong());
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Nếu `testDangNhap()` **fail** (hoặc ném exception), `testMuaHang()` sẽ **không được thực thi** mà tự động được đánh dấu là **`SKIPPED`** (bị bỏ qua), chứ không phải chạy bình thường rồi fail theo.

- Đây chính là cơ chế **khai báo phụ thuộc giữa các test** mà TestNG hỗ trợ qua `dependsOnMethods` — đảm bảo logic: nếu bước trước (`đăng nhập`) đã thất bại, việc chạy tiếp bước sau (`mua hàng`) là vô nghĩa vì chắc chắn cũng sẽ fail (do phụ thuộc trạng thái từ bước trước), gây lãng phí thời gian chạy test và làm nhiễu báo cáo với nhiều lỗi cùng một nguyên nhân gốc.
- Trong báo cáo test, `testMuaHang` sẽ hiển thị trạng thái riêng biệt là **SKIP**, giúp phân biệt rõ với trạng thái **FAIL** thực sự — người xem báo cáo biết ngay cần tập trung điều tra `testDangNhap` trước.

</details>

---

## 4. Mockito (Mocking)

Bài học: [4. Mockito (Mocking)](../../java/13-testing/4_mockito.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mock là gì? Nêu ít nhất ba lý do nên dùng mock thay vì gọi trực tiếp phụ thuộc thật khi viết unit test.**

<details className="qa">
<summary>Xem đáp án</summary>

**Mock** là một đối tượng giả lập, "đóng thế" cho một đối tượng thật (database, API, service khác) trong lúc test, cho phép bạn khai báo trước hành vi mong muốn ("khi gọi phương thức X với tham số Y, hãy trả về Z") mà không chạy code thật bên trong.

Lý do nên dùng mock:

- **Tốc độ**: không cần gọi database/API/mạng thật, test chạy trong mili-giây thay vì giây.
- **Ổn định (Repeatable)**: kết quả mock luôn cố định theo những gì đã "dạy", không bị ảnh hưởng bởi dữ liệu thật thay đổi hay mạng chập chờn.
- **An toàn**: tránh việc test vô tình gửi email thật, trừ tiền thật, hay ghi đè dữ liệu thật trong hệ thống production/staging.
- **Cô lập (Independent)**: chỉ kiểm tra đúng logic của lớp đang test, không bị "nhiễu" bởi lỗi từ các thành phần phụ thuộc khác.

</details>

**2. Giải thích ý nghĩa của đoạn code sau. "Stubbing" trong Mockito nghĩa là gì?**

```java
UserRepository repoMock = mock(UserRepository.class);
when(repoMock.findById(1)).thenReturn(new User(1, "An"));
```

<details className="qa">
<summary>Xem đáp án</summary>

- `mock(UserRepository.class)` tạo ra một **đối tượng giả lập** của `UserRepository` — một implementation "rỗng" tự động sinh ra, mọi phương thức khi gọi mặc định trả về giá trị rỗng/null (chưa được dạy gì).
- `when(repoMock.findById(1)).thenReturn(new User(1, "An"))` là **stubbing** — hành động "dạy" cho mock: khi phương thức `findById(1)` được gọi (đúng với tham số `1`), hãy trả về đối tượng `User(1, "An")` thay vì chạy logic thật (vì mock không có logic thật nào để chạy).
- Nếu gọi `findById` với một tham số khác (ví dụ `findById(2)`) mà chưa được stub riêng, mock sẽ trả về giá trị mặc định (thường là `null` với kiểu tham chiếu).

</details>

**3. `verify()` trong Mockito dùng để làm gì? Phân biệt "behavior verification" (kiểm tra hành vi) với "state verification" (kiểm tra trạng thái/kết quả).**

<details className="qa">
<summary>Xem đáp án</summary>

`verify(mock).phuongThuc(...)` dùng để **xác nhận một phương thức đã được gọi** trên mock, với đúng số lần và đúng tham số mong đợi (hoặc chưa từng được gọi, qua `never()`).

```java
verify(repoMock, times(1)).save(any(User.class));
verify(repoMock, never()).delete(anyInt());
```

- **State verification** (kiểm tra trạng thái): kiểm tra **kết quả trả về** hoặc trạng thái cuối cùng của đối tượng sau khi hành động, ví dụ `assertEquals("An", ten)`.
- **Behavior verification** (kiểm tra hành vi): kiểm tra **tương tác** giữa đối tượng đang test và các phụ thuộc của nó — ví dụ xác nhận `repository.save(...)` đã thực sự được gọi, dù kết quả trả về của phương thức chính không trực tiếp phản ánh điều đó.
- Cả hai loại kiểm tra bổ trợ cho nhau: state verification trả lời "kết quả có đúng không", behavior verification trả lời "code có tương tác đúng cách với phụ thuộc không" (ví dụ có thực sự lưu vào DB, có thực sự gửi email hay không).

</details>

**4. `@Mock`, `@InjectMocks` và `@ExtendWith(MockitoExtension.class)` phối hợp với nhau như thế nào? Điều gì xảy ra nếu quên `@ExtendWith(MockitoExtension.class)`?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;
}
```

- **`@Mock`**: đánh dấu một field cần được Mockito tự động khởi tạo thành mock (tương đương gọi `mock(UserRepository.class)` thủ công).
- **`@InjectMocks`**: tạo một instance **thật** của class được đánh dấu (ở đây là `UserService`), rồi tự động "nhét" (inject) các field `@Mock` đã tạo vào instance đó — thường qua constructor injection nếu có constructor phù hợp.
- **`@ExtendWith(MockitoExtension.class)`**: extension của JUnit 5 chịu trách nhiệm **xử lý các annotation** `@Mock`/`@InjectMocks` — nó "quét" class test trước khi chạy để khởi tạo các field này.
- Nếu **quên** `@ExtendWith(MockitoExtension.class)`, không có gì xử lý các annotation `@Mock`/`@InjectMocks` — mọi field được đánh dấu sẽ giữ nguyên giá trị mặc định là **`null`**, dẫn tới `NullPointerException` ngay khi test cố gọi phương thức trên chúng.

</details>

**5. Nếu gọi một phương thức trên mock mà chưa được stub (chưa dùng `when(...)`), phương thức đó trả về gì? Cho ví dụ với kiểu trả về là `int`, `boolean`, và `List<String>`.**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, Mockito trả về **giá trị mặc định "an toàn"** (smart null / default value) tùy theo kiểu trả về khai báo, chứ **không** ném exception hay trả về giá trị ngẫu nhiên:

- Kiểu đối tượng tham chiếu (`User`, `String`...): trả về **`null`**.
- Kiểu số nguyên (`int`, `long`...): trả về **`0`**.
- Kiểu `boolean`: trả về **`false`**.
- Kiểu `List`, `Map`, `Set`...: trả về một **collection rỗng** (ví dụ `List<String>` trả về danh sách rỗng, không phải `null`), giúp tránh `NullPointerException` khi code gọi `.size()` hay lặp qua collection ngay cả khi chưa stub.

Đây là lý do một mock chưa stub gì vẫn có thể dùng an toàn trong nhiều trường hợp — nhưng nếu logic cần một giá trị cụ thể để test đúng, bắt buộc phải stub rõ ràng qua `when(...).thenReturn(...)`.

</details>

**6. `UnnecessaryStubbingException` là gì? Vì sao Mockito (ở chế độ mặc định) lại chủ động báo lỗi này thay vì im lặng bỏ qua?**

<details className="qa">
<summary>Xem đáp án</summary>

`UnnecessaryStubbingException` xảy ra khi bạn dùng `when(...).thenReturn(...)` để stub một phương thức, nhưng **trong quá trình chạy test, phương thức đó không hề được gọi tới** — nghĩa là có một stub "thừa", không được dùng đến.

```java
when(repository.findById(1)).thenReturn(new User(1, "An")); // stub này
service.createUser("Bình"); // nhưng logic này không hề gọi findById(1)!
```

- Mockito (từ phiên bản 2 trở đi, với "strict stubbing" là mặc định) chủ động báo lỗi này thay vì im lặng, vì stub thừa thường là **dấu hiệu của một lỗi tiềm ẩn**: có thể lập trình viên hiểu sai luồng logic thực tế của code, hoặc test đã lỗi thời sau khi code được refactor mà quên dọn dẹp stub không còn cần thiết — giữ test sạch sẽ giúp dễ bảo trì hơn về lâu dài.
- Nếu thực sự cần một stub "có thể dùng hoặc không" (tùy nhánh logic), có thể dùng `lenient().when(...)` để tắt kiểm tra nghiêm ngặt cho riêng stub đó.

</details>

**7. Phân biệt `@Mock` và `@Spy` trong Mockito. Cho ví dụ tình huống nên dùng `@Spy` thay vì `@Mock`.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`@Mock`**: tạo một đối tượng **hoàn toàn giả**, mọi phương thức mặc định trả về giá trị rỗng/null cho tới khi được stub — không có phương thức nào chạy logic thật.
- **`@Spy`**: tạo một **"mock bán phần" (partial mock)** bọc quanh một **đối tượng thật** — mọi phương thức mặc định vẫn **chạy logic thật** của đối tượng gốc, trừ những phương thức bạn chủ động stub lại bằng `when(...)`/`doReturn(...)`.

```java
@Spy
private List<String> danhSachThat = new ArrayList<>();

@Test
void viDuSpy() {
    danhSachThat.add("A"); // chạy logic ArrayList thật -> thêm thành công
    assertEquals(1, danhSachThat.size()); // size() cũng chạy thật, trả về 1
}
```

- Nên dùng `@Spy` khi bạn muốn giữ **hầu hết hành vi thật** của đối tượng, chỉ cần "ghi đè" một vài phương thức cụ thể (ví dụ một phương thức gọi mạng bên trong một class tiện ích lớn), thay vì phải giả lập toàn bộ hành vi của nó như `@Mock`.

</details>

**8. `ArgumentCaptor` trong Mockito dùng để giải quyết vấn đề gì? Cho ví dụ dùng nó để kiểm tra chi tiết đối tượng `Order` được truyền vào `orderRepo.save(...)`.**

<details className="qa">
<summary>Xem đáp án</summary>

`ArgumentCaptor` cho phép **"bắt" (capture) lại giá trị tham số thực tế** đã được truyền vào một lời gọi phương thức trên mock, để sau đó kiểm tra chi tiết giá trị đó — hữu ích khi `verify(mock).method(any())` không đủ chi tiết (chỉ xác nhận có gọi, không xác nhận nội dung tham số).

```java
@Test
void datHangLuuDungThongTin() {
    Order order = new Order(100, "an@example.com");
    service.placeOrder(order);

    ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
    verify(orderRepo).save(captor.capture());

    Order daLuu = captor.getValue();
    assertEquals(100, daLuu.getAmount());
    assertEquals("an@example.com", daLuu.getEmail());
}
```

- Rất hữu ích khi đối tượng truyền vào được **tạo/biến đổi bên trong** phương thức đang test (ví dụ service tự sinh thêm `orderId`, `timestamp` trước khi lưu) — bạn không có sẵn đối tượng đó ở bên ngoài để so sánh trực tiếp bằng `verify(orderRepo).save(order)`, nên cần "bắt" lại đúng đối tượng thực sự được truyền vào lúc chạy.

</details>

**9. Vì sao việc `verify()` quá nhiều chi tiết (ví dụ verify thứ tự gọi, verify từng tham số nhỏ nhặt) lại khiến test trở nên "giòn" (fragile) khi refactor code?**

<details className="qa">
<summary>Xem đáp án</summary>

- Test "giòn" là test **fail không phải vì hành vi thực sự sai**, mà chỉ vì cách triển khai nội bộ thay đổi (dù kết quả cuối cùng vẫn đúng) — verify quá chi tiết khiến test gắn chặt vào **cách** code hoạt động bên trong, thay vì **cái gì** code tạo ra.
- Ví dụ: nếu verify nghiêm ngặt thứ tự gọi `orderRepo.save()` phải xảy ra **trước** `emailService.send()`, thì khi lập trình viên sau này đảo thứ tự hai dòng code (mà không ảnh hưởng gì tới kết quả nghiệp vụ), test sẽ fail dù hành vi cuối cùng vẫn hoàn toàn đúng — buộc phải sửa lại test dù chẳng có bug nào thực sự.
- Nguyên tắc thực hành tốt: chỉ `verify()` những tương tác **thực sự quan trọng về mặt nghiệp vụ** (ví dụ "email xác nhận phải được gửi khi đặt hàng thành công"), tránh verify những chi tiết triển khai không ảnh hưởng tới hành vi bên ngoài mà người dùng/hệ thống khác quan sát được.

</details>

**10. Với `OrderService.placeOrder(order)` (đơn hàng có `amount <= 0` sẽ trả về `false` mà không lưu và không gửi email), viết test xác nhận rằng khi số tiền âm, cả `orderRepo.save()` lẫn `emailService.send()` đều KHÔNG được gọi. Vì sao cả hai lời `verify` này đều cần thiết, không thể chỉ kiểm tra `assertFalse(ketQua)` là đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
@Test
void datHangThatBaiKhiSoTienAm() {
    Order order = new Order(-5, "an@example.com");
    boolean ketQua = service.placeOrder(order);

    assertFalse(ketQua);
    verify(orderRepo, never()).save(any());
    verify(emailService, never()).send(any(), any());
}
```

- `assertFalse(ketQua)` chỉ xác nhận **giá trị trả về** đúng như mong đợi (state verification) — nhưng **không đảm bảo** rằng code bên trong không vô tình vẫn gọi `save()` hoặc `send()` trước khi trả về `false` (ví dụ một lỗi logic khiến đơn hàng vẫn bị lưu dù hàm trả về `false`).
- Hai lời `verify(..., never())` bổ sung phần **behavior verification** — đảm bảo rằng không có **tác dụng phụ (side effect)** nguy hiểm nào xảy ra (lưu dữ liệu rác vào DB, gửi email sai cho khách hàng) dù giá trị trả về có vẻ đúng.
- Kết hợp cả hai loại kiểm tra giúp test toàn diện hơn: vừa đúng "output", vừa đúng "hành vi tương tác" với các phụ thuộc bên ngoài.

</details>

**11. Trước đây (các phiên bản Mockito cũ hơn), việc mock một `final class` hoặc `final method` gặp hạn chế gì? Mockito hiện đại (Mockito 5) đã khắc phục ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- Cơ chế mock mặc định trước đây của Mockito dựa trên việc **tạo subclass động (dynamic subclassing)** của class cần mock để ghi đè hành vi — nhưng Java **không cho phép override một class hoặc method `final`**, nên các phiên bản Mockito cũ **không thể mock được** `final class`/`final method` theo cách này.
- Từ Mockito 2 trở đi, thư viện giới thiệu **"inline mock maker"** — sử dụng cơ chế thao tác bytecode ở mức thấp hơn (dựa trên Java Instrumentation API) thay vì subclassing, cho phép mock được cả `final class` lẫn `final method`, `static method`, và `private method` trong một số trường hợp.
- Từ **Mockito 5**, inline mock maker đã trở thành **cơ chế mặc định** (không cần cấu hình thêm file `org.mockito.plugins.MockMaker` như các phiên bản Mockito 2/3/4 yêu cầu), giúp việc mock các class `final` hoạt động "ngay khi cài đặt" mà không cần bước thiết lập bổ sung.

</details>

---

## 5. Integration Testing (Kiểm thử tích hợp)

Bài học: [5. Integration Testing (Kiểm thử tích hợp)](../../java/13-testing/5_integration-testing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Integration test khác unit test ở những điểm cốt lõi nào? Nêu một loại lỗi cụ thể mà unit test không thể bắt được nhưng integration test bắt được.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Unit test | Integration test |
|---|---|---|
| Phạm vi | Một method/class, cô lập | Nhiều thành phần ghép lại |
| Phụ thuộc | Mock hoàn toàn | Dùng thật (database, service khác) |
| Tốc độ | Rất nhanh (mili-giây) | Chậm hơn (giây) |

- **Ví dụ lỗi unit test bỏ sót**: entity Java ánh xạ (mapping) sai kiểu dữ liệu so với schema thật của database (ví dụ cột `age` trong DB là `INTEGER` nhưng field Java khai báo `String`). Vì unit test dùng mock (`when(repository.save(any())).thenReturn(mockUser)`), câu lệnh SQL thật **không bao giờ được thực thi**, nên lỗi mapping/kiểu dữ liệu hoàn toàn không bị phát hiện — chỉ khi integration test chạy với database thật, lỗi mới lộ ra.
- Cả hai loại test **bổ sung cho nhau**, không thay thế nhau: unit test nhanh để kiểm tra logic thuần túy, integration test chậm hơn nhưng bắt được lỗi khi các thành phần thực sự ghép nối với nhau.

</details>

**2. Test Pyramid (kim tự tháp kiểm thử) khuyến nghị tỉ lệ như thế nào giữa unit test, integration test và E2E test? Vì sao lại theo tỉ lệ đó thay vì viết thật nhiều E2E test để "chắc ăn"?**

<details className="qa">
<summary>Xem đáp án</summary>

Test Pyramid khuyến nghị: **nhiều** unit test ở đáy, **vừa phải** integration test ở giữa, **ít** E2E test trên đỉnh.

Lý do không nên viết quá nhiều E2E test:

- **Chi phí thời gian**: E2E test (chạy qua toàn bộ hệ thống, thường qua UI hoặc HTTP thật) chậm hơn unit test hàng trăm đến hàng nghìn lần — một bộ E2E test lớn có thể mất hàng giờ để chạy hết, làm chậm vòng phản hồi (feedback loop) của lập trình viên.
- **Dễ vỡ (fragile)**: E2E test phụ thuộc vào nhiều thành phần cùng lúc (UI, network, nhiều service), nên dễ fail vì lý do không liên quan tới bug thực sự (ví dụ timeout mạng, phần tử UI đổi vị trí), gây "flaky test" khó tin cậy.
- **Khó xác định nguyên nhân lỗi**: khi một E2E test fail, phải điều tra qua rất nhiều tầng mới tìm ra nguyên nhân gốc, trong khi unit test fail thường chỉ ra chính xác dòng code có vấn đề.
- Chiến lược tối ưu: dùng unit test để bắt phần lớn lỗi logic nhanh và rẻ, dùng integration/E2E test có chọn lọc cho những luồng nghiệp vụ quan trọng nhất.

</details>

**3. `@SpringBootTest` làm gì khi chạy một test? Vì sao tài liệu khuyến cáo không nên dùng annotation này cho mọi test?**

<details className="qa">
<summary>Xem đáp án</summary>

`@SpringBootTest` khởi động **toàn bộ application context** của Spring Boot khi chạy test — nạp tất cả bean, cấu hình, kết nối datasource... giống hệt như khi chạy ứng dụng thật, thay vì tự tạo đối tượng bằng `new` và mock thủ công như unit test.

- Vì phải khởi động **toàn bộ** context (có thể gồm hàng trăm bean, kết nối database, message queue...), `@SpringBootTest` **chậm hơn đáng kể** so với unit test thông thường — mỗi lần chạy có thể mất vài giây tới hàng chục giây, tùy độ phức tạp của ứng dụng.
- Nếu dùng cho **mọi** test (kể cả những test chỉ cần kiểm tra logic đơn giản của một class), tổng thời gian chạy toàn bộ test suite sẽ tăng vọt, làm chậm cả vòng lặp phát triển (build, CI/CD).
- Khuyến nghị: chỉ dùng `@SpringBootTest` khi **thực sự cần kiểm thử tích hợp** (ví dụ kiểm tra luồng Controller → Service → Repository hoạt động đúng khi ghép lại), còn lại nên dùng unit test thuần với mock, hoặc các annotation "slice test" nhẹ hơn.

</details>

**4. So sánh H2 in-memory database với Testcontainers khi viết integration test. Vì sao Testcontainers được xem là lựa chọn "đáng tin cậy hơn"?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | H2 (in-memory) | Testcontainers |
|---|---|---|
| Tốc độ khởi động | Rất nhanh | Chậm hơn (phải khởi động container Docker) |
| Độ giống production | Không hoàn toàn giống (khác cú pháp SQL, khác hành vi với PostgreSQL/MySQL thật) | Giống hệt vì dùng **đúng loại database thật** (ví dụ PostgreSQL thật) |
| Yêu cầu môi trường | Không cần gì thêm | Cần **Docker** đang chạy trên máy |

- Vấn đề của H2: nó cố gắng **giả lập** hành vi của các database khác (chế độ tương thích PostgreSQL, MySQL...), nhưng không bao giờ giống 100% — một số cú pháp SQL đặc thù, hành vi ràng buộc, hay kiểu dữ liệu riêng của database thật có thể hoạt động khác với H2, dẫn tới tình huống **test pass với H2 nhưng fail (hoặc tệ hơn, lỗi âm thầm) khi chạy với database production thật**.
- Testcontainers giải quyết triệt để vấn đề này bằng cách chạy **chính loại database dùng ở production** (ví dụ PostgreSQL 16) trong Docker container tạm thời — đảm bảo kết quả test phản ánh đúng hành vi thực tế, đổi lại phải chấp nhận tốc độ chậm hơn và yêu cầu môi trường có Docker.

</details>

**5. Test sau có nguy cơ gì khi chạy trên một database "sạch" (mới khởi tạo, chưa có dữ liệu)?**

```java
@Test
void timNguoiDungThuBa() {
    List<User> users = userRepository.findAll();
    User nguoiThuBa = users.get(2);  // giả định đã có sẵn ít nhất 3 người dùng
    assertEquals("An", nguoiThuBa.getName());
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Nguy cơ**: test này **giả định database đã có sẵn dữ liệu từ trước** (ít nhất 3 bản ghi `User`, với người thứ ba tên "An") — vi phạm nguyên tắc mỗi test phải **tự tạo dữ liệu nó cần**.

- Trên một database "sạch" (ví dụ container Testcontainers mới khởi tạo, hoặc môi trường CI chạy từ đầu), bảng `users` sẽ **rỗng**, khiến `users.get(2)` ném ra `IndexOutOfBoundsException` ngay lập tức, chứ không fail ở assertion như mong đợi.
- Ngay cả khi database có dữ liệu sẵn, thứ tự trả về của `findAll()` **không được đảm bảo** (trừ khi có `ORDER BY` rõ ràng), nên việc giả định "người thứ ba" luôn là "An" là không đáng tin cậy.
- Cách sửa đúng: trong chính test đó (hoặc `@BeforeEach`), **tự tạo** dữ liệu người dùng cần thiết trước khi thực hiện assertion, đảm bảo test độc lập và chạy đúng trên bất kỳ môi trường nào.

</details>

**6. Vì sao mỗi integration test cần "dọn dẹp" dữ liệu sau khi chạy (hoặc đảm bảo không để lại dữ liệu ảnh hưởng test khác)? Nêu hai cách phổ biến để đảm bảo điều này.**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu một test ghi dữ liệu vào database thật mà không dọn dẹp, **dữ liệu đó tồn tại xuyên suốt các test tiếp theo** — có thể khiến test sau bị ảnh hưởng (ví dụ test đếm số bản ghi trong bảng sẽ ra kết quả sai vì đã có dữ liệu "rác" từ test trước), vi phạm nguyên tắc **Independent** và **Repeatable**.

Hai cách phổ biến:

- **Transaction rollback tự động**: dùng `@Transactional` trên class/method test (kết hợp Spring TestContext Framework) — mỗi test method chạy trong một transaction riêng, và Spring **tự động rollback** transaction đó ngay sau khi test kết thúc, bất kể test pass hay fail, đưa database về trạng thái trước khi test chạy mà không cần dọn dẹp thủ công.
- **Xóa dữ liệu thủ công**: dùng `@AfterEach` để chủ động xóa các bản ghi đã tạo, hoặc dùng container Docker **mới hoàn toàn** cho mỗi lần chạy test suite (cách Testcontainers thường áp dụng ở cấp độ class/suite).

</details>

**7. `@DynamicPropertySource` dùng để làm gì khi kết hợp Testcontainers với Spring Boot? Vì sao không thể khai báo cứng URL database trong file `application.properties` khi dùng Testcontainers?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi Testcontainers khởi động một container database (ví dụ PostgreSQL), nó **tự chọn một cổng (port) ngẫu nhiên** trên máy host để tránh xung đột với các service khác đang chạy — nghĩa là URL kết nối, cổng, và đôi khi cả host, đều **không cố định trước**, chỉ biết được **sau khi** container đã khởi động thành công.

```java
@DynamicPropertySource
static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
}
```

- `@DynamicPropertySource` cho phép đăng ký các property Spring (như `spring.datasource.url`) **động, tại thời điểm chạy test**, lấy giá trị thực tế từ container đã khởi động (qua `postgres.getJdbcUrl()`), thay vì phải biết trước một giá trị cố định.
- Nếu khai báo cứng URL trong `application.properties` (ví dụ `jdbc:postgresql://localhost:5432/testdb`), giá trị đó sẽ **không khớp** với cổng thực tế mà container đang lắng nghe, khiến Spring không thể kết nối tới đúng database vừa được Testcontainers tạo ra.

</details>

**8. Vì sao nhiều dự án tách riêng unit test và integration test bằng quy ước đặt tên (ví dụ `*Test.java` cho unit test, `*IT.java` cho integration test)? Điều này liên quan gì tới các plugin Maven như Surefire và Failsafe?**

<details className="qa">
<summary>Xem đáp án</summary>

- Tách riêng để có thể **chạy chọn lọc** từng loại test theo nhu cầu: chạy unit test nhanh trong mỗi lần build thông thường, chỉ chạy integration test (chậm hơn, cần Docker/database) ở giai đoạn phù hợp của pipeline CI/CD (ví dụ trước khi merge, hoặc trong một job riêng).
- Trong hệ sinh thái Maven, quy ước phổ biến:
  - Plugin **Surefire** (chạy ở phase `test`) mặc định chỉ nhận diện các class có tên khớp mẫu như `*Test.java`, `Test*.java` — dùng cho **unit test**.
  - Plugin **Failsafe** (chạy ở phase `integration-test`, sau `package`) mặc định nhận diện các class có tên khớp mẫu như `*IT.java`, `*ITCase.java` — dùng cho **integration test**, và chạy `mvn verify` mới kích hoạt các test này.
- Nhờ quy ước tên rõ ràng, lệnh `mvn test` (chạy Surefire) sẽ **không** vô tình chạy các integration test chậm, giữ vòng lặp phát triển hàng ngày nhanh, trong khi `mvn verify` (chạy cả Surefire lẫn Failsafe) đảm bảo kiểm tra đầy đủ trước khi release.

</details>

**9. Ngoài `@SpringBootTest`, Spring Boot còn cung cấp các annotation "slice test" nhẹ hơn như `@DataJpaTest` hay `@WebMvcTest`. Chúng khác `@SpringBootTest` như thế nào, và khi nào nên ưu tiên dùng chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`@SpringBootTest`**: nạp **toàn bộ** application context (mọi bean, mọi tầng — Controller, Service, Repository, cấu hình bảo mật...).
- **`@DataJpaTest`**: chỉ nạp các bean liên quan tới **tầng dữ liệu (JPA)** — repository, entity manager, datasource — bỏ qua Controller/Service, giúp test tập trung đúng vào tầng persistence và khởi động nhanh hơn nhiều so với nạp cả ứng dụng. Mặc định còn tự cấu hình một database in-memory (trừ khi được cấu hình lại để dùng Testcontainers) và bọc mỗi test trong transaction tự rollback.
- **`@WebMvcTest`**: chỉ nạp tầng **web (Controller)**, mock các bean tầng Service bên dưới (thường kết hợp với `@MockBean`), phù hợp để test riêng logic xử lý HTTP request/response mà không cần khởi động toàn bộ ứng dụng.
- Nên ưu tiên dùng các "slice test" này khi chỉ cần kiểm thử tích hợp cho **một tầng cụ thể** (ví dụ chỉ muốn kiểm tra query JPA có đúng không), giúp test chạy nhanh hơn đáng kể so với `@SpringBootTest`, chỉ dùng `@SpringBootTest` đầy đủ khi thực sự cần kiểm tra sự phối hợp giữa **nhiều tầng cùng lúc**.

</details>

**10. Một service gọi tới một API bên ngoài (ví dụ cổng thanh toán) thông qua HTTP. Khi viết integration test cho luồng này, có nên gọi thẳng tới API thật của bên thứ ba không? Nêu cách tiếp cận phù hợp hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không nên** gọi thẳng API thật của bên thứ ba trong integration test, vì:

- **Không kiểm soát được**: API bên ngoài có thể chậm, gián đoạn, hoặc thay đổi hành vi bất cứ lúc nào — khiến test không ổn định (flaky), vi phạm nguyên tắc Repeatable.
- **Tốn kém/nguy hiểm**: gọi API thanh toán thật có thể **trừ tiền thật**, hoặc bị tính phí theo lượt gọi.
- **Phụ thuộc mạng**: test chạy trong CI/CD (thường trong mạng nội bộ hạn chế) có thể không truy cập được internet ra ngoài.

Cách tiếp cận phù hợp hơn:

- Dùng một **mock server HTTP** (ví dụ WireMock) chạy cục bộ, giả lập response của API bên thứ ba với các tình huống mong muốn (thành công, lỗi, timeout).
- Hoặc dùng Testcontainers để chạy một **bản giả lập/sandbox** của service đó nếu nhà cung cấp có hỗ trợ container test riêng.
- Chỉ gọi API thật của bên thứ ba trong một môi trường **staging riêng biệt, có kiểm soát**, không phải trong bộ integration test chạy tự động thường xuyên.

</details>

**11. Giải thích vì sao integration test dùng `@Transactional` để tự động rollback sau mỗi test lại KHÔNG phù hợp để kiểm tra hành vi commit/rollback thực tế của transaction trong code nghiệp vụ.**

<details className="qa">
<summary>Xem đáp án</summary>

- Khi dùng `@Transactional` ở **cấp độ test** (Spring TestContext Framework), toàn bộ test method chạy trong **một transaction bao trùm bên ngoài**, và Spring tự động rollback transaction đó sau khi test kết thúc — bất kể code nghiệp vụ bên trong có gọi commit hay không, vì bản thân transaction ở cấp method thường chỉ tham gia (participate) vào transaction bao trùm của test, không tự commit độc lập.
- Nếu mục tiêu của test là **xác nhận rằng transaction commit/rollback đúng theo logic nghiệp vụ** (ví dụ: "khi có lỗi giữa chừng, toàn bộ thay đổi phải rollback, không được lưu một phần"), việc bọc thêm một transaction rollback tự động ở cấp test có thể **che giấu** vấn đề thực sự — vì dữ liệu luôn bị rollback ở cuối bởi test framework, không phản ánh đúng việc code nghiệp vụ có tự commit/rollback đúng cách hay không trong một transaction độc lập thực sự.
- Giải pháp: với loại test cần kiểm tra hành vi transaction thực sự, nên **tắt** rollback tự động của test (ví dụ dùng `@Commit` hoặc không dùng `@Transactional` ở cấp test), và tự kiểm tra/dọn dẹp dữ liệu bằng cách khác (ví dụ mở một kết nối/transaction riêng biệt để verify dữ liệu đã thực sự được commit vào database).

</details>

---

## 6. REST Assured

Bài học: [6. REST Assured](../../java/13-testing/6_rest-assured.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. REST Assured giải quyết vấn đề gì so với việc test API bằng `HttpURLConnection`/`HttpClient` thuần?**

<details className="qa">
<summary>Xem đáp án</summary>

- Với `HttpURLConnection`/`HttpClient` thuần, lập trình viên phải tự làm mọi bước thủ công: mở kết nối, set method/header, gửi request, đọc `InputStream`, tự parse JSON bằng tay rồi mới so sánh từng trường — code dài dòng, dễ bỏ sót lỗi, khó đọc.
- REST Assured cung cấp một **DSL (domain-specific language)** theo cú pháp `given() → when() → then()`, tích hợp sẵn khả năng phân tích JSON (qua JsonPath) và các matcher Hamcrest, cho phép viết test ngắn gọn, gần như đọc bằng tiếng Anh tự nhiên, chỉ trong vài dòng thay vì hàng chục dòng code thủ công.

</details>

**2. Giải thích ý nghĩa từng phần trong cấu trúc `given() → when() → then()` của REST Assured.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
given()
    .baseUri("http://localhost:8080")
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .body("name", equalTo("An"));
```

- **`given()`** ("cho"): thiết lập các **điều kiện tiên quyết** trước khi gọi API — địa chỉ gốc (`baseUri`), header, tham số, body cần gửi.
- **`when()`** ("khi"): thực hiện **hành động gọi API** thật sự — chọn HTTP method (`get`, `post`, `put`, `delete`) và đường dẫn endpoint.
- **`then()`** ("thì"): **kiểm tra kết quả** trả về từ server — status code, header phản hồi, và nội dung body.

Cấu trúc này tương tự tinh thần của mô hình AAA (Arrange - Act - Assert) trong unit test, nhưng được đặt tên theo phong cách BDD (Behavior-Driven Development) để đọc tự nhiên hơn.

</details>

**3. JsonPath trong REST Assured dùng để làm gì? Với response JSON sau, viết đoạn kiểm tra để xác nhận `city` bên trong `address` là `"Ha Noi"`.**

```json
{
  "name": "An",
  "address": {
    "city": "Ha Noi",
    "street": "Tran Phu"
  }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**JsonPath** là cú pháp cho phép **truy cập trực tiếp vào một trường cụ thể** bên trong cấu trúc JSON (kể cả JSON lồng nhau nhiều cấp) mà không cần tự parse thủ công, sử dụng dấu chấm `.` để "đi sâu" vào các object con.

```java
given().baseUri("http://localhost:8080")
    .when().get("/users/1")
    .then()
        .statusCode(200)
        .body("address.city", equalTo("Ha Noi"));
```

- `"address.city"` nghĩa là: đi vào trường `address` (một object), rồi lấy tiếp trường `city` bên trong nó. Cú pháp này áp dụng được cho bất kỳ độ sâu lồng nhau nào, ví dụ `"address.detail.ward"`.

</details>

**4. Vì sao khi gửi request `POST` với body JSON, cần đặt header `Content-Type: application/json`? Điều gì xảy ra nếu quên header này?**

<details className="qa">
<summary>Xem đáp án</summary>

- Header `Content-Type` báo cho server biết **định dạng dữ liệu** của phần body đang gửi tới, để server biết cách **phân tích (parse)** đúng nội dung đó. Với `application/json`, server hiểu rằng body là một chuỗi JSON hợp lệ và cần deserialize theo định dạng JSON.
- Nếu **quên** khai báo header này (hoặc khai báo sai, ví dụ `text/plain`), nhiều framework server-side (như Spring Boot với `@RequestBody`) sẽ **không nhận diện đúng** cách parse body — dẫn tới lỗi phổ biến là response trả về mã **`415 Unsupported Media Type`** (server hiểu được request nhưng từ chối vì định dạng media không được hỗ trợ) hoặc **`400 Bad Request`** (server cố parse nhưng thất bại vì không biết định dạng).
- Đây là lỗi rất phổ biến khi mới bắt đầu viết integration test cho API POST/PUT, dễ nhầm lẫn với lỗi logic thực sự của API.

</details>

**5. Test sau kiểm tra tình huống nào? Vì sao việc test cả trường hợp lỗi (không chỉ trường hợp thành công) lại quan trọng khi kiểm thử REST API?**

```java
@Test
void taoNguoiDungThieuTenTraVe400() {
    given()
        .header("Content-Type", "application/json")
        .body("{ \"email\": \"loi@example.com\" }")
    .when().post("/users")
    .then().statusCode(400);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Test này kiểm tra tình huống **"đường đi lỗi" (error path)**: gửi request tạo người dùng mới nhưng **thiếu trường bắt buộc** (`name`), xác nhận rằng server phản hồi đúng mã **`400 Bad Request`** thay vì chấp nhận dữ liệu không hợp lệ hoặc trả về lỗi server (`500`).

- Tầm quan trọng của việc test cả trường hợp lỗi:
  - Xác nhận API có **validate input đúng cách** trước khi xử lý — một API không kiểm tra dữ liệu đầu vào có thể dẫn tới lưu dữ liệu rác vào database hoặc gây lỗi ở tầng sâu hơn.
  - Đảm bảo **mã trạng thái HTTP trả về đúng ý nghĩa ngữ nghĩa** (semantic) — client (frontend, service khác) dựa vào status code để xử lý phản hồi phù hợp; nếu API luôn trả `200` bất kể lỗi, client không thể phân biệt được thành công/thất bại.
  - Nếu chỉ test "đường đi đúng" mà bỏ qua lỗi, một thay đổi code vô tình làm mất validation sẽ **không bị phát hiện** cho tới khi gây sự cố ở production.

</details>

**6. Vì sao viết cứng (hard-code) `baseUri("http://localhost:8080")` trong test có thể gây lỗi khi tích hợp với Spring Boot dùng `@SpringBootTest(webEnvironment = RANDOM_PORT)`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `webEnvironment = RANDOM_PORT` khiến Spring Boot khởi động server test trên một **cổng ngẫu nhiên**, được cấp phát bởi hệ điều hành tại thời điểm chạy — không phải cổng cố định `8080` như khi chạy ứng dụng thông thường.
- Nếu test viết cứng `baseUri("http://localhost:8080")`, nó sẽ cố kết nối tới cổng `8080`, trong khi server thực tế đang lắng nghe ở một cổng khác (ví dụ `54321`) — dẫn tới lỗi kết nối (connection refused).
- Cách xử lý đúng: lấy cổng thực tế đã được cấp phát thông qua field `@LocalServerPort` (tiêm bởi Spring), rồi dùng giá trị đó để cấu hình `RestAssured.baseURI` hoặc `RestAssured.port` trước khi chạy test, ví dụ:

```java
@LocalServerPort
private int port;

@BeforeEach
void setUp() {
    RestAssured.baseURI = "http://localhost";
    RestAssured.port = port;
}
```

</details>

**7. Trong test sau, nếu API thực tế trả về trường `userName` thay vì `name`, điều gì xảy ra? Đây có phải bug của API không?**

```java
.then()
    .statusCode(200)
    .body("name", equalTo("An"));
```

<details className="qa">
<summary>Xem đáp án</summary>

- Test sẽ **fail**, nhưng **không nhất thiết** vì API có bug — rất có thể API hoàn toàn đúng (trả đúng dữ liệu, đúng ý định thiết kế), chỉ là **test viết sai tên trường JsonPath** (`"name"` thay vì `"userName"`).
- Đây là lỗi thường gặp: JsonPath không báo lỗi biên dịch khi viết sai tên trường (vì nó chỉ là một chuỗi `String`), mà chỉ phát hiện được lúc **chạy test** — nếu trường không tồn tại trong response, matcher `equalTo(...)` sẽ so sánh với giá trị `null`, khiến test fail với thông báo khó hiểu nếu không kiểm tra kỹ cấu trúc JSON thực tế của response trước khi viết assertion.
- Cách phòng tránh: luôn kiểm tra kỹ cấu trúc JSON thực tế (ví dụ gọi thử API bằng Postman/curl) trước khi viết JsonPath trong test, để tránh nhầm lẫn giữa "bug API" và "test viết sai".

</details>

**8. REST Assured phù hợp cho loại test nào trong Test Pyramid — unit test, integration test, hay E2E test? Giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

REST Assured chủ yếu phù hợp cho **integration test** (và có thể dùng cho một phần E2E test ở tầng API).

- Nó **gọi API thật qua HTTP**, nghĩa là cần một server đang thực sự chạy (dù là server thật hay server test được khởi động qua `@SpringBootTest(webEnvironment = RANDOM_PORT)`) — không phải cô lập hoàn toàn một class/method như unit test.
- Nó kiểm tra sự phối hợp giữa nhiều tầng thực sự của ứng dụng: tầng HTTP/Controller nhận request, tầng Service xử lý logic, có thể cả tầng Repository/Database phía sau — đúng bản chất của integration test là kiểm tra "nhiều thành phần ghép lại có hoạt động đúng không".
- Nó **không phù hợp** làm unit test vì tốc độ chậm hơn nhiều (phải khởi động server, gửi HTTP request thật) so với gọi trực tiếp một phương thức Java trong bộ nhớ.

</details>

**9. So sánh cách viết test dùng `@BeforeAll` để cấu hình `RestAssured.baseURI` một lần với việc gọi `.baseUri(...)` lặp lại trong từng test. Cách nào tốt hơn và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
@BeforeAll
static void setUp() {
    RestAssured.baseURI = "http://localhost:8080";
}

@Test
void layNguoiDungTonTai() {
    given()
    .when().get("/users/1")   // không cần lặp lại baseUri
    .then().statusCode(200);
}
```

- Đặt `RestAssured.baseURI` một lần trong `@BeforeAll` giúp **tránh lặp lại** cấu hình giống hệt nhau ở mọi test method — tuân theo nguyên tắc DRY (Don't Repeat Yourself), giảm khả năng gõ sai địa chỉ ở một vài test mà quên sửa những chỗ khác khi cần đổi (ví dụ đổi cổng, đổi domain).
- Cách này còn giúp dễ bảo trì hơn: chỉ cần sửa một chỗ duy nhất khi môi trường test thay đổi (ví dụ chuyển từ `localhost` sang một server staging), thay vì phải tìm và sửa `.baseUri(...)` ở từng test riêng lẻ.
- Nhược điểm nhỏ: cấu hình toàn cục (static) có thể gây nhầm lẫn nếu các test class khác nhau cần base URI khác nhau chạy song song trong cùng JVM — cần cẩn thận khi test chạy parallel.

</details>

**10. Trong CI/CD, một pipeline chạy test REST Assured nhưng báo lỗi "Connection refused" cho mọi test. Liệt kê các nguyên nhân khả dĩ và cách kiểm tra.**

<details className="qa">
<summary>Xem đáp án</summary>

"Connection refused" nghĩa là REST Assured **không thể kết nối** tới địa chỉ/cổng đã cấu hình — vì REST Assured gọi HTTP request thật, nó luôn cần một server đang thực sự lắng nghe ở đầu kia. Các nguyên nhân khả dĩ:

- **Server chưa khởi động xong** khi test bắt đầu chạy (race condition giữa việc khởi động ứng dụng và chạy test) — cần đảm bảo pipeline chờ đúng healthcheck của server trước khi chạy test, hoặc dùng `@SpringBootTest` để Spring tự khởi động server trong cùng tiến trình test.
- **Sai cổng/địa chỉ**: đặc biệt khi dùng `RANDOM_PORT`, nếu quên lấy cổng thực tế qua `@LocalServerPort` mà vẫn hard-code cổng cũ.
- **Firewall/network policy trong môi trường CI** chặn kết nối tới `localhost` hoặc cổng cụ thể (ít gặp nhưng có thể xảy ra với một số runner CI có cấu hình mạng đặc biệt).
- **Server crash ngay khi khởi động** (ví dụ lỗi cấu hình datasource) khiến server thực chất không hề chạy được, dù log tưởng như đã "start" — cần xem kỹ log khởi động của ứng dụng trong pipeline CI trước khi kết luận là lỗi test.

</details>

---

## 7. JMeter

Bài học: [7. JMeter](../../java/13-testing/7_jmeter.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JMeter khác gì so với JUnit/REST Assured về mục đích kiểm thử? Vì sao không thể dùng JMeter để thay thế hoàn toàn unit test hay integration test?**

<details className="qa">
<summary>Xem đáp án</summary>

- **JUnit/REST Assured** trả lời câu hỏi: **"code/API có chạy đúng logic không?"** — kiểm tra tính đúng đắn (correctness) của một hành vi cụ thể với một lượng request nhỏ, thường chỉ 1 request tại một thời điểm.
- **JMeter** trả lời câu hỏi hoàn toàn khác: **"hệ thống chịu tải đến đâu, phản hồi nhanh tới mức nào khi có nhiều người dùng cùng lúc?"** — tập trung vào hiệu năng (performance), không phải tính đúng đắn của logic nghiệp vụ.
- Hai loại test này **bổ sung** chứ không thay thế nhau: một API có thể trả đúng kết quả (unit/integration test pass) nhưng vẫn sập hoặc phản hồi chậm không chấp nhận được khi có 10.000 người dùng cùng lúc truy cập — chỉ performance test như JMeter mới phát hiện được vấn đề này.

</details>

**2. Nêu và giải thích ba chỉ số quan trọng nhất khi đo hiệu năng hệ thống bằng JMeter.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Response time (thời gian phản hồi)**: khoảng thời gian từ lúc gửi request tới lúc nhận được phản hồi đầy đủ. Đây là chỉ số người dùng cảm nhận trực tiếp — thời gian phản hồi càng thấp, trải nghiệm càng tốt.
- **Throughput (thông lượng)**: số lượng request hệ thống xử lý được trong một đơn vị thời gian (thường tính request/giây). Chỉ số này cho biết khả năng "gánh" tải của hệ thống.
- **Error rate (tỉ lệ lỗi)**: phần trăm request bị lỗi (timeout, mã lỗi 5xx, kết nối bị từ chối...) trong tổng số request gửi đi. Tỉ lệ lỗi tăng cao khi tải vượt quá khả năng xử lý là dấu hiệu hệ thống đang "gãy".
- Ba chỉ số này thường được xem xét **cùng nhau**: một hệ thống có throughput cao nhưng error rate cũng cao không phải là hệ thống tốt — nó chỉ đang "cố" xử lý nhiều request mà không đảm bảo chất lượng phản hồi.

</details>

**3. So sánh Load Test, Stress Test, Spike Test và Endurance (Soak) Test. Mỗi loại phù hợp trả lời câu hỏi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Cách thực hiện | Câu hỏi trả lời |
|---|---|---|
| **Load Test** | Tạo tải đúng bằng mức **dự kiến thực tế** (ví dụ 1000 người dùng đồng thời) | "Hệ thống có chạy ổn định ở mức tải bình thường không?" |
| **Stress Test** | Tăng tải **dần dần vượt quá** mức dự kiến cho tới khi hệ thống "gãy" | "Giới hạn chịu tải tối đa của hệ thống là bao nhiêu? Nó gãy như thế nào (từ từ hay sập đột ngột)?" |
| **Spike Test** | Tăng tải **đột ngột** trong thời gian ngắn rồi giảm về bình thường | "Hệ thống có xử lý được cú sốc tải bất ngờ không (ví dụ flash sale), và có phục hồi được sau đó không?" |
| **Endurance/Soak Test** | Giữ tải **vừa phải nhưng kéo dài** (vài giờ đến vài ngày) | "Hệ thống có vấn đề rò rỉ bộ nhớ (memory leak) hay suy giảm hiệu năng dần theo thời gian không?" |

</details>

**4. Trong Thread Group, giải thích ý nghĩa của "Number of Threads", "Ramp-up Period", và "Loop Count". Với cấu hình 200 threads, ramp-up 20 giây, loop count 3, tổng số lượt gọi request là bao nhiêu và tốc độ tăng người dùng ảo như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Number of Threads**: số **người dùng ảo** được mô phỏng — mỗi "thread" tương ứng với một người dùng độc lập gửi request.
- **Ramp-up Period**: khoảng thời gian (giây) để **khởi động dần** toàn bộ số luồng, tránh tạo cú sốc tải tức thời không thực tế.
- **Loop Count**: số lần **mỗi** người dùng ảo lặp lại toàn bộ kịch bản request của mình.

Với cấu hình **200 threads, ramp-up 20 giây, loop count 3**:

- Tốc độ tăng người dùng ảo: mỗi giây có thêm `200 / 20 = 10` người dùng ảo bắt đầu hoạt động, cho tới khi đủ 200 người sau 20 giây.
- Tổng số lượt gọi request: `200 × 3 = 600` lượt (giả sử mỗi vòng lặp gửi đúng 1 request; nếu kịch bản có nhiều sampler trong một vòng lặp thì nhân thêm số sampler đó).

</details>

**5. Vì sao khi chạy test tải thật (nhiều luồng, mô phỏng đông người dùng), tài liệu khuyến cáo nên chạy JMeter ở chế độ non-GUI (`jmeter -n -t ...`) thay vì chế độ giao diện đồ họa thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

- Chế độ **GUI** của JMeter phải liên tục **vẽ và cập nhật giao diện** để hiển thị tiến trình test theo thời gian thực — việc này tiêu tốn đáng kể CPU và bộ nhớ của chính máy đang chạy JMeter.
- Khi mô phỏng số lượng lớn người dùng ảo (hàng trăm, hàng nghìn thread), tài nguyên máy chạy JMeter bị **chia sẻ** giữa việc gửi request thật và việc vẽ giao diện — dẫn tới **kết quả đo bị sai lệch** (response time bị "phồng" lên do máy JMeter chính nó cũng đang quá tải bởi việc render GUI, không phản ánh đúng hiệu năng thực sự của hệ thống đích).
- Chế độ **non-GUI** (`jmeter -n -t test.jmx -l result.jtl -e -o report`) loại bỏ hoàn toàn overhead của giao diện, dành toàn bộ tài nguyên máy cho việc gửi request và đo lường, cho kết quả chính xác hơn nhiều — đây là cách chạy **bắt buộc** cho mọi bài test tải thật sự, GUI chỉ nên dùng để **thiết kế và gỡ lỗi** kịch bản test với số luồng nhỏ.

</details>

**6. Test sau có vấn đề gì khiến kết quả có thể bị hiểu sai là "100% request thành công" dù thực tế server đang trả về lỗi?**

```text
Cấu hình: Thread Group (100 threads) → HTTP Request Sampler (GET /api/orders)
          → Summary Report Listener
(Không có Assertion nào được thêm vào Sampler)
```

<details className="qa">
<summary>Xem đáp án</summary>

**Vấn đề**: kịch bản test **thiếu Assertion** (ví dụ Response Assertion) để kiểm tra **nội dung/mã trạng thái** thực sự của phản hồi.

- Mặc định, JMeter chỉ tính một request là "lỗi" khi xảy ra lỗi ở tầng **giao thức** (ví dụ không kết nối được, timeout, hoặc server trả về mã lỗi HTTP như `500`) — nhưng nếu server trả về **HTTP 200** kèm theo một **trang lỗi** (ví dụ trang thông báo lỗi HTML, hoặc JSON rỗng do một lỗi logic nội bộ) thay vì dữ liệu mong đợi, JMeter mặc định vẫn tính đó là request **"thành công"** vì về mặt giao thức HTTP nó nhận được phản hồi hợp lệ với mã 200.
- Kết quả: báo cáo Summary Report có thể hiển thị tỉ lệ lỗi là `0%`, tạo cảm giác an toàn giả, trong khi thực tế server đang trả về nội dung sai hoàn toàn.
- Cách khắc phục: thêm **Response Assertion** vào Sampler để kiểm tra nội dung phản hồi có chứa đúng dữ liệu mong đợi (hoặc không chứa từ khóa lỗi như "error", "exception"), giúp JMeter phân biệt chính xác giữa "phản hồi có nhận được" và "phản hồi đúng nội dung mong đợi".

</details>

**7. Vì sao không nên chạy JMeter và server đang được test trên cùng một máy vật lý khi thực hiện load test nghiêm túc?**

<details className="qa">
<summary>Xem đáp án</summary>

- Khi cả JMeter (đóng vai trò tạo tải) và server (đối tượng bị test) cùng chạy trên **một máy**, cả hai sẽ **tranh giành cùng một nguồn tài nguyên** (CPU, RAM, băng thông mạng nội bộ) — dẫn tới hai vấn đề:
  - **JMeter không đủ tài nguyên** để tạo đủ tải như cấu hình mong muốn (ví dụ không thể thực sự mô phỏng 1000 luồng đồng thời nếu CPU máy đã bị server chiếm dụng phần lớn).
  - **Server bị "đánh cắp" tài nguyên** bởi chính JMeter đang chạy cùng máy, khiến response time đo được **cao hơn thực tế** — không phản ánh đúng hiệu năng server sẽ có khi chạy độc lập trên hạ tầng production thật.
- Khuyến nghị: chạy JMeter (hoặc dùng JMeter ở chế độ **distributed testing** — nhiều máy JMeter "worker" phối hợp) trên một máy **tách biệt hoàn toàn** với máy chạy server đích, đảm bảo kết quả đo phản ánh đúng khả năng chịu tải thực sự của hệ thống.

</details>

**8. Aggregate Report trong JMeter cung cấp thông tin gì mà Summary Report không có? Vì sao chỉ nhìn "response time trung bình (average)" có thể đánh lừa khi đánh giá trải nghiệm người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Aggregate Report** bổ sung thêm các **phân vị (percentile)** như 90%, 95%, 99% — ví dụ "percentile 95% là 800ms" nghĩa là 95% số request có thời gian phản hồi **dưới hoặc bằng** 800ms.
- Chỉ nhìn **response time trung bình (average)** có thể đánh lừa vì trung bình dễ bị "kéo lệch" bởi một số ít request rất nhanh, che giấu việc có một tỉ lệ đáng kể request bị **chậm bất thường** (outlier). Ví dụ: average là 200ms nghe có vẻ tốt, nhưng nếu percentile 99% lại là 5000ms, nghĩa là **1% người dùng** (có thể là hàng nghìn người trong hệ thống lớn) đang trải nghiệm độ trễ rất tệ mà con số trung bình hoàn toàn không phản ánh được.
- Vì vậy, khi đánh giá trải nghiệm thực tế của **đa số** người dùng, các đội performance engineering thường ưu tiên nhìn vào **percentile cao (95%, 99%)** thay vì chỉ dựa vào con số trung bình.

</details>

**9. Trong một pipeline CI/CD, làm thế nào để JMeter được dùng để "tự động cảnh báo khi hiệu năng tụt sau mỗi lần deploy"? Mô tả ý tưởng ở mức khái niệm.**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng ở mức khái niệm:

1. **Chạy JMeter tự động** ở chế độ non-GUI (`jmeter -n -t test.jmx -l result.jtl`) ngay sau mỗi lần deploy lên môi trường staging/test, như một bước trong pipeline CI/CD.
2. **Thu thập kết quả** (response time, throughput, error rate) từ file `.jtl` sinh ra, thường qua một công cụ phân tích hoặc script tùy chỉnh để trích xuất các chỉ số quan trọng.
3. **So sánh với ngưỡng (threshold) đã định trước** — ví dụ "percentile 95% không được vượt quá 1 giây", hoặc so sánh với kết quả của lần chạy trước đó (baseline) để phát hiện **hiệu năng suy giảm tương đối** (ví dụ chậm hơn 20% so với trước).
4. Nếu vượt ngưỡng hoặc suy giảm đáng kể, pipeline **đánh dấu build fail** hoặc gửi cảnh báo cho đội phát triển, giúp phát hiện vấn đề hiệu năng **ngay khi vừa được đưa vào**, thay vì phát hiện muộn khi đã ảnh hưởng người dùng thật ở production.

</details>

**10. Vì sao đặt Ramp-up Period bằng 0 (khởi động tất cả luồng cùng lúc) thường không mô phỏng đúng tình huống thực tế, ngoại trừ khi đang cố tình thực hiện Spike Test?**

<details className="qa">
<summary>Xem đáp án</summary>

- Trong thực tế, người dùng **hiếm khi** truy cập một hệ thống theo kiểu "tất cả cùng bấm nút trong cùng một mili-giây" — lưu lượng người dùng thường **tăng dần** theo thời gian (ví dụ trong vài phút đầu giờ làm việc, lượng truy cập tăng từ từ chứ không nhảy vọt tức thì).
- Nếu đặt Ramp-up = 0, JMeter sẽ cố gắng khởi động **toàn bộ** số luồng cấu hình **ngay lập tức** — tạo ra một "cú sốc tải" (traffic spike) cực đoan mà bản thân máy chạy JMeter cũng phải chịu áp lực tạo ra hàng loạt kết nối cùng lúc, có thể khiến kết quả đo bị nhiễu bởi giới hạn của chính máy JMeter, chứ không phản ánh đúng hành vi tải tăng dần tự nhiên.
- Ramp-up = 0 chỉ **hợp lý và có chủ đích** khi bạn đang thực hiện **Spike Test** — vì mục tiêu của loại test này chính là mô phỏng một cú sốc tải đột ngột (ví dụ hàng chục nghìn người cùng vào trang bán vé đúng giờ mở bán) để kiểm tra khả năng chống chịu và phục hồi của hệ thống trước tình huống cực đoan đó.

</details>

---

## 8. Behavior Testing & Cucumber-JVM

Bài học: [8. Behavior Testing & Cucumber-JVM](../../java/13-testing/8_behavior-cucumber.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. BDD (Behavior-Driven Development) là gì? Nó khác gì so với TDD ở trọng tâm mô tả?**

<details className="qa">
<summary>Xem đáp án</summary>

**BDD** là cách phát triển phần mềm trong đó hành vi mong muốn của hệ thống được **mô tả bằng ngôn ngữ gần với tiếng tự nhiên** trước khi viết code, sao cho cả người không biết lập trình cũng đọc hiểu được.

- **TDD** tập trung vào **chi tiết kỹ thuật**: viết test cho một hàm/class cụ thể trước khi implement (ví dụ "test hàm `calculateDiscount` trả về đúng giá trị").
- **BDD** tập trung vào **hành vi nghiệp vụ**, diễn đạt theo góc nhìn người dùng/khách hàng (ví dụ "khi khách hàng VIP mua trên 1 triệu, được giảm 10%") — có thể xem là một dạng mở rộng của TDD, nhưng dịch chuyển trọng tâm từ "kiểm tra đúng kỹ thuật" sang "kiểm tra đúng ý định nghiệp vụ".

</details>

**2. Vì sao BDD được xem là giải pháp cho vấn đề giao tiếp giữa lập trình viên và người làm nghiệp vụ (business analyst, product owner)? Khái niệm "ubiquitous language" nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Trong một dự án, lập trình viên thường đọc/viết code, còn người nghiệp vụ đọc tài liệu yêu cầu — hai bên dùng **ngôn ngữ và góc nhìn khác nhau**, dễ dẫn tới hiểu sai ý nhau, khiến sản phẩm cuối cùng không đúng mong muốn thực sự.
- **Ubiquitous language** ("ngôn ngữ phổ quát" — thuật ngữ vay mượn từ Domain-Driven Design) là một bộ từ vựng/cách diễn đạt **chung**, được cả lập trình viên, tester, và người nghiệp vụ cùng hiểu và đồng thuận sử dụng.
- BDD hiện thực hóa ý tưởng này bằng cách viết kịch bản test theo ngôn ngữ Gherkin — một hình thức viết vừa đủ tự nhiên để người nghiệp vụ đọc hiểu, vừa đủ cấu trúc để công cụ (Cucumber) tự động chạy như một test thật, giúp ba bên **cùng xem, cùng duyệt và cùng đồng ý** trên một tài liệu duy nhất trước khi code được viết.

</details>

**3. Liệt kê các từ khóa chính của ngôn ngữ Gherkin và giải thích ý nghĩa từng từ. Cấu trúc Given-When-Then tương ứng với mô hình nào trong unit test?**

<details className="qa">
<summary>Xem đáp án</summary>

| Từ khóa | Ý nghĩa |
|---|---|
| `Feature` | Mô tả tính năng đang được kiểm thử |
| `Scenario` | Một tình huống/kịch bản cụ thể trong tính năng đó |
| `Given` | Trạng thái ban đầu / điều kiện tiên quyết |
| `When` | Hành động xảy ra |
| `Then` | Kết quả mong đợi sau hành động |
| `And` / `But` | Nối thêm bước cùng loại với bước trước đó, giúp câu văn tự nhiên hơn |

- Cấu trúc **Given-When-Then** tương ứng trực tiếp với mô hình **Arrange-Act-Assert (AAA)** của unit test: `Given` ≈ Arrange (chuẩn bị), `When` ≈ Act (hành động), `Then` ≈ Assert (kiểm tra kết quả) — chỉ khác là được diễn đạt bằng tiếng tự nhiên thay vì code.

</details>

**4. Feature file (`.feature`) có chứa code Java không? Vì sao thiết kế này lại quan trọng đối với mục tiêu của BDD?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Feature file chỉ chứa các câu Gherkin thuần túy bằng ngôn ngữ tự nhiên (`Feature`, `Scenario`, `Given`, `When`, `Then`...), hoàn toàn **không có bất kỳ dòng code Java nào**.

```gherkin
Scenario: Khách VIP mua trên 1 triệu được giảm 10%
    Given khách hàng là thành viên VIP
    And giỏ hàng có tổng tiền là 2000000 đồng
    When khách hàng tiến hành thanh toán
    Then tổng tiền sau giảm giá phải là 1800000 đồng
```

- Điều này quan trọng vì mục tiêu cốt lõi của BDD là để **người không biết lập trình** (business analyst, product owner, tester không code) cũng có thể **đọc, hiểu và xác nhận** kịch bản có đúng với mong muốn nghiệp vụ hay không — nếu feature file lẫn code Java vào, mục tiêu "ngôn ngữ chung dễ hiểu cho mọi người" sẽ bị phá vỡ.
- Toàn bộ phần "kỹ thuật" (gọi code thật, assertion) được tách riêng sang **Step Definition** — nơi lập trình viên viết code Java để nối mỗi câu Gherkin với hành động thực tế.

</details>

**5. Cho feature file và step definition sau, giải thích cơ chế Cucumber dùng để "khớp" (match) một câu Gherkin với đúng phương thức Java tương ứng.**

```gherkin
Given giỏ hàng có tổng tiền là 2000000 đồng
```

```java
@Given("giỏ hàng có tổng tiền là {long} đồng")
public void gioHangCoTongTien(long soTien) {
    gioHang.setTotal(soTien);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

- Cucumber so khớp câu Gherkin với **chuỗi mẫu (pattern)** được khai báo trong annotation `@Given(...)`, trong đó `{long}` là một **kiểu tham số (parameter type)** được Cucumber tự nhận diện: bất kỳ số nguyên nào xuất hiện đúng vị trí đó trong câu Gherkin sẽ được **tự động trích xuất** và truyền vào phương thức Java tương ứng dưới dạng tham số kiểu `long`.
- Với câu `"giỏ hàng có tổng tiền là 2000000 đồng"`, phần `{long}` khớp với `2000000`, nên Cucumber gọi `gioHangCoTongTien(2000000L)` — giá trị `2000000` được truyền vào tham số `soTien`.
- Cucumber còn hỗ trợ các kiểu tham số dựng sẵn khác như `{string}`, `{int}`, `{word}`, giúp việc trích xuất dữ liệu từ câu Gherkin sang tham số Java diễn ra tự động mà không cần tự viết logic parse chuỗi thủ công.

</details>

**6. Nếu một câu trong feature file không khớp chính xác với bất kỳ pattern nào đã khai báo trong Step Definition (ví dụ lệch một chữ), điều gì xảy ra khi chạy Cucumber?**

<details className="qa">
<summary>Xem đáp án</summary>

Cucumber sẽ báo bước đó là **"undefined step"** (bước chưa được định nghĩa) — nó **không tìm thấy** phương thức Java nào có pattern khớp chính xác với câu Gherkin đang xét.

- Kịch bản (`Scenario`) chứa bước đó thường được đánh dấu **không thực thi được** (thường hiển thị màu vàng/pending trong báo cáo, chứ không phải fail đỏ hay pass xanh), vì Cucumber không biết phải gọi hành động nào để thực hiện bước này.
- Đây là lý do lệch dù chỉ **một chữ, một dấu cách, hay sai kiểu tham số** giữa câu Gherkin và pattern trong `@Given`/`@When`/`@Then` cũng khiến việc khớp thất bại — Cucumber yêu cầu độ khớp khá chính xác giữa văn bản kịch bản và pattern khai báo trong code.
- Một số công cụ/IDE tích hợp Cucumber còn có thể **tự sinh gợi ý** khung code Step Definition còn thiếu, giúp lập trình viên nhanh chóng bổ sung.

</details>

**7. Đoạn Gherkin sau vi phạm nguyên tắc viết BDD tốt như thế nào? Viết lại theo đúng tinh thần BDD.**

```gherkin
Scenario: Tạo user
  Given gọi API POST /users với body { "name": "An", "email": "an@example.com" }
  When server xử lý request
  Then response trả về status code 201 và JSON có field "id" khác null
```

<details className="qa">
<summary>Xem đáp án</summary>

**Vấn đề**: kịch bản viết **quá thiên về kỹ thuật** (nhắc tới `POST`, đường dẫn API cụ thể, cấu trúc JSON, status code HTTP) — một người làm nghiệp vụ không rành kỹ thuật sẽ **khó hiểu** ý nghĩa thực sự của kịch bản này là gì về mặt nghiệp vụ, làm mất đi mục đích cốt lõi của BDD là tạo "ngôn ngữ chung dễ hiểu cho mọi người".

Viết lại theo đúng tinh thần BDD — mô tả bằng góc nhìn nghiệp vụ, ẩn chi tiết kỹ thuật:

```gherkin
Scenario: Đăng ký tài khoản người dùng mới thành công
  Given chưa có tài khoản nào với email "an@example.com"
  When khách hàng đăng ký tài khoản với tên "An" và email "an@example.com"
  Then hệ thống tạo tài khoản mới thành công
```

- Chi tiết kỹ thuật (gọi API nào, kiểm tra status code nào) được **ẩn bên trong Step Definition** — người đọc feature file chỉ cần quan tâm **"chuyện gì xảy ra về mặt nghiệp vụ"**, không cần biết đằng sau đó là một API POST hay logic nào khác.

</details>

**8. Vì sao BDD/Cucumber "không thay thế unit test cho từng hàm nhỏ"? Trong một dự án thực tế, nên áp dụng BDD cho loại kịch bản nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- BDD/Cucumber có **chi phí viết và bảo trì cao hơn** unit test thông thường: mỗi kịch bản cần cả feature file lẫn step definition tương ứng, và việc giữ chúng khớp chính xác với nhau đòi hỏi công sức bảo trì liên tục.
- Dùng Cucumber để test từng hàm nhỏ, chi tiết kỹ thuật thuần túy (ví dụ "hàm `add(2,3)` trả về `5`") là **lãng phí** — những trường hợp này không cần "ngôn ngữ chung với người nghiệp vụ" vì bản thân chúng không mang ý nghĩa nghiệp vụ trực tiếp mà người dùng cuối quan tâm.
- BDD phù hợp nhất cho các **luồng nghiệp vụ quan trọng, cần sự đồng thuận** giữa dev, tester và người nghiệp vụ — ví dụ luồng đăng ký tài khoản, luồng thanh toán, chính sách giảm giá, quy trình duyệt đơn hàng — nơi việc mô tả đúng **ý định nghiệp vụ** có giá trị cao hơn nhiều so với chi phí bảo trì thêm một tầng feature file.
- Chiến lược hợp lý: dùng **unit test** cho phần lớn logic chi tiết (nhanh, rẻ, nhiều), dùng **BDD/Cucumber** có chọn lọc cho những kịch bản nghiệp vụ cốt lõi cần giao tiếp rõ ràng với các bên không kỹ thuật.

</details>

**9. `glue` trong cấu hình Cucumber-JVM (`@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.example.steps")`) có tác dụng gì? Điều gì xảy ra nếu cấu hình sai package này?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`glue`** báo cho Cucumber biết **package nào chứa các Step Definition** (các class có phương thức đánh dấu `@Given`/`@When`/`@Then`) — Cucumber cần biết vị trí này để **quét (scan)** và tìm đúng các phương thức cần gọi khi đọc feature file.
- Nếu cấu hình **sai** package (ví dụ trỏ tới `com.example.step` thay vì `com.example.steps`, thiếu chữ "s"), Cucumber sẽ **không tìm thấy bất kỳ Step Definition nào** trong package đó — mọi câu Gherkin trong feature file sẽ bị báo là **"undefined step"**, dù thực chất code Step Definition vẫn tồn tại đúng chỗ, chỉ là Cucumber không được chỉ đường tới đó.
- Đây là lỗi cấu hình phổ biến khi mới thiết lập Cucumber, dễ khiến lập trình viên tưởng nhầm là mình viết sai step definition trong khi thực chất chỉ là đường dẫn `glue` bị sai.

</details>

**10. Tình huống: một `Scenario` trong feature file dùng lại kết quả từ `Scenario` chạy ngay trước đó (ví dụ Scenario 2 giả định giỏ hàng vẫn còn dữ liệu từ Scenario 1). Đây có phải cách viết tốt không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không phải cách viết tốt.** Mỗi `Scenario` trong Cucumber nên được thiết kế **độc lập hoàn toàn** với các `Scenario` khác — tự thiết lập đầy đủ dữ liệu/điều kiện nó cần ngay trong các bước `Given` của chính nó, không giả định hay phụ thuộc vào trạng thái để lại từ scenario chạy trước.

- Vi phạm tính độc lập gây ra các vấn đề tương tự như trong unit test: nếu `Scenario 1` bị sửa đổi, xóa, hoặc chạy fail giữa chừng, `Scenario 2` phụ thuộc vào nó sẽ **cho kết quả sai lệch hoặc lỗi khó hiểu**, dù bản thân logic của `Scenario 2` hoàn toàn đúng.
- Cucumber cũng **không đảm bảo thứ tự chạy scenario cố định** trong mọi trường hợp (tùy cấu hình, có thể chạy song song hoặc random để tăng tốc), nên việc phụ thuộc thứ tự là một giả định không an toàn.
- Cách viết đúng: mỗi `Scenario` tự khai báo đầy đủ bước `Given` cần thiết (ví dụ tự tạo lại khách hàng, tự thiết lập lại giỏ hàng), dù có thể trông "lặp lại" so với scenario khác — sự lặp lại này là cái giá chấp nhận được để đổi lấy tính độc lập và độ tin cậy của bộ test.

</details>
