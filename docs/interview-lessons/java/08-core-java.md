---
sidebar_position: 8
title: "8. Core Java"
---

# 8. Core Java

## 1. Biểu thức chính quy (Regular Expressions)

Bài học: [1. Biểu thức chính quy (Regular Expressions)](../../java/08-core-java/1_regular-expressions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Pattern` và `Matcher` mỗi lớp đảm nhận vai trò gì? Vì sao Java tách thành hai lớp riêng thay vì gộp chung?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`Pattern`**: đại diện cho khuôn mẫu regex đã được **biên dịch (compile)** — quá trình phân tích cú pháp regex thành cấu trúc nội bộ tối ưu để so khớp nhanh. Tạo bằng `Pattern.compile(regex)`.
- **`Matcher`**: gắn một `Pattern` đã biên dịch với một chuỗi **cụ thể** cần kiểm tra, cung cấp các thao tác `matches()`, `find()`, `group()`.
- Tách riêng để **tái sử dụng** `Pattern` (chi phí compile chỉ trả một lần) cho nhiều chuỗi khác nhau, mà không phải biên dịch lại regex mỗi lần so khớp — quan trọng khi so khớp hàng nghìn chuỗi với cùng một mẫu (ví dụ lọc log).

```java
Pattern pattern = Pattern.compile("\\d+"); // compile 1 lần
for (String dong : danhSachDong) {
    Matcher matcher = pattern.matcher(dong); // tái sử dụng pattern
    if (matcher.find()) { /* ... */ }
}
```

</details>

**2. So sánh `matches()`, `find()` và `lookingAt()` của `Matcher`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Phương thức | Yêu cầu khớp |
|---|---|
| `matches()` | Toàn bộ chuỗi phải khớp từ đầu đến cuối |
| `lookingAt()` | Chỉ cần khớp từ **đầu chuỗi** trở đi (không cần hết chuỗi) |
| `find()` | Khớp **bất kỳ đoạn nào** trong chuỗi, có thể gọi lặp lại để tìm các lần khớp tiếp theo |

```java
Matcher m = Pattern.compile("\\d+").matcher("123abc");
System.out.println(m.matches());    // false — "abc" phía sau không phải số
System.out.println(m.lookingAt());  // true  — "123" ở đầu khớp, không cần hết chuỗi
System.out.println(m.find());       // true  — tìm thấy "123" ở đâu đó trong chuỗi
```

`lookingAt()` ít gặp hơn hai phương thức còn lại nhưng vẫn hay bị hỏi để kiểm tra hiểu rõ khác biệt với `matches()`.

</details>

**3. Vì sao nên `Pattern.compile()` một lần rồi tái sử dụng, thay vì gọi `String.matches(regex)` lặp lại trong vòng lặp lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

`String.matches(regex)` thực chất gọi `Pattern.compile(regex).matcher(this).matches()` bên trong — nghĩa là **biên dịch lại regex từ đầu mỗi lần gọi**. Việc biên dịch (phân tích cú pháp regex, dựng máy trạng thái so khớp) tốn chi phí đáng kể so với việc so khớp thực tế.

```java
// CHẬM: compile lại regex ở MỖI vòng lặp
for (String dong : trieuDong) {
    if (dong.matches("\\d{3}-\\d{4}")) { /* ... */ }
}

// NHANH: compile một lần, tái sử dụng Pattern cho mọi vòng lặp
Pattern pattern = Pattern.compile("\\d{3}-\\d{4}");
for (String dong : trieuDong) {
    if (pattern.matcher(dong).matches()) { /* ... */ }
}
```

Với vòng lặp nhỏ vài chục lần thì khác biệt không đáng kể, nhưng với hàng nghìn/triệu lần lặp (xử lý log, validate dữ liệu hàng loạt) thì việc tái sử dụng `Pattern` giúp tiết kiệm đáng kể thời gian.

</details>

**4. Output của đoạn code sau là gì? Giải thích khác biệt giữa quantifier "tham lam" (greedy) và "lười" (reluctant).**

```java
String html = "<b>Java</b> va <i>Kotlin</i>";
Matcher greedy = Pattern.compile("<.+>").matcher(html);
Matcher lazy = Pattern.compile("<.+?>").matcher(html);

greedy.find();
System.out.println(greedy.group());

lazy.find();
System.out.println(lazy.group());
```

<details className="qa">
<summary>Xem đáp án</summary>

Output:
```text
<b>Java</b> va <i>Kotlin</i>
<b>
```

- `<.+>` là quantifier **tham lam (greedy)** — mặc định `+` cố gắng khớp **nhiều nhất có thể**, rồi chỉ lùi lại (backtrack) khi cần để toàn bộ pattern khớp được. Vì vậy nó "nuốt" từ `<` đầu tiên cho tới `>` **cuối cùng** trong cả chuỗi.
- `<.+?>` thêm dấu `?` sau `+` biến nó thành **lười (reluctant/lazy)** — khớp **ít nhất có thể**, chỉ mở rộng thêm khi bắt buộc. Vì vậy nó dừng lại ở `>` **gần nhất**, cho ra `<b>`.
- Cạm bẫy kinh điển khi parse thẻ HTML/XML bằng regex: quên `?` sẽ vô tình khớp tham lam qua nhiều thẻ, cắt sai vị trí.

</details>

**5. Capturing group là gì? `group()` (hay `group(0)`) khác gì `group(1)`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Capturing group** (nhóm bắt) là phần regex đặt trong dấu ngoặc đơn `()`, dùng để **tách riêng** một phần của chuỗi vừa khớp ra để lấy lại sau này.

```java
Pattern pattern = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})"); // yyyy-MM-dd
Matcher matcher = pattern.matcher("Ngày sinh: 2026-09-28");

