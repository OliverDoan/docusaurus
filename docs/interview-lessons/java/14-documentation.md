---
sidebar_position: 14
title: "14. Tài liệu (Javadoc)"
---

# 14. Tài liệu (Javadoc)

## 1. Javadoc

Bài học: [1. Javadoc](../../java/14-documentation/1_javadoc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Javadoc là gì? Nó đọc loại comment nào trong ba loại comment của Java?**

<details className="qa">
<summary>Xem đáp án</summary>

**Javadoc** là công cụ đi kèm JDK, đọc comment đặc biệt trong mã nguồn `.java` và sinh ra tài liệu HTML mô tả class, method, tham số.

Java có 3 loại comment nhưng Javadoc **chỉ đọc loại thứ ba**:

```java
// Comment một dòng — KHÔNG phải Javadoc

/* Comment nhiều dòng — KHÔNG phải Javadoc */

/**
 * Comment Javadoc — mở bằng /** (hai dấu sao), đây mới được Javadoc đọc.
 */
```

Điều kiện thứ hai: comment phải đặt **ngay sát phía trên** phần tử được mô tả (class, method, field), không có dòng trống hay lệnh nào xen giữa.

</details>

**2. Một khối Javadoc gồm những phần nào? Vai trò của câu đầu tiên trong phần mô tả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Một khối Javadoc gồm 2 phần:

1. **Phần mô tả** (description) — câu văn giải thích "thứ này làm gì", có thể nhiều dòng.
2. **Phần block tag** — các dòng bắt đầu bằng `@` (như `@param`, `@return`), đứng sau phần mô tả.

```java
/**
 * Tính tổng hai số nguyên.      <- mô tả, câu đầu = tóm tắt
 *
 * @param a số hạng thứ nhất     <- block tag
 * @param b số hạng thứ hai
 * @return tổng của a và b
 */
public int cong(int a, int b) { return a + b; }
```

**Câu đầu tiên** (kết thúc bằng dấu chấm) được xem là **tóm tắt (summary)**, hiển thị trong bảng danh sách method của trang HTML — nên phải viết ngắn gọn, rõ nghĩa.

</details>

**3. Liệt kê ít nhất 5 block tag thường dùng và cho biết mỗi tag đặt ở đâu, mô tả gì.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tag | Ý nghĩa | Đặt ở đâu |
|---|---|---|
| `@param` | Mô tả một tham số | Method, constructor |
| `@return` | Mô tả giá trị trả về | Method có kiểu trả về khác `void` |
| `@throws` | Mô tả exception có thể ném ra | Method |
| `@author` | Tên tác giả | Class, interface |
| `@since` | Tính năng có từ phiên bản nào | Class, method |
| `@deprecated` | Đánh dấu đã lỗi thời | Class, method |
| `@see` | Liên kết tham khảo | Bất kỳ |

Quy tắc: mỗi tham số một `@param` riêng, viết theo đúng thứ tự khai báo; method có trả về (khác `void`) nên luôn có `@return`.

</details>

**4. Phân biệt hai inline tag `{@code}` và `{@link}`. Vì sao không nên viết trực tiếp `List<String>` trong mô tả Javadoc mà nên bọc trong `{@code}`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`{@link ...}`** — tạo **liên kết bấm được** tới class/method khác trong tài liệu HTML.
- **`{@code ...}`** — hiển thị văn bản theo **kiểu mã nguồn** (font đều, giữ nguyên ký tự đặc biệt).

```java
/**
 * {@code null} nếu rỗng. Dùng {@link #add(Object)} để thêm phần tử.
 */
```

Vì Javadoc sinh ra tài liệu **HTML**, nên các ký tự `<` và `>` viết trực tiếp (ví dụ `List<String>`) sẽ bị trình duyệt hiểu nhầm là **thẻ HTML** và không hiển thị đúng, thậm chí làm hỏng cấu trúc trang. Bọc trong `{@code List<String>}` hoặc viết thực thể HTML `&lt;`, `&gt;` mới an toàn.

</details>

**5. Đọc tình huống: một lập trình viên viết comment Javadoc nhưng để một dòng trống giữa comment và khai báo method bên dưới. Javadoc có gắn nội dung đó cho method không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Javadoc yêu cầu comment phải nằm **ngay sát phía trên** phần tử nó mô tả — không được có dòng trống hay câu lệnh khác (kể cả annotation đặt sai thứ tự) xen vào giữa.

```java
/**
 * Mô tả này sẽ KHÔNG gắn được cho method bên dưới vì có dòng trống.
 */

public void chao() { }
```

Kết quả: khi sinh tài liệu, method `chao()` sẽ hiện ra **không có mô tả gì**, đoạn Javadoc phía trên bị bỏ qua hoàn toàn (không có cảnh báo rõ ràng, nên đây là lỗi dễ bị bỏ sót khi review).

</details>

**6. Lệnh `javadoc` dùng để sinh tài liệu HTML như thế nào? Nêu ý nghĩa các option `-d`, `-author`, `-private`.**

<details className="qa">
<summary>Xem đáp án</summary>

```bash
javadoc -d docs -author -private com/example/calc/*.java
```

- **`-d <thư-mục>`** — nơi lưu file HTML sinh ra (`d` = *directory*).
- **`-author`** — đưa thông tin `@author` vào tài liệu (mặc định bị ẩn).
- **`-version`** — đưa thông tin `@version` vào tài liệu (mặc định bị ẩn).
- **`-private`** — tài liệu hóa cả thành phần `private` (mặc định `javadoc` chỉ lấy `public` và `protected`).

Sau khi chạy, mở `index.html` trong thư mục `docs` bằng trình duyệt để xem kết quả, giống hệt định dạng tài liệu API chính thức của Java.

</details>

**7. `@deprecated` (trong comment Javadoc) khác gì với annotation `@Deprecated`? Vì sao nên dùng cả hai cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`@deprecated`** (tag trong Javadoc, chữ thường) — chỉ có tác dụng **tài liệu**: ghi chú lý do lỗi thời và gợi ý thay thế, hiển thị trong trang HTML sinh ra.
- **`@Deprecated`** (annotation Java, chữ hoa `D`, đặt trên khai báo) — có tác dụng **với trình biên dịch**: IDE gạch ngang tên method, `javac` cảnh báo (warning) tại nơi gọi.

```java
/**
 * @deprecated Hãy dùng {@link #chao(String)} thay cho phương thức này.
 */
@Deprecated
public void chaoCu() { ... }
```

Nên dùng **cả hai cùng lúc**: `@Deprecated` cảnh báo compile-time cho người dùng API, còn `@deprecated` giải thích rõ lý do và hướng thay thế — thiếu một trong hai đều làm tài liệu/cảnh báo không đầy đủ.

</details>

**8. Trong CI/CD, làm sao phát hiện sớm việc thiếu `@param`, `@return` hoặc Javadoc sai cú pháp trước khi merge code?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng cờ **`-Xdoclint`** của công cụ `javadoc` (hoặc cấu hình tương đương trong plugin Maven/Gradle) để bật kiểm tra nghiêm ngặt cú pháp và tính đầy đủ của Javadoc, biến các vấn đề thành **lỗi/cảnh báo build**:

```bash
javadoc -Xdoclint:all -d docs *.java
```

Các vấn đề `-Xdoclint` phát hiện: thiếu `@return` cho method có trả về, `@param` sai tên hoặc thiếu tham số, dùng `<`/`>` trực tiếp gây lỗi HTML, thẻ HTML không đóng đúng...

Thực hành phổ biến: thêm bước chạy `javadoc -Xdoclint:all` (hoặc mục tiêu tương ứng của Maven `maven-javadoc-plugin`) vào pipeline CI, cấu hình fail build nếu có warning, để đảm bảo tài liệu API luôn đầy đủ trước khi merge.

</details>

**9. Nêu ít nhất 3 lỗi thường gặp khi viết Javadoc có thể khiến tài liệu sinh ra sai hoặc thiếu thông tin.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Dùng `/*` thay vì `/**`** — comment bị Javadoc bỏ qua hoàn toàn.
- **Đặt comment sai vị trí** (có dòng trống hoặc lệnh xen giữa) — Javadoc không gắn được cho phần tử bên dưới.
- **`@param` sai tên hoặc thiếu tham số** — Javadoc báo cảnh báo, tài liệu thiếu mô tả tham số đó.
- **Quên `@return`** cho method có trả về — người đọc không biết method trả về gì.
- **Viết `<`, `>` trực tiếp** trong mô tả — bị hiểu nhầm là thẻ HTML, hiển thị sai hoặc mất nội dung.
- **Câu tóm tắt quá dài hoặc thiếu dấu chấm** — bảng danh sách method trong tài liệu hiển thị lộn xộn.

</details>

**10. Tình huống thiết kế: bạn maintain một thư viện Java dùng chung cho nhiều team. Hãy nêu các nguyên tắc viết Javadoc để tài liệu thực sự hữu ích cho người dùng thư viện.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Mọi API `public`/`protected` phải có Javadoc** — đây là "hợp đồng" (contract) duy nhất người dùng thư viện nhìn thấy, không phải source code.
- **Câu tóm tắt đầu tiên phải đủ nghĩa và ngắn gọn**, vì nó hiện trong bảng tổng quan.
- **Đầy đủ `@param`, `@return`, `@throws`** cho mọi trường hợp ngoại lệ quan trọng — người dùng cần biết method có thể ném lỗi gì mà không phải đọc source.
- **Dùng `@since`** để đánh dấu phiên bản giới thiệu tính năng, giúp người dùng biết tính tương thích ngược.
- **Dùng `@deprecated` kèm `{@link}`** trỏ tới API thay thế mỗi khi lỗi thời một method, không xóa đột ngột gây vỡ code người dùng.
- **Bật `-Xdoclint` trong CI** để bắt lỗi thiếu tag ngay khi review, tránh phát hành thư viện với tài liệu không đầy đủ.
- **Mô tả "cái gì" chứ không phải "làm thế nào"** — người dùng thư viện quan tâm hành vi và hợp đồng, không cần biết chi tiết cài đặt bên trong.

</details>