if (matcher.find()) {
    System.out.println(matcher.group());  // "2026-09-28" — toàn bộ đoạn khớp (= group(0))
    System.out.println(matcher.group(1)); // "2026" — nhóm thứ 1 (năm)
    System.out.println(matcher.group(2)); // "09"   — nhóm thứ 2 (tháng)
    System.out.println(matcher.group(3)); // "28"   — nhóm thứ 3 (ngày)
}
```

- `group()` không tham số (tương đương `group(0)`) luôn trả về **toàn bộ đoạn văn bản** mà pattern vừa khớp được, kể cả phần nằm ngoài mọi nhóm con.
- `group(n)` với `n >= 1` trả về đúng nội dung của nhóm bắt thứ `n` (đếm từ 1, theo thứ tự dấu `(` mở đầu xuất hiện).

</details>

**6. Named capturing group (Java 7+) là gì? Viết ví dụ dùng nó để parse ngày tháng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Named capturing group** cho phép đặt **tên** cho một nhóm thay vì chỉ nhớ chỉ số, giúp code dễ đọc hơn khi có nhiều nhóm. Cú pháp: `(?<tenNhom>...)`, lấy giá trị bằng `matcher.group("tenNhom")`.

```java
Pattern pattern = Pattern.compile("(?<nam>\\d{4})-(?<thang>\\d{2})-(?<ngay>\\d{2})");
Matcher matcher = pattern.matcher("2026-09-28");

if (matcher.matches()) {
    System.out.println("Năm: " + matcher.group("nam"));
    System.out.println("Tháng: " + matcher.group("thang"));
    System.out.println("Ngày: " + matcher.group("ngay"));
}
```

Ưu điểm: nếu sau này thêm/bớt nhóm ở giữa pattern, code lấy giá trị theo tên vẫn đúng, không bị lệch chỉ số như `group(1)`, `group(2)`.

</details>

**7. Output của đoạn code sau là gì? Vì sao?**

```java
String[] parts = "a,,b,".split(",");
System.out.println(parts.length);
for (String p : parts) {
    System.out.println("[" + p + "]");
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Output:
```text
3
[a]
[]
[b]
```

- `split(regex)` mặc định (giới hạn `limit = 0`) **loại bỏ mọi chuỗi rỗng ở cuối** kết quả, nhưng vẫn **giữ lại chuỗi rỗng ở giữa**.
- Chuỗi `"a,,b,"` bị tách bởi dấu phẩy thành `["a", "", "b", ""]` về mặt logic, nhưng phần tử rỗng cuối cùng (do dấu phẩy cuối chuỗi) bị cắt bỏ, còn lại `["a", "", "b"]` — độ dài 3.
- Muốn **giữ nguyên** cả chuỗi rỗng ở cuối, phải truyền `limit` âm: `"a,,b,".split(",", -1)` sẽ cho `["a", "", "b", ""]` (độ dài 4). Đây là cạm bẫy hay bị hỏi vì nhiều người tưởng `split` luôn giữ nguyên số phần tử tương ứng số dấu phân cách.

</details>

**8. `replaceAll()` với backreference (`$1`, `$2`...) dùng để làm gì? Viết ví dụ đổi định dạng ngày `"2026-09-28"` thành `"28/09/2026"`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Backreference** trong chuỗi thay thế của `replaceAll()` cho phép **chèn lại nội dung của capturing group** đã khớp được, thay vì chỉ thay bằng một chuỗi cố định.

```java
String ngay = "2026-09-28";
String ketQua = ngay.replaceAll("(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1");
System.out.println(ketQua); // "28/09/2026"
```

- `$1`, `$2`, `$3` tương ứng nội dung của nhóm 1 (năm), nhóm 2 (tháng), nhóm 3 (ngày) đã khớp.
- Ứng dụng thực tế: chuẩn hoá định dạng ngày tháng, đổi thứ tự tham số trong log, ẩn một phần thông tin nhạy cảm (ví dụ giữ lại 4 số cuối số thẻ, thay phần đầu bằng `*`).

</details>

**9. "Catastrophic backtracking" trong regex là gì? Cho ví dụ một pattern nguy hiểm.**

<details className="qa">
<summary>Xem đáp án</summary>

**Catastrophic backtracking** (bùng nổ quay lui) xảy ra khi regex có các nhóm lặp **lồng nhau và chồng lấn khả năng khớp** (ví dụ `(a+)+`), khiến bộ máy so khớp phải thử **số lượng tổ hợp tăng theo cấp số mũ** khi chuỗi đầu vào **không khớp** — làm chương trình bị treo (trông giống vô hạn vòng lặp), dù CPU thực ra đang chạy full nhưng cực kỳ chậm.

```java
// Pattern nguy hiểm: (a+)+ có thể khớp "aaaa" theo rất nhiều cách khác nhau
Pattern nguyHiem = Pattern.compile("(a+)+b");

// Chuỗi càng dài mà KHÔNG kết thúc bằng "b" thì thời gian chạy tăng theo cấp số mũ
String input = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaac";
nguyHiem.matcher(input).matches(); // có thể treo chương trình nhiều giây/phút
```

Đây còn gọi là lỗ hổng bảo mật **ReDoS (Regular Expression Denial of Service)** nếu regex nhận input trực tiếp từ người dùng. Cách phòng tránh: tránh nhóm lặp lồng nhau không cần thiết, đặt giới hạn thời gian chạy (timeout) khi validate input từ bên ngoài, hoặc dùng thư viện regex có bảo vệ khỏi backtracking bùng nổ.

</details>

**10. Regex đơn giản như `EMAIL_REGEX` trong bài có đủ để validate email trong ứng dụng thực tế không? Nêu hướng xử lý tốt hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không hoàn toàn đủ.** Chuẩn địa chỉ email đầy đủ (RFC 5322) phức tạp hơn rất nhiều so với một regex ngắn gọn — có những email hợp lệ theo RFC nhưng bị regex đơn giản từ chối, và ngược lại một chuỗi khớp regex chưa chắc là địa chỉ email **thực sự tồn tại và nhận được thư**.

Hướng xử lý thực tế trong ứng dụng:
- Dùng regex đơn giản (như trong bài) chỉ để **lọc lỗi rõ ràng** ở tầng giao diện (thiếu `@`, thiếu đuôi domain...), không cố "bắt đúng 100%" theo RFC.
- **Xác thực thật sự** bằng cách gửi email chứa liên kết/mã xác nhận (confirmation link/OTP) — chỉ khi người dùng bấm vào hoặc nhập đúng mã mới coi là email hợp lệ và thuộc quyền sở hữu của họ.
- Với dự án Spring Boot, có thể dùng `@Email` của Bean Validation cho việc kiểm tra định dạng cơ bản, kết hợp với bước xác nhận qua email ở trên cho việc xác thực thực sự.

Đây là câu hỏi hay dùng để kiểm tra tư duy thực tế: biết regex có giới hạn, không tin tưởng mù quáng vào một pattern để giải quyết trọn vẹn bài toán validate.

</details>

---

## 2. Thao tác I/O (Input/Output)

Bài học: [2. Thao tác I/O (Input/Output)](../../java/08-core-java/2_io-operations.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi nào dùng `InputStream`/`OutputStream`, khi nào dùng `Reader`/`Writer`? Vì sao Java tách riêng hai nhóm này?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`InputStream`/`OutputStream`** (luồng byte): làm việc với dữ liệu **nhị phân thô** — ảnh, video, file nén, mọi loại file không phải văn bản thuần.
- **`Reader`/`Writer`** (luồng ký tự): làm việc với **văn bản**, hiểu bảng mã (encoding) như UTF-8 để ghép đúng byte thành ký tự — quan trọng với tiếng Việt có dấu.
- Lý do tách riêng: byte thô và ký tự văn bản có bản chất khác nhau. Một ký tự tiếng Việt (ví dụ `"á"`) có thể chiếm nhiều byte tuỳ encoding; nếu xử lý văn bản bằng luồng byte mà không quan tâm encoding, dễ bị lỗi hiển thị sai dấu (hay gặp gọi là lỗi "font chữ").

</details>

**2. Vì sao nên bọc `BufferedReader` ra ngoài `FileReader` thay vì đọc trực tiếp bằng `FileReader.read()`?**

<details className="qa">
<summary>Xem đáp án</summary>

`FileReader.read()` (không qua buffer) đọc **từng ký tự một**, mỗi lần gọi có thể phát sinh một lời gọi hệ thống (system call) xuống ổ đĩa — rất chậm khi đọc file có hàng nghìn/triệu ký tự.

`BufferedReader` (bộ đọc có vùng đệm) đọc một **khối lớn** dữ liệu vào bộ nhớ đệm trong một lần, sau đó phục vụ các lời gọi `read()`/`readLine()` tiếp theo trực tiếp từ bộ nhớ đệm đó — giảm số lần truy cập ổ đĩa xuống rất nhiều. Nó còn cung cấp `readLine()` tiện lợi để đọc theo từng dòng, thứ `FileReader` thuần không có.

```java
// Chậm: mỗi ký tự một lần đọc từ ổ đĩa
FileReader reader = new FileReader("data.txt");

// Nhanh: đọc theo khối lớn, phục vụ từ bộ nhớ đệm
BufferedReader buffered = new BufferedReader(new FileReader("data.txt"));
```

</details>

**3. `try-with-resources` khai báo nhiều tài nguyên cùng lúc thì chúng được đóng theo thứ tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Các tài nguyên được đóng theo thứ tự **ngược lại** với thứ tự khai báo — tài nguyên khai báo **sau cùng** sẽ được đóng **trước tiên**.

```java
try (FileInputStream in = new FileInputStream("a.txt");
     BufferedInputStream buffered = new BufferedInputStream(in)) {
    // ...
}
// Thứ tự đóng: buffered.close() chạy TRƯỚC, rồi mới tới in.close()
```

Điều này hợp lý vì tài nguyên khai báo sau thường **bọc quanh** hoặc **phụ thuộc vào** tài nguyên khai báo trước (ví dụ `buffered` bọc `in`), nên phải đóng lớp ngoài trước khi đóng lớp trong.

</details>

**4. Output/hành vi của đoạn code sau có gì bất thường? Vì sao?**

```java
Scanner scanner = new Scanner(System.in);
System.out.print("Nhập tuổi: ");
int tuoi = scanner.nextInt();

System.out.print("Nhập tên: ");
String ten = scanner.nextLine();

System.out.println("Tên: [" + ten + "], tuổi: " + tuoi);
```

<details className="qa">
<summary>Xem đáp án</summary>

Nếu người dùng gõ `25` rồi Enter, sau đó gõ `Nam` rồi Enter, kết quả in ra sẽ là **`Tên: [], tuổi: 25`** — biến `ten` bị **rỗng**, dòng nhập tên bị "nuốt mất".

- `nextInt()` chỉ đọc phần **số**, không đọc luôn ký tự **xuống dòng** (`\n`) mà người dùng gõ sau số đó — ký tự xuống dòng này vẫn còn nằm trong bộ đệm nhập.
- `nextLine()` gọi ngay sau đó sẽ đọc luôn **phần còn sót lại** (chỉ có `\n`), coi như "dòng rỗng", rồi trả về ngay lập tức mà không chờ người dùng gõ tiếp.
- Cách khắc phục phổ biến: gọi thêm một `scanner.nextLine()` "dọn rác" ngay sau `nextInt()`, hoặc đọc mọi thứ bằng `nextLine()` rồi tự `Integer.parseInt(...)` khi cần số.

</details>

**5. Vì sao `Reader.read()`/`InputStream.read()` trả về kiểu `int` thay vì `char`/`byte`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì cần một giá trị đặc biệt để báo hiệu **đã hết dữ liệu (end-of-file)**, và giá trị đó là `-1`.

- `byte` có phạm vi `-128` đến `127` (256 giá trị), `char` có phạm vi `0` đến `65535` — cả hai đều **đã dùng hết dải giá trị hợp lệ** để biểu diễn dữ liệu thật, không còn chỗ trống để làm tín hiệu "hết file" mà không gây nhập nhằng.
- `int` có phạm vi lớn hơn nhiều, nên `-1` là một giá trị **không thể nhầm lẫn** với bất kỳ byte hay ký tự hợp lệ nào (0–255 cho byte không dấu, 0–65535 cho char).

```java
int kyTu;
while ((kyTu = reader.read()) != -1) { // -1 nghĩa là hết file, không phải một ký tự thật
    System.out.print((char) kyTu); // ép về char khi biết chắc không phải -1
}
```

</details>

**6. Điều gì xảy ra nếu phương thức `close()` của một tài nguyên trong `try-with-resources` tự nó ném ngoại lệ, trong khi thân khối `try` cũng đã ném một ngoại lệ khác trước đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Java sẽ **ưu tiên ném ra ngoại lệ gốc** (xảy ra trong thân `try`), còn ngoại lệ do `close()` ném ra sẽ bị gắn vào ngoại lệ gốc dưới dạng **suppressed exception** (ngoại lệ bị ẩn), có thể xem lại bằng `getSuppressed()`.

```java
try (AutoCloseable r = () -> { throw new RuntimeException("Lỗi khi đóng"); }) {
    throw new IllegalStateException("Lỗi chính trong try");
} catch (Exception e) {
    System.out.println(e.getMessage());           // "Lỗi chính trong try"
    for (Throwable suppressed : e.getSuppressed()) {
        System.out.println("Bị ẩn: " + suppressed.getMessage()); // "Lỗi khi đóng"
    }
}
```

Đây là cải tiến so với `try-finally` viết tay thời trước Java 7, nơi ngoại lệ trong `finally` sẽ **ghi đè hoàn toàn** và làm mất dấu vết ngoại lệ gốc quan trọng hơn.

</details>

**7. So sánh `java.io` (I/O truyền thống) và `java.nio`/`java.nio.file` (NIO). Nêu ít nhất hai khác biệt chính.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `java.io` | `java.nio` / `java.nio.file` |
|---|---|---|
| Mô hình | **Stream-based**, blocking (chờ) theo từng byte/ký tự | **Buffer & Channel**, có thể non-blocking |
| API file | `File` (thao tác yếu, trả `false` khi lỗi) | `Path`/`Files` (Java 7+, ném exception rõ ràng, nhiều tiện ích hơn) |
| Hiệu năng I/O lớn | Đọc/ghi tuần tự qua stream | `Channel` + `ByteBuffer` cho phép đọc/ghi khối lớn hiệu quả hơn, hỗ trợ memory-mapped file |
| Selector | Không có | `Selector` (Java NIO) cho phép một luồng theo dõi nhiều kênh mạng cùng lúc — nền tảng cho server hiệu năng cao |

Trong thực tế: bài **"Thao tác với File"** trong series này khuyên dùng `Path`/`Files` (thuộc `java.nio.file`) thay cho `File` cũ — đó chính là một phần của NIO, dù không nhất thiết dùng tới `Channel`/`Selector` cấp thấp.

</details>

**8. `BufferedWriter` và `PrintWriter` khác nhau ở điểm nào? Khi nào dùng `PrintWriter`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`BufferedWriter`**: chỉ có các phương thức ghi cơ bản (`write(String)`, `newLine()`), tập trung vào việc ghi hiệu quả nhờ vùng đệm.
- **`PrintWriter`**: cung cấp các phương thức **tiện lợi và quen thuộc hơn** như `println()`, `printf()`, tự động chuyển đổi nhiều kiểu dữ liệu (số, boolean, object) thành chuỗi, và quan trọng là **không ném checked exception** cho từng thao tác ghi — thay vào đó ghi lỗi vào cờ nội bộ, kiểm tra bằng `checkError()`.
- Trong ví dụ server/client TCP, `PrintWriter` thường được tạo với tham số `autoFlush = true` (`new PrintWriter(out, true)`) để mỗi lần gọi `println()` sẽ **đẩy dữ liệu đi ngay**, không bị giữ lại trong vùng đệm chờ đầy mới gửi — quan trọng khi giao tiếp qua mạng theo từng dòng lệnh.

`PrintWriter` thường được dùng khi cần ghi log ra file hoặc gửi dữ liệu dạng dòng qua socket một cách tiện lợi hơn `BufferedWriter` thuần.

</details>

**9. Tình huống: cần đọc một file log 5GB và đếm số dòng chứa từ `"ERROR"`. Viết cách đọc an toàn về bộ nhớ và giải thích vì sao không nên dùng cách khác.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
long soDongLoi = 0;
try (BufferedReader reader = new BufferedReader(new FileReader("app.log"))) {
    String dong;
    while ((dong = reader.readLine()) != null) {
        if (dong.contains("ERROR")) {
            soDongLoi++;
        }
    }
}
System.out.println("Số dòng lỗi: " + soDongLoi);
```

- Dùng `BufferedReader.readLine()` trong vòng lặp: mỗi thời điểm chỉ giữ **một dòng** trong bộ nhớ, xử lý xong thì dòng đó bị bỏ, không tích luỹ RAM theo kích thước file.
- **Không nên** dùng cách nạp toàn bộ file vào bộ nhớ trước (ví dụ đọc hết thành một `String` hay `List<String>` khổng lồ) — với file 5GB gần như chắc chắn gây `OutOfMemoryError` vì RAM của JVM (mặc định) nhỏ hơn nhiều so với kích thước file.
- `try-with-resources` đảm bảo `reader` luôn được đóng, kể cả khi có lỗi giữa chừng khi đọc.

</details>

**10. `System.in`, `System.out`, `System.err` là gì? Vì sao `System.err` thường được dùng riêng cho thông báo lỗi thay vì dùng chung `System.out`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều là các luồng I/O chuẩn được JVM khởi tạo sẵn khi chương trình chạy:

- **`System.in`**: luồng **nhập chuẩn** (`InputStream`), mặc định gắn với bàn phím — là nguồn dữ liệu cho `Scanner` khi đọc từ console.
- **`System.out`**: luồng **xuất chuẩn** (`PrintStream`), in ra màn hình console.
- **`System.err`**: luồng **xuất lỗi chuẩn** (`PrintStream`), cũng in ra console nhưng là một luồng **tách biệt** với `System.out`.

Tách riêng `System.err` giúp:
- Có thể **chuyển hướng (redirect)** output bình thường và thông báo lỗi ra hai nơi khác nhau ở dòng lệnh hệ điều hành (ví dụ `java App > out.log 2> err.log`), giúp lọc lỗi dễ dàng khi debug mà không lẫn với log thông thường.
- `System.err` thường **không có buffer** (hoặc tự động flush), nên thông báo lỗi hiện ra ngay lập tức, đúng thứ tự thời gian xảy ra — quan trọng khi cần thấy lỗi trước khi chương trình crash.

</details>

**11. Từ Java 11, có cách nào đọc/ghi cả nội dung một file văn bản chỉ trong một dòng mà không cần tự quản lý `Reader`/`Writer`?**

<details className="qa">
<summary>Xem đáp án</summary>

Có — dùng các phương thức tiện ích tĩnh của lớp `Files` (thuộc `java.nio.file`, không phải `java.io` thuần), phù hợp cho file **nhỏ đến vừa**:

```java
import java.nio.file.Files;
import java.nio.file.Path;

// Ghi một chuỗi ra file (Java 11+)
Files.writeString(Path.of("hello.txt"), "Xin chào Java!");

// Đọc toàn bộ nội dung file thành một chuỗi (Java 11+)
String noiDung = Files.readString(Path.of("hello.txt"));
```

Đây là cách gọn nhất cho các thao tác đọc/ghi đơn giản, không cần tự mở/đóng `Reader`/`Writer`. Tuy nhiên với file lớn (hàng trăm MB trở lên), vẫn nên quay lại dùng `BufferedReader`/`Files.newBufferedReader()` để đọc theo dòng, tránh nạp hết vào RAM như đã nêu ở lỗi thường gặp.

</details>

---

## 3. Thao tác với File

Bài học: [3. Thao tác với File](../../java/08-core-java/3_file-operations.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Path` và `File` có phải là "nội dung file" không? Vai trò thực sự của chúng là gì, và `Files` khác gì hai lớp đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Cả `Path` và `File` chỉ đại diện cho **đường dẫn** (vị trí) tới một file hoặc thư mục, không phải dữ liệu bên trong file đó.

- **`File`** (`java.io`, cách cũ): vừa là đường dẫn, vừa có sẵn một số method thao tác (nhưng yếu, trả `boolean` khi lỗi).
- **`Path`** (`java.nio.file`, Java 7+): chỉ thuần là đường dẫn, **không tự thao tác được** — mọi hành động đọc/ghi/copy/xóa phải thông qua lớp tiện ích riêng là **`Files`**.
- Tách vai trò rõ ràng: `Path` mô tả "ở đâu", `Files` thực hiện "làm gì" — giúp API mạch lạc và dễ mở rộng hơn so với `File` gộp chung cả hai.

</details>

**2. Nêu hai điểm yếu cụ thể của `java.io.File` mà `Path`/`Files` (NIO.2) đã khắc phục.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Báo lỗi mập mờ**: các method của `File` như `delete()`, `mkdir()`, `renameTo()` chỉ trả về `boolean` khi thất bại — không biết vì sao (thiếu quyền? file đang bị khóa? không tồn tại?). Method tương ứng của `Files` (`Files.delete()`...) ném `IOException` với thông điệp rõ ràng.
- **Đường dẫn phụ thuộc hệ điều hành**: `File` khuyến khích ghép chuỗi đường dẫn thủ công (dễ hardcode `\` của Windows), trong khi `Path.resolve()` tự xử lý đúng dấu phân cách theo OS đang chạy.
- Ngoài ra `Files` còn có nhiều thao tác `File` không hỗ trợ sẵn: duyệt cây thư mục (`Files.walk`), đọc thuộc tính/metadata, làm việc với symbolic link.

</details>

**3. `Files.readAllLines()` và `Files.newBufferedReader()` khác nhau thế nào? Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Files.readAllLines()` | `Files.newBufferedReader()` |
|---|---|---|
| Trả về | `List<String>` chứa **toàn bộ** các dòng | Một `BufferedReader` để đọc **tuần tự** từng dòng |
| Bộ nhớ | Nạp **hết** nội dung file vào RAM cùng lúc | Chỉ giữ một phần nhỏ (buffer) tại mỗi thời điểm |
| Phù hợp | File nhỏ, cần xử lý ngẫu nhiên/nhiều lần trên toàn bộ nội dung | File lớn, chỉ cần xử lý tuần tự từng dòng một lần |

```java
// File nhỏ: gọn, tiện khi cần duyệt lại nhiều lần
List<String> dong = Files.readAllLines(path);

// File lớn: đọc từng dòng, không tràn RAM
try (BufferedReader reader = Files.newBufferedReader(path)) {
    String dong2;
    while ((dong2 = reader.readLine()) != null) { /* xử lý */ }
}
```

</details>

**4. Đoạn code sau ném ngoại lệ gì nếu chạy hai lần liên tiếp? Vì sao?**

```java
Path path = Path.of("test.txt");
Files.createFile(path);
System.out.println("Đã tạo file: " + path);
```

<details className="qa">
<summary>Xem đáp án</summary>

Lần chạy thứ hai sẽ ném **`FileAlreadyExistsException`** (một loại `IOException`), vì `Files.createFile()` yêu cầu file **chưa tồn tại** — nó không giống `mkdir -p` là "tạo nếu chưa có, bỏ qua nếu đã có".

Cách xử lý đúng: kiểm tra `Files.exists(path)` trước khi tạo (như ví dụ trong bài), hoặc bọc trong `try-catch` bắt riêng `FileAlreadyExistsException` nếu muốn coi việc file đã tồn tại là bình thường, không phải lỗi nghiêm trọng.

</details>

**5. Đoạn code sau có thực sự an toàn tuyệt đối không, dù đã kiểm tra `Files.exists()` trước khi tạo?**

```java
if (!Files.exists(path)) {
    Files.createFile(path);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không tuyệt đối an toàn** trong môi trường đa luồng/đa tiến trình. Đây là mẫu lỗi kinh điển gọi là **TOCTOU (Time-Of-Check to Time-Of-Use)**: giữa lúc kiểm tra (`Files.exists()`) và lúc thực sự tạo file (`Files.createFile()`) có một khoảng thời gian rất ngắn nhưng vẫn tồn tại — nếu một luồng hoặc tiến trình khác **tạo file đó ngay trong khoảng thời gian này**, `Files.createFile()` vẫn sẽ ném `FileAlreadyExistsException` dù bước kiểm tra trước đó trả về "chưa tồn tại".

Cách an toàn hơn trong ngữ cảnh đa luồng: bỏ qua bước kiểm tra riêng, gọi thẳng `Files.createFile()` và bắt `FileAlreadyExistsException`, hoặc dùng các API nguyên tử (atomic) hơn nếu nền tảng hỗ trợ. Với ứng dụng đơn luồng đơn giản thì mẫu check-then-act trong bài vẫn đủ dùng.

</details>

**6. `Files.write(path, data)` gọi hai lần liên tiếp cho cùng một file sẽ cho kết quả gì? Làm sao để ghi thêm (append) thay vì ghi đè?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, `Files.write()` **ghi đè hoàn toàn** nội dung cũ của file (tương đương mở file ở chế độ `CREATE` + `TRUNCATE_EXISTING`). Gọi hai lần liên tiếp, lần sau sẽ xóa sạch nội dung lần trước rồi ghi nội dung mới vào.

```java
Files.write(path, List.of("Dòng A")); // file chỉ còn "Dòng A"
Files.write(path, List.of("Dòng B")); // file chỉ còn "Dòng B", "Dòng A" bị mất

// Muốn GHI THÊM vào cuối, phải truyền rõ StandardOpenOption.APPEND
Files.write(path, List.of("Dòng C"), StandardOpenOption.APPEND); // giữ nội dung cũ, thêm "Dòng C"
```

</details>

**7. `Files.copy(nguon, dich)` sẽ ném lỗi gì nếu file đích đã tồn tại? Cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định `Files.copy()` sẽ ném **`FileAlreadyExistsException`** nếu file đích đã có sẵn — nó không tự động ghi đè để tránh vô tình mất dữ liệu.

```java
// Muốn cho phép ghi đè nếu đích đã tồn tại, phải khai báo rõ
Files.copy(nguon, dich, StandardCopyOption.REPLACE_EXISTING);
```

Đây là thiết kế an toàn có chủ đích của NIO.2: hành vi phá hủy dữ liệu (ghi đè) phải được yêu cầu **tường minh**, không phải mặc định ngầm.

</details>

**8. `Files.delete()` và `Files.deleteIfExists()` khác nhau thế nào khi file không tồn tại?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`Files.delete(path)`**: nếu file **không tồn tại**, ném **`NoSuchFileException`**. Dùng khi bạn chắc chắn file phải tồn tại, và việc thiếu file là một lỗi cần biết.
- **`Files.deleteIfExists(path)`**: nếu file không tồn tại, **không ném lỗi**, chỉ trả về `false` một cách êm ả; trả về `true` nếu đã xóa thành công.

```java
Files.delete(path);            // ném NoSuchFileException nếu path không tồn tại
boolean daXoa = Files.deleteIfExists(path); // false nếu không tồn tại, không ném lỗi
```

Chọn `deleteIfExists` khi việc "file không có sẵn để xóa" là tình huống bình thường (ví dụ dọn dẹp file tạm), chọn `delete` khi sự vắng mặt của file là bất thường cần được báo lỗi rõ ràng.

</details>

**9. `Path.resolve()` hoạt động thế nào khi tham số truyền vào là một đường dẫn tuyệt đối? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

`resolve()` thường dùng để **nối** một đường dẫn con vào đường dẫn gốc, nhưng nếu tham số truyền vào là một **đường dẫn tuyệt đối**, `resolve()` sẽ **bỏ qua hoàn toàn** đường dẫn gốc và trả về **chính tham số tuyệt đối đó** — vì một đường dẫn tuyệt đối vốn đã tự xác định vị trí, không cần "nối thêm" vào đâu cả.

```java
Path goc = Path.of("data");

System.out.println(goc.resolve("users.txt"));        // "data/users.txt" — nối bình thường
System.out.println(goc.resolve("/etc/passwd"));       // "/etc/passwd" — bỏ qua "data", trả nguyên vẹn tham số tuyệt đối
```

Đây là cạm bẫy tiềm ẩn về bảo mật nếu phần đường dẫn con lấy trực tiếp từ input người dùng mà không kiểm tra: kẻ tấn công có thể truyền một đường dẫn tuyệt đối để "thoát" ra khỏi thư mục gốc dự kiến (liên quan tới lỗ hổng **path traversal**).

</details>

**10. Vì sao `Files.walk(path)` nên luôn được dùng trong khối `try-with-resources`, dù nó trả về một `Stream`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Files.walk()` trả về một `Stream<Path>`, nhưng khác với hầu hết các `Stream` khác trong Java (vốn không cần đóng), stream này **giữ tài nguyên hệ thống** (một hoặc nhiều **file handle/thư mục đang mở**) để duyệt cây thư mục một cách "lazy" (chỉ đọc tới đâu khi cần tới đó).

Nếu không đóng, các file handle này có thể bị **rò rỉ**, gây ra lỗi khó chịu như hết file handle khi chương trình duyệt nhiều cây thư mục liên tục, hoặc trên Windows là không xóa/đổi tên được thư mục vì vẫn còn tiến trình "giữ" nó.

```java
// ĐÚNG: try-with-resources đảm bảo đóng tài nguyên duyệt thư mục
try (Stream<Path> cay = Files.walk(goc)) {
    cay.filter(Files::isRegularFile).forEach(System.out::println);
}

// SAI: không đóng stream, có thể rò rỉ file handle nếu gọi lặp lại nhiều lần
Files.walk(goc).filter(Files::isRegularFile).forEach(System.out::println);
```

</details>

---

## 4. Lập trình mạng (Networking)

Bài học: [4. Lập trình mạng (Networking)](../../java/08-core-java/4_networking.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Một `Socket` được xác định (định danh duy nhất) bởi những thông tin nào? Vai trò của `ServerSocket` khác `Socket` ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Một kết nối socket được xác định bởi cặp **địa chỉ IP + cổng (port)** ở cả hai đầu (client và server) — cụ thể là bốn giá trị: IP nguồn, port nguồn, IP đích, port đích.

- **`ServerSocket`**: dùng ở phía **server**, chỉ để **lắng nghe** (`accept()`) kết nối tới trên một cổng cố định; bản thân nó không dùng để gửi/nhận dữ liệu.
- **`Socket`**: đại diện cho **một kết nối cụ thể** đã thiết lập — dùng ở phía client để chủ động kết nối tới server, và cũng chính là đối tượng server nhận được sau khi `ServerSocket.accept()` thành công để giao tiếp với client đó.

</details>

**2. Java `Socket`/`ServerSocket` mặc định dùng giao thức TCP. So sánh TCP với UDP (`DatagramSocket`) — khi nào nên chọn giao thức nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | TCP (`Socket`/`ServerSocket`) | UDP (`DatagramSocket`) |
|---|---|---|
| Đảm bảo thứ tự & đầy đủ | Có — dữ liệu tới đúng thứ tự, không mất gói (tự động gửi lại nếu thất lạc) | Không — gói có thể mất, tới sai thứ tự, không tự gửi lại |
| Kết nối | Hướng kết nối (connection-oriented) — bắt tay trước khi truyền | Không kết nối (connectionless) — gửi thẳng, không cần bắt tay |
| Tốc độ/overhead | Chậm hơn do phải đảm bảo tin cậy | Nhanh hơn, overhead thấp |
| Ví dụ dùng | Chat, truyền file, gọi API — cần dữ liệu chính xác tuyệt đối | Video call, game online, streaming — chấp nhận mất một ít gói để đổi lấy độ trễ thấp |

Chọn TCP khi tính **đúng và đủ** của dữ liệu quan trọng hơn tốc độ; chọn UDP khi **độ trễ thấp** quan trọng hơn, và ứng dụng có thể tự chịu được việc mất một phần dữ liệu.

</details>

**3. Vì sao `SimpleServer` trong bài chỉ phục vụ được đúng **một** client rồi kết thúc chương trình? Làm sao sửa để nó phục vụ được nhiều client liên tục?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `accept()` chỉ được gọi **một lần**, bên ngoài mọi vòng lặp — sau khi xử lý xong client đầu tiên, phương thức `main` kết thúc, `try-with-resources` đóng `ServerSocket` lại, chương trình dừng.

Muốn phục vụ **nhiều client liên tục**, cần bọc `accept()` trong một vòng lặp vô hạn, và (để phục vụ nhiều client **cùng lúc** thay vì lần lượt) giao mỗi kết nối cho một luồng riêng xử lý:

```java
try (ServerSocket serverSocket = new ServerSocket(port)) {
    while (true) { // luôn sẵn sàng nhận kết nối mới
        Socket clientSocket = serverSocket.accept(); // chờ client tiếp theo
        // Giao cho một luồng riêng xử lý để không chặn việc accept() client khác
        new Thread(() -> xuLyClient(clientSocket)).start();
    }
}
```

Đây là mô hình "thread-per-connection" đơn giản — với số lượng client rất lớn, thực tế thường dùng virtual thread (Java 21+) hoặc NIO `Selector` để xử lý hiệu quả hơn.

</details>

**4. `accept()` và `readLine()` là các thao tác "blocking". Điều này có nghĩa là gì, và nó ảnh hưởng thế nào tới thiết kế chương trình?**

<details className="qa">
<summary>Xem đáp án</summary>

**Blocking** (chặn) nghĩa là luồng gọi phương thức đó sẽ **dừng lại chờ** cho đến khi có kết quả, không làm gì khác được trong lúc chờ:

- `serverSocket.accept()`: luồng gọi bị "đứng" cho tới khi có client nào đó kết nối tới.
- `in.readLine()`: luồng gọi bị "đứng" cho tới khi phía bên kia gửi xong một dòng dữ liệu (hoặc kết nối bị đóng).

Ảnh hưởng tới thiết kế: nếu server chỉ có **một luồng duy nhất** vừa `accept()` vừa xử lý dữ liệu, nó sẽ **không thể** đồng thời chờ client mới và phục vụ client hiện tại — đây chính là lý do cần mô hình đa luồng (mỗi kết nối một luồng riêng) hoặc I/O bất đồng bộ/non-blocking (NIO) khi cần phục vụ nhiều client đồng thời.

</details>

**5. `HttpClient.send()` và `HttpClient.sendAsync()` khác nhau thế nào? Cho ví dụ dùng `sendAsync()`.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`send(request, bodyHandler)`**: gửi yêu cầu **đồng bộ (synchronous)** — luồng gọi bị **chặn**, đứng chờ cho tới khi có phản hồi mới chạy tiếp dòng code kế tiếp.
- **`sendAsync(request, bodyHandler)`**: gửi yêu cầu **bất đồng bộ (asynchronous)** — trả về ngay một `CompletableFuture<HttpResponse<T>>`, luồng gọi **không bị chặn**, có thể làm việc khác trong lúc chờ; xử lý kết quả thông qua callback khi future hoàn tất.

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.github.com"))
        .GET()
        .build();

// Không chặn luồng hiện tại; xử lý kết quả khi có phản hồi
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
      .thenApply(HttpResponse::body)
      .thenAccept(System.out::println);

System.out.println("Dòng này chạy NGAY, không chờ HTTP trả về");
```

`sendAsync()` phù hợp khi cần gọi nhiều API song song hoặc không muốn chặn luồng chính (ví dụ trong ứng dụng có giao diện người dùng).

</details>

**6. Có nên tạo mới một `HttpClient` cho mỗi lần gọi API không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không nên.** `HttpClient` được thiết kế để **tái sử dụng** — nó quản lý bên trong một **connection pool** (bể kết nối tái sử dụng), cấu hình timeout, cookie handler... Tạo lại `HttpClient` mới cho mỗi request sẽ mất đi lợi ích tái sử dụng kết nối (phải bắt tay TCP/TLS lại từ đầu mỗi lần), tương tự như việc biên dịch lại `Pattern` mỗi lần thay vì tái sử dụng.

```java
// ĐÚNG: tạo một lần, dùng lại cho nhiều request
private static final HttpClient CLIENT = HttpClient.newHttpClient();

public String goiApi(String url) throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
    return CLIENT.send(request, HttpResponse.BodyHandlers.ofString()).body();
}
```

</details>

**7. Đoạn code sau ném ngoại lệ gì, trong hai tình huống: (a) chạy `SimpleClient` trước khi `SimpleServer` đang chạy; (b) chạy `SimpleServer` hai lần liên tiếp cùng một cổng?**

```java
Socket socket = new Socket("localhost", 5000);
```

```java
ServerSocket serverSocket = new ServerSocket(5000);
```

<details className="qa">
<summary>Xem đáp án</summary>

- **(a) Client chạy trước khi server lắng nghe**: ném **`ConnectException`** (thường kèm thông điệp "Connection refused") — vì chưa có ai lắng nghe ở cổng 5000 để chấp nhận kết nối.
- **(b) Chạy `ServerSocket` hai lần trên cùng một cổng** (khi tiến trình đầu vẫn đang giữ cổng đó): ném **`BindException`** ("Address already in use") — hệ điều hành không cho hai tiến trình cùng lắng nghe một cổng TCP giống nhau tại cùng thời điểm.
- Cả hai đều là `IOException`, nên có thể bắt gộp bằng `catch (IOException e)`, nhưng biết phân biệt hai loại lỗi cụ thể giúp debug nhanh hơn: "chưa ai lắng nghe" khác với "cổng đã bị chiếm".

</details>

**8. `URL` và `URI` (Uniform Resource Identifier) khác nhau thế nào? Vì sao nên dùng `URI` để phân tích cú pháp thay vì tạo `URL` trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`URI`**: chỉ là một chuỗi định danh tài nguyên theo cú pháp chuẩn (RFC 3986) — thuần về **phân tích cú pháp (parsing)**, không thực hiện bất kỳ hành động mạng nào.
- **`URL`**: là một `URI` cụ thể hơn, biết cách **định vị (locate)** tài nguyên đó, và có thể **mở kết nối thực sự** tới nó (`openStream()`, `openConnection()`).

Java khuyến khích: dùng `URI` để phân tích cú pháp địa chỉ (an toàn, không gây side-effect), chỉ chuyển sang `URL` (qua `uri.toURL()`) khi thực sự cần **mở kết nối**. Lý do: một số phương thức cũ của `URL` như `equals()`/`hashCode()` có thể thực hiện **tra cứu DNS** (network call) ngầm để so sánh hai URL — gây độ trễ bất ngờ và hành vi khó đoán nếu dùng `URL` làm key trong `HashMap`/`HashSet`. Đây cũng là lý do các constructor `URL` cũ dần bị khuyến nghị thay bằng `URI` trong các phiên bản Java hiện đại.

</details>

**9. Tình huống: bạn cần nâng cấp `SimpleServer` trong bài để phục vụ **hàng nghìn** client kết nối đồng thời. Mô hình "mỗi client một `Thread`" có còn phù hợp không? Nêu hướng cải thiện.**

<details className="qa">
<summary>Xem đáp án</summary>

Mô hình "thread-per-connection" (mỗi kết nối một luồng hệ điều hành riêng) sẽ **khó scale** tới hàng nghìn kết nối đồng thời với luồng nền tảng (platform thread) truyền thống, vì mỗi luồng chiếm bộ nhớ stack đáng kể và việc chuyển đổi ngữ cảnh (context switch) giữa hàng nghìn luồng gây tốn kém.

Hai hướng cải thiện phổ biến:
- **Virtual thread (Java 21+)**: vẫn giữ mô hình lập trình đơn giản "mỗi kết nối một luồng", nhưng virtual thread rất nhẹ (có thể tạo hàng triệu luồng), do JVM quản lý việc ánh xạ xuống một số ít luồng hệ điều hành thực khi luồng bị block (như lúc `accept()`/`readLine()` đang chờ).
- **NIO non-blocking với `Selector`**: dùng một (hoặc vài) luồng để theo dõi **nhiều kênh (channel)** cùng lúc, chỉ xử lý khi kênh nào đó thực sự sẵn sàng đọc/ghi — phức tạp hơn để lập trình nhưng hiệu quả cao với kiến trúc truyền thống trước khi có virtual thread.

Với dự án mới trên Java 21+, virtual thread thường là lựa chọn đơn giản và hiệu quả nhất để scale mô hình thread-per-connection sẵn có mà không cần viết lại theo NIO phức tạp.

</details>

**10. Vì sao khi bắt được `InterruptedException` từ `HttpClient.send()`, nên gọi `Thread.currentThread().interrupt()` ngay trong khối `catch` thay vì chỉ log lỗi rồi bỏ qua?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi một luồng đang bị **block** (chờ) trong một thao tác như `send()` bị ngắt (interrupt) từ bên ngoài, JVM ném `InterruptedException` và đồng thời **xóa (clear) cờ ngắt (interrupt status)** của luồng đó — coi như tín hiệu ngắt đã được "tiêu thụ" xong.

Nếu chỉ bắt ngoại lệ rồi log và bỏ qua, **thông tin "luồng này đã được yêu cầu dừng"** sẽ bị mất hoàn toàn — các đoạn code gọi ở tầng cao hơn (ví dụ vòng lặp kiểm tra `Thread.currentThread().isInterrupted()` để biết khi nào nên dừng công việc) sẽ không còn biết rằng đã có yêu cầu ngắt.

```java
} catch (IOException | InterruptedException e) {
    System.err.println("Lỗi khi gọi HTTP: " + e.getMessage());
    Thread.currentThread().interrupt(); // khôi phục lại cờ ngắt cho tầng gọi cao hơn biết
}
```

Gọi `Thread.currentThread().interrupt()` giúp **"khôi phục" lại tín hiệu ngắt**, đảm bảo hành vi ngắt luồng vẫn được tôn trọng đúng đắn xuyên suốt toàn bộ call stack, thay vì bị "nuốt mất" ở một tầng xử lý ngoại lệ nào đó.

</details>

---

## 5. Mã hóa (Cryptography)

Bài học: [5. Mã hóa (Cryptography)](../../java/08-core-java/5_cryptography.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt băm (hashing) và mã hóa (encryption). Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Băm (hashing) | Mã hóa (encryption) |
|---|---|---|
| Chiều | Một chiều — không thể đảo ngược lại dữ liệu gốc | Hai chiều — giải mã lại được nếu có khóa |
| Khóa | Không cần khóa (hoặc HMAC thì cần key nhưng vẫn một chiều) | Cần khóa (đối xứng hoặc bất đối xứng) |
| Mục đích | Kiểm tra toàn vẹn, lưu mật khẩu (không cần lấy lại bản gốc) | Giữ bí mật nội dung, cần lấy lại được bản gốc sau này |
| Ví dụ lớp Java | `MessageDigest` (SHA-256) | `Cipher` (AES, RSA) |

Dùng **băm** khi không bao giờ cần khôi phục dữ liệu gốc (lưu mật khẩu, checksum file tải về). Dùng **mã hóa** khi cần truyền/lưu dữ liệu bí mật nhưng **phải đọc lại được** sau này (số thẻ, nội dung tin nhắn).

</details>

**2. Vì sao SHA-256 — vốn là thuật toán băm được coi là an toàn — vẫn KHÔNG phải lựa chọn tốt để băm mật khẩu trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

SHA-256 được thiết kế để **rất nhanh** — mục tiêu ban đầu là kiểm tra toàn vẹn dữ liệu (checksum), càng nhanh càng tốt. Nhưng với mật khẩu, tốc độ nhanh lại là **điểm yếu**: kẻ tấn công có phần cứng chuyên dụng (GPU/ASIC) có thể thử **hàng tỷ mật khẩu mỗi giây** để dò ngược qua một bảng SHA-256 bị lộ (brute-force hoặc rainbow table).

Các thuật toán chuyên dụng cho mật khẩu như **bcrypt, scrypt, Argon2** cố tình được thiết kế **chậm và tốn tài nguyên** (kỹ thuật gọi là "key stretching"/"work factor" — có thể cấu hình độ khó tăng dần theo thời gian phần cứng mạnh lên), khiến việc dò hàng loạt trở nên cực kỳ tốn kém về thời gian/chi phí, dù vẫn nhanh với việc xác minh một mật khẩu đơn lẻ khi người dùng đăng nhập bình thường.

</details>

**3. Salt giải quyết vấn đề gì? Salt có cần giữ bí mật như khóa mã hóa không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Salt** giải quyết vấn đề **rainbow table** — bảng tra sẵn ánh xạ hàng loạt mật khẩu phổ biến sang giá trị băm tương ứng của chúng, giúp kẻ tấn công tra ngược cực nhanh nếu không có salt (vì cùng một mật khẩu luôn cho cùng một hash).

Khi thêm salt (một chuỗi ngẫu nhiên, **khác nhau cho mỗi người dùng**) vào trước khi băm, cùng một mật khẩu ở hai người dùng khác nhau sẽ cho ra **hai giá trị băm khác nhau hoàn toàn** — kẻ tấn công không thể dùng chung một rainbow table cho toàn bộ database, mà phải tính riêng cho từng salt, gần như vô hiệu hóa kiểu tấn công này.

**Salt KHÔNG cần giữ bí mật** — nó thường được **lưu công khai cùng với giá trị băm** trong database. Mục đích của salt là đảm bảo **tính duy nhất (uniqueness)** cho mỗi lần băm, không phải để giấu diếm. Cái cần giữ bí mật là **khóa mã hóa** (secret key), khác hoàn toàn với salt.

</details>

**4. Đoạn code sau minh họa điều gì về đặc tính của hàm băm?**

```java
String hash1 = sha256("matkhau123");
String hash2 = sha256("matkhau123");
String hash3 = sha256("Matkhau123"); // chỉ đổi chữ M thành hoa

System.out.println(hash1.equals(hash2));
System.out.println(hash1.equals(hash3));
```

<details className="qa">
<summary>Xem đáp án</summary>

Output: `true` rồi `false`.

- `hash1.equals(hash2)` → `true`: hàm băm là **hàm thuần túy, xác định (deterministic)** — cùng một đầu vào luôn cho ra đúng một kết quả, ở bất kỳ lần gọi nào, trên bất kỳ máy nào.
- `hash1.equals(hash3)` → `false`: đặc tính **hiệu ứng lan truyền (avalanche effect)** — chỉ cần đổi **một ký tự** trong đầu vào (viết hoa chữ `M`), toàn bộ kết quả băm thay đổi hoàn toàn, không có điểm chung nào có thể nhận ra bằng mắt thường với hash gốc. Đặc tính này giúp không thể "đoán mò dần dần" đầu vào dựa vào việc quan sát hash thay đổi ra sao.

</details>

**5. Vì sao phải dùng `SecureRandom` thay vì `Random` thông thường để sinh salt hoặc khóa mã hóa?**

<details className="qa">
<summary>Xem đáp án</summary>

`java.util.Random` là một bộ sinh số giả ngẫu nhiên (PRNG) **có thể đoán trước được**: nó dùng một công thức toán học xác định, và nếu biết được **seed** (giá trị khởi tạo — thường được sinh dựa trên thời gian hệ thống nếu không truyền tay) hoặc quan sát đủ số các giá trị đã sinh ra trước đó, kẻ tấn công có thể **tính ngược lại toàn bộ chuỗi số** tiếp theo mà `Random` sẽ sinh ra.

`SecureRandom` là bộ sinh số ngẫu nhiên **an toàn cho mật mã (CSPRNG)** — lấy entropy (tính ngẫu nhiên thực) từ các nguồn khó đoán của hệ điều hành (nhiễu phần cứng, thời gian ngắt, hoạt động I/O...), khiến việc dự đoán giá trị tiếp theo trở nên **không khả thi về mặt tính toán**.

Dùng `Random` cho salt/khóa là lỗ hổng nghiêm trọng: nếu kẻ tấn công đoán được salt hoặc khóa, toàn bộ lớp bảo vệ coi như vô nghĩa.

</details>

**6. Chế độ (mode) `AES/ECB/...` khác gì `AES/GCM/...`? Vì sao ECB bị coi là không an toàn dù cùng dùng thuật toán AES?**

<details className="qa">
<summary>Xem đáp án</summary>

- **ECB (Electronic Codebook)**: chia dữ liệu thành từng khối cố định rồi **mã hóa độc lập từng khối** với cùng một khóa — nghĩa là **hai khối dữ liệu gốc giống nhau sẽ luôn cho ra hai khối mã hóa giống hệt nhau**. Điều này làm lộ **cấu trúc/họa tiết (pattern)** của dữ liệu gốc dù không biết nội dung cụ thể — ví dụ mã hóa một tấm ảnh bằng ECB, người xem vẫn có thể nhận ra hình dạng trong ảnh gốc qua bản mã hóa.
- **GCM (Galois/Counter Mode)**: mỗi khối được kết hợp thêm với một **IV (Initialization Vector — vector khởi tạo, giá trị ngẫu nhiên/không lặp lại cho mỗi lần mã hóa)**, khiến cùng một dữ liệu gốc mã hóa nhiều lần cho ra kết quả **khác nhau mỗi lần**, đồng thời còn cung cấp khả năng **xác thực (authentication)** — phát hiện được nếu dữ liệu mã hóa bị ai đó chỉnh sửa.

Vì lý do này, `AES/GCM/NoPadding` (hoặc `CBC` với IV ngẫu nhiên) được khuyến nghị thay cho chế độ `ECB` mặc định đơn giản trong thực tế.

</details>

**7. So sánh mã hóa đối xứng (AES) và bất đối xứng (RSA). Vì sao HTTPS/TLS lại dùng kết hợp cả hai thay vì chỉ dùng một loại?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Đối xứng (AES) | Bất đối xứng (RSA) |
|---|---|---|
| Khóa | Một khóa chung để mã hóa và giải mã | Cặp khóa: public key (mã hóa/xác minh) và private key (giải mã/ký) |
| Tốc độ | Rất nhanh | Chậm hơn nhiều (tính toán phức tạp hơn) |
| Vấn đề | Cần **trao đổi khóa an toàn** trước — nếu khóa bị lộ khi truyền là mất an toàn | Không cần trao đổi bí mật trước (public key công khai được) nhưng chậm |

**TLS/HTTPS dùng kết hợp cả hai** để tận dụng ưu điểm của từng loại: dùng RSA (hoặc trao đổi khóa Diffie-Hellman) chỉ để **trao đổi an toàn một khóa phiên (session key) AES** ngay lúc bắt tay (handshake) ban đầu — bước này chậm nhưng chỉ chạy một lần; sau đó **toàn bộ dữ liệu thực tế** trong phiên làm việc được mã hóa bằng **AES** vì tốc độ nhanh hơn nhiều so với RSA. Đây là mô hình "mã hóa lai" (hybrid encryption) rất phổ biến trong thực tế.

</details>

**8. Chữ ký số (digital signature) là gì? Nó khác gì so với việc chỉ mã hóa dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chữ ký số** dùng cặp khóa bất đối xứng nhưng theo **chiều ngược lại** với mã hóa thông thường: người gửi dùng **private key** (khóa riêng, chỉ mình họ có) để "ký" lên dữ liệu (thực chất là mã hóa giá trị băm của dữ liệu); bất kỳ ai có **public key** tương ứng đều có thể **xác minh (verify)** chữ ký đó có đúng do người sở hữu private key tạo ra hay không.

Khác biệt so với mã hóa thông thường:
- **Mã hóa** nhằm giữ **bí mật** nội dung (chỉ người có khóa đúng mới đọc được).
- **Chữ ký số** nhằm đảm bảo **tính toàn vẹn** (dữ liệu không bị sửa đổi sau khi ký) và **xác thực nguồn gốc/chống chối bỏ (non-repudiation)** — chứng minh chính người giữ private key đó đã tạo ra dữ liệu, họ không thể sau này phủ nhận.

Ứng dụng thực tế: ký các gói phần mềm/certificate để người dùng biết chắc phần mềm đến từ đúng nhà phát triển, không bị ai chèn mã độc vào giữa đường.

</details>

**9. Base64 encoding có phải là một hình thức mã hóa (encryption) không? Vì sao nhiều người mới hay nhầm lẫn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hoàn toàn KHÔNG.** Base64 chỉ là một cách **biểu diễn (encoding)** dữ liệu nhị phân dưới dạng chuỗi ký tự an toàn để in ấn/truyền qua các kênh chỉ hỗ trợ văn bản (ví dụ nhúng vào JSON, URL, email) — nó **không có khóa**, và bất kỳ ai cũng có thể **giải mã ngược (decode) ngay lập tức** mà không cần bất kỳ bí mật nào, chỉ cần biết đó là chuỗi Base64.

```java
String maHoa = Base64.getEncoder().encodeToString("Mat khau bi mat".getBytes());
System.out.println(maHoa); // "TWF0IGtoYXUgYmkgbWF0"

// Bất kỳ ai cũng giải mã lại được ngay, không cần "khóa" nào cả
String goc = new String(Base64.getDecoder().decode(maHoa));
System.out.println(goc); // "Mat khau bi mat"
```

Nhầm lẫn phổ biến: thấy chuỗi Base64 "trông như bị mã hóa, khó đọc" nên tưởng nó bảo vệ được dữ liệu — trong khi thực chất nó chỉ là một phép biến đổi công khai, tương đương "viết bằng chữ khác nhưng ai cũng đọc được", hoàn toàn không mang tính bảo mật.

</details>

**10. HMAC là gì? Nó khác gì so với việc chỉ dùng `MessageDigest` băm thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

**HMAC (Hash-based Message Authentication Code)** là một cơ chế kết hợp một hàm băm (như SHA-256) với một **khóa bí mật (secret key)** để vừa kiểm tra **tính toàn vẹn** vừa **xác thực nguồn gốc** của dữ liệu — chỉ ai sở hữu đúng secret key mới tạo ra được HMAC hợp lệ cho một thông điệp.

Khác biệt so với `MessageDigest` băm thông thường:
- **Băm thường** (`digest.digest(data)`): **bất kỳ ai** cũng tính được hash của dữ liệu, vì không cần khóa gì — chỉ chứng minh dữ liệu chưa bị đổi so với một hash đã biết trước, không chứng minh được **ai** đã tạo ra dữ liệu đó.
- **HMAC**: chỉ người có secret key mới tạo và xác minh được đúng mã HMAC — nếu kẻ tấn công sửa dữ liệu, họ không thể tính lại HMAC hợp lệ vì không biết khóa, nên bên nhận phát hiện ngay dữ liệu đã bị can thiệp.
- HMAC còn được thiết kế đặc biệt để chống lại kiểu tấn công "length extension attack" (kẻ tấn công nối thêm dữ liệu vào cuối rồi tính ra hash hợp lệ mới mà không cần biết dữ liệu gốc) — một điểm yếu tồn tại ở một số hàm băm dùng trực tiếp mà không qua HMAC.

Trong Java, HMAC được thực hiện qua lớp `javax.crypto.Mac` (ví dụ thuật toán `"HmacSHA256"`), không phải qua `MessageDigest`.

</details>
