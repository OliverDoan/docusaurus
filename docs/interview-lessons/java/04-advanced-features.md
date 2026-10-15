---
sidebar_position: 4
title: "4. Tính năng nâng cao"
---

# 4. Tính năng nâng cao

## 1. Xử lý ngoại lệ (Exception Handling)

Bài học: [1. Xử lý ngoại lệ (Exception Handling)](../../java/04-advanced-features/1_xu-ly-ngoai-le.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao Java dùng cơ chế ngoại lệ (exception) thay vì báo lỗi bằng mã trả về (return code) như C truyền thống?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Tách bạch luồng lỗi khỏi luồng logic chính**: code xử lý nghiệp vụ không bị trộn lẫn với hàng loạt `if (ma == -1)` kiểm tra lỗi ở mọi tầng gọi.
- **Không thể "quên" xử lý một cách âm thầm**: mã trả về có thể bị bỏ qua mà chương trình vẫn biên dịch và chạy (dù sai); ngoại lệ nếu không được bắt sẽ tự "nổi" (propagate) lên tầng trên, và nếu không ai xử lý thì chương trình dừng hẳn kèm thông báo rõ ràng — không có chuyện lỗi trôi qua trong im lặng.
- **Mang theo thông tin phong phú**: message mô tả lỗi, stack trace (dấu vết ngăn xếp gọi hàm) cho biết lỗi xảy ra ở đâu, và nguyên nhân gốc (`cause`) khi lỗi được bọc qua nhiều tầng.
- **Checked exception ép kiểm tra lúc biên dịch**: với các lỗi quan trọng (I/O, DB), compiler bắt buộc phải xử lý hoặc khai báo `throws`, giảm khả năng quên.

</details>

**2. Phân biệt checked exception và unchecked exception. Cho ví dụ mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Checked Exception | Unchecked Exception |
|---|---|---|
| Kiểm tra lúc biên dịch | Bắt buộc (`try-catch` hoặc `throws`) | Không bắt buộc |
| Kế thừa từ | `Exception` (trừ nhánh `RuntimeException`) | `RuntimeException` |
| Nguyên nhân điển hình | Sự cố bên ngoài, khó lường trước (file không tồn tại, mất kết nối mạng) | Lỗi lập trình (bug) |
| Ví dụ | `IOException`, `SQLException` | `NullPointerException`, `ArithmeticException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException` |

- Checked exception dùng cho những tình huống **người gọi nên và có thể xử lý** (ví dụ: thử kết nối lại khi mất mạng).
- Unchecked exception thường báo hiệu **lỗi logic của lập trình viên** — về nguyên tắc nên sửa code chứ không phải `catch` để che đi.

</details>

**3. Phân biệt `throw` và `throws`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `throw` | `throws` |
|---|---|---|
| Vị trí | Trong thân phương thức | Trên chữ ký (signature) phương thức |
| Tác dụng | **Ném thật** một đối tượng ngoại lệ ngay lập tức | **Khai báo** rằng phương thức có khả năng ném ra ngoại lệ đó |
| Số lượng | Chỉ ném một đối tượng mỗi lần | Có thể khai báo nhiều loại, cách nhau bằng dấu phẩy |

```java
// throws: khai báo trên chữ ký
static void doc(String path) throws java.io.IOException {
    if (path == null) {
        // throw: ném thật một đối tượng cụ thể
        throw new java.io.IOException("Đường dẫn null");
    }
}
```

</details>

**4. `Error` khác `Exception` như thế nào trong cây `Throwable`? Có nên viết `catch (Error e)` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều kế thừa từ `Throwable`, nhưng mang ý nghĩa khác nhau:

- **`Exception`**: sự cố ở tầng ứng dụng, thường **có thể phục hồi** được (đọc lại file, thử lại kết nối...). Đây là loại nên `catch` và xử lý.
- **`Error`**: sự cố **nghiêm trọng ở tầng JVM/hệ thống**, ví dụ `OutOfMemoryError` (hết bộ nhớ) hay `StackOverflowError` (tràn ngăn xếp do đệ quy vô hạn). Những lỗi này thường **không thể phục hồi** một cách đáng tin cậy bằng code ứng dụng.
- **Không nên** viết `catch (Error e)` (hay tệ hơn là `catch (Throwable e)`) để "nuốt" và cố chạy tiếp — chương trình đang ở trạng thái không ổn định, cố gắng tiếp tục có thể gây hậu quả khó lường hơn là để nó dừng lại.

</details>

**5. Đoạn code sau in ra gì?**

```java
public class Test {
    static int demo() {
        try {
            return 1;
        } finally {
            return 2;
        }
    }

    public static void main(String[] args) {
        System.out.println(demo());
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`2`**.

- Khối `try` chuẩn bị trả về `1`, nhưng trước khi giá trị đó thực sự được trả về, `finally` luôn được thực thi.
- Vì `finally` ở đây có một `return 2;` riêng, nó **ghi đè** hoàn toàn giá trị trả về của `try` — giá trị `1` bị bỏ qua.
- Đây là lý do vì sao đặt `return` (hoặc `throw`) bên trong `finally` bị coi là **anti-pattern** nguy hiểm: nó có thể âm thầm nuốt mất kết quả hoặc ngoại lệ từ khối `try`/`catch`.

</details>

**6. Nếu cả thân khối `try-with-resources` và phương thức `close()` của resource đều ném ngoại lệ, ngoại lệ nào được ném ra cho người gọi? Ngoại lệ còn lại đi đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Ngoại lệ từ **thân khối `try`** được ném ra cho người gọi; ngoại lệ từ `close()` bị **"nén" (suppressed)** vào ngoại lệ chính, có thể lấy lại bằng `getSuppressed()`.

```java
class TaiNguyenLoi implements AutoCloseable {
    @Override
    public void close() {
        throw new IllegalStateException("Lỗi khi đóng");
    }
}

public class Test {
    public static void main(String[] args) {
        try (TaiNguyenLoi r = new TaiNguyenLoi()) {
            throw new RuntimeException("Lỗi trong thân try");
        } catch (RuntimeException e) {
            System.out.println("Bắt được: " + e.getMessage()); // "Lỗi trong thân try"
            for (Throwable s : e.getSuppressed()) {
                System.out.println("Bị nén: " + s.getMessage()); // "Lỗi khi đóng"
            }
        }
    }
}
```

- Java ưu tiên giữ lại ngoại lệ **gốc** (có ý nghĩa nghiệp vụ hơn, thường xảy ra trước) làm ngoại lệ chính, tránh việc lỗi đóng tài nguyên che mất lỗi thật sự gây ra vấn đề.

</details>

**7. Vì sao viết `catch (Exception e) {}` (bắt rồi để trống) bị coi là một anti-pattern nghiêm trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Nuốt lỗi hoàn toàn**: chương trình tiếp tục chạy như không có gì xảy ra, trong khi trạng thái nội bộ có thể đã sai lệch.
- **Cực kỳ khó debug**: khi hệ thống có hành vi bất thường về sau, không có bất kỳ dấu vết (log, stack trace) nào chỉ ra nguyên nhân gốc.
- **Che giấu lỗi nghiêm trọng lẫn lỗi nhỏ như nhau**: `catch (Exception e)` bắt luôn cả những lỗi không liên quan tới ý định ban đầu.
- **Cách làm đúng tối thiểu**: luôn ghi log (`logger.error("...", e)`), và cân nhắc rethrow dưới dạng ngoại lệ phù hợp hơn nếu tầng hiện tại không đủ khả năng xử lý.

</details>

**8. Khi tự tạo custom exception, nên kế thừa `Exception` (checked) hay `RuntimeException` (unchecked)? Dựa vào tiêu chí nào để quyết định?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có quy tắc tuyệt đối, nhưng tiêu chí thường dùng:

- Kế thừa **`Exception`** (checked) khi lỗi là tình huống **người gọi có khả năng và nên xử lý ngay tại chỗ gọi**, ví dụ `TaiKhoanKhongTonTaiException` khi tra cứu — người gọi có thể bắt và hiển thị thông báo phù hợp.
- Kế thừa **`RuntimeException`** (unchecked) khi lỗi phản ánh **vi phạm hợp đồng/logic lập trình** mà việc bắt buộc `try-catch` ở mọi nơi gọi chỉ gây phiền toái, ví dụ lỗi validate tham số đầu vào không hợp lệ.
- Nhiều framework hiện đại (Spring, JPA) có xu hướng **ưu tiên unchecked exception** ngay cả cho lỗi nghiệp vụ, vì checked exception buộc mọi tầng gọi phải khai báo `throws` hoặc bắt, gây "ô nhiễm" chữ ký phương thức qua nhiều lớp kiến trúc (đặc biệt khó khi dùng cùng Stream API, vì lambda không khai báo được `throws` cho checked exception).

</details>

**9. Java 7 cho phép bắt nhiều loại ngoại lệ trong cùng một khối `catch` bằng cú pháp nào? Có ràng buộc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Multi-catch**, dùng dấu `|` để liệt kê nhiều loại trong một khối `catch`:

```java
try {
    xuLy();
} catch (java.io.IOException | java.sql.SQLException e) {
    // Xử lý chung cho cả hai loại
    System.out.println("Lỗi: " + e.getMessage());
}
```

- Các loại liệt kê phải **không có quan hệ cha-con** với nhau (ví dụ không được viết `IOException | FileNotFoundException` vì `FileNotFoundException` đã là con của `IOException`).
- Biến `e` trong khối multi-catch được compiler suy ra kiểu là **giao (LUB — least upper bound)** của các loại, và biến này **effectively final** (không được gán lại).
- Lợi ích: tránh lặp code xử lý giống hệt nhau ở nhiều khối `catch` riêng lẻ.

</details>

**10. Tình huống: bạn xây một API rút tiền ngân hàng. Có nên dùng exception để báo "số dư không đủ", hay nên trả về một kiểu kết quả (ví dụ `Result`/`Optional`) thay vì ném lỗi? Phân tích trade-off.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cách đều hợp lý tùy ngữ cảnh, quan trọng là **exception nên dành cho tình huống thực sự bất thường**, không phải để thay thế luồng điều khiển (`if-else`) thông thường:

- **Dùng exception** (`SoDuKhongDuException`) khi "số dư không đủ" là **hiếm gặp** và cần dừng luồng xử lý ngay, buộc mọi tầng gọi phải chú ý xử lý (đặc biệt hợp với checked exception ở đây).
- **Dùng kiểu kết quả** (`Result`, hoặc đơn giản là trả về một đối tượng có cờ `thanhCong`) khi tình huống "số dư không đủ" là **một nhánh nghiệp vụ bình thường**, xảy ra thường xuyên (ví dụ trong flow kiểm tra hạn mức trước khi cho phép giao dịch) — dùng exception cho luồng điều khiển thông thường sẽ **tốn hiệu năng** hơn (do JVM phải tạo stack trace) và làm code khó đọc theo kiểu "nhảy" bất ngờ.
- Nguyên tắc chung: **exception cho lỗi (điều không nên xảy ra)**, **kiểu kết quả/giá trị cho các nhánh nghiệp vụ dự kiến trước**.

</details>

**11. Trong kiến trúc nhiều tầng (Controller → Service → Repository), khi tầng Repository ném `SQLException` (checked), tầng Service nên xử lý thế nào để không làm "rò rỉ" chi tiết công nghệ (JDBC) lên tầng trên?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên **bọc (wrap)** ngoại lệ tầng thấp thành một ngoại lệ nghiệp vụ ở tầng cao hơn, vẫn giữ nguyên nhân gốc để không mất thông tin debug:

```java
class DuLieuException extends RuntimeException {
    public DuLieuException(String thongBao, Throwable nguyenNhan) {
        super(thongBao, nguyenNhan); // giữ lại cause gốc
    }
}

class NguoiDungService {
    NguoiDung timNguoiDung(int id) {
        try {
            return repository.timTheoId(id); // ném SQLException (checked)
        } catch (java.sql.SQLException e) {
            // Bọc lại thành ngoại lệ tầng nghiệp vụ, không lộ SQLException ra Controller
            throw new DuLieuException("Không thể tìm người dùng " + id, e);
        }
    }
}
```

- **Lợi ích**: tầng Controller/API không cần biết Repository đang dùng JDBC hay JPA hay công nghệ gì khác — nó chỉ cần biết "có lỗi dữ liệu".
- Truyền `e` vào constructor `super(message, cause)` để giữ **nguyên nhân gốc (cause)** — khi debug vẫn xem được đầy đủ stack trace ban đầu qua `getCause()`, thay vì mất dấu vết.
- Cách này cũng giúp gom nhiều loại lỗi công nghệ khác nhau (SQL, kết nối, timeout...) về một loại exception nghiệp vụ thống nhất mà tầng trên dễ xử lý.

</details>

---

## 2. Biểu thức Lambda (Lambda Expressions)

Bài học: [2. Biểu thức Lambda (Lambda Expressions)](../../java/04-advanced-features/2_lambda-expressions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Biểu thức Lambda là gì? Cú pháp cơ bản gồm những phần nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lambda expression** là cách viết ngắn gọn cho một hàm ẩn danh (không tên), được giới thiệu từ **Java 8**, dùng để truyền hành vi (behavior) đi như một tham số.

Cú pháp gồm ba phần: `(tham số) -> { thân hàm }`.

```java
(a, b) -> a + b;                 // Rút gọn: 1 dòng, tự return
x -> x * x;                      // Rút gọn: 1 tham số, bỏ ngoặc đơn
() -> System.out.println("Hi");  // Không tham số
(a, b) -> {                      // Thân nhiều dòng, cần return rõ ràng
    int tong = a + b;
    return tong;
};
```

</details>

**2. Functional interface là gì? Vì sao lambda chỉ hoạt động được với nó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Functional interface** (giao diện hàm) là một interface chỉ có **đúng một** phương thức trừu tượng (`abstract method`) — dù có thể có thêm các `default`/`static method`.

- Lambda thực chất là **phần triển khai (implementation)** cho đúng phương thức trừu tượng duy nhất đó, nên compiler cần biết chính xác "khuôn" (kiểu tham số, kiểu trả về) để suy luận — điều này chỉ rõ ràng khi interface có duy nhất một phương thức trừu tượng.
- Annotation `@FunctionalInterface` không bắt buộc nhưng nên dùng: nó khiến compiler báo lỗi ngay nếu ai đó vô tình thêm phương thức trừu tượng thứ hai, phá vỡ khả năng dùng lambda.
- Ví dụ có sẵn: `Runnable`, `Comparator`, `Callable`, và các interface trong `java.util.function`.

</details>

**3. So sánh lambda và anonymous class (lớp ẩn danh). Nêu ít nhất hai khác biệt quan trọng ngoài việc lambda ngắn hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Lambda | Anonymous class |
|---|---|---|
| `this` bên trong | Trỏ tới **đối tượng bao ngoài (enclosing instance)** | Trỏ tới **chính đối tượng anonymous class** đó |
| Tạo instance mới | Có thể được JVM tối ưu, không nhất thiết tạo object mới mỗi lần gọi | Luôn tạo một `.class` file riêng và một object mới mỗi lần khởi tạo |
| Phạm vi áp dụng | Chỉ dùng được với **functional interface** (1 phương thức trừu tượng) | Dùng được với bất kỳ interface hoặc lớp trừu tượng nào, kể cả nhiều phương thức |
| Khai báo biến mới | Không tạo scope lồng mới cho tên biến (biến trùng tên với lớp ngoài sẽ báo lỗi) | Tạo một scope class riêng |

- Khác biệt về `this` là điểm hay bị hỏi nhất: trong anonymous class, `this.ten` (nếu có field `ten`) sẽ ưu tiên field của chính anonymous class; còn trong lambda, `this` "xuyên qua" và trỏ về đối tượng chứa lambda đó.

</details>

**4. "Effectively final" nghĩa là gì? Vì sao lambda chỉ capture (bắt) được biến effectively final?**

<details className="qa">
<summary>Xem đáp án</summary>

**Effectively final** là một biến **không có từ khóa `final`** nhưng **thực tế không bao giờ bị gán lại giá trị** sau khi khởi tạo — về mặt ngữ nghĩa, nó tương đương với `final`.

```java
int soLan = 3; // không có từ khóa final
Runnable r = () -> System.out.println(soLan); // OK vì soLan effectively final

// soLan = 5; // Nếu bỏ comment dòng này -> lỗi biên dịch!
// Vì lúc đó soLan không còn effectively final nữa
```

- Lý do ràng buộc này: lambda có thể được **chạy ở một thời điểm khác**, thậm chí trên **luồng khác** với nơi nó được tạo ra. Nếu cho phép capture biến có thể thay đổi, giá trị lambda "nhìn thấy" sẽ không xác định (tùy thời điểm chạy) — Java loại bỏ hẳn rủi ro này bằng cách bắt buộc giá trị phải cố định tại thời điểm capture.
- Lambda thực chất **copy giá trị** của biến tại thời điểm capture, chứ không giữ tham chiếu tới chính biến cục bộ đó (khác với capture field của object, có thể thay đổi được qua getter/setter).

</details>

**5. Method reference là gì? Liệt kê các loại phổ biến kèm ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

**Method reference** (`::`) là cú pháp rút gọn hơn nữa cho lambda khi thân lambda chỉ đơn giản là **gọi lại một phương thức có sẵn**.

| Loại | Ví dụ lambda | Method reference |
|---|---|---|
| Static method | `x -> Integer.parseInt(x)` | `Integer::parseInt` |
| Instance method của một đối tượng cụ thể | `x -> System.out.println(x)` | `System.out::println` |
| Instance method của tham số đầu tiên (unbound) | `s -> s.toUpperCase()` | `String::toUpperCase` |
| Constructor reference | `() -> new ArrayList<>()` | `ArrayList::new` |

```java
List<String> ten = List.of("cuong", "an", "binh");
ten.stream().map(String::toUpperCase).forEach(System.out::println);
```

</details>

**6. Kể tên và nêu công dụng bốn functional interface cơ bản nhất trong package `java.util.function`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Interface | Phương thức trừu tượng | Ý nghĩa |
|---|---|---|
| `Function<T, R>` | `R apply(T t)` | Nhận một giá trị kiểu `T`, trả về giá trị kiểu `R` (biến đổi/ánh xạ) |
| `Predicate<T>` | `boolean test(T t)` | Nhận một giá trị, trả về `true`/`false` (kiểm tra điều kiện) |
| `Consumer<T>` | `void accept(T t)` | Nhận một giá trị, không trả về gì (thực hiện hành động) |
| `Supplier<T>` | `T get()` | Không nhận gì, trả về một giá trị (cung cấp/tạo giá trị) |

```java
Function<Integer, Integer> nhanDoi = x -> x * 2;
Predicate<Integer> laSoDuong = x -> x > 0;
Consumer<String> inRa = System.out::println;
Supplier<String> taoChuoi = () -> "Xin chào";
```

Đây chính là các interface nền tảng cho `map` (`Function`), `filter` (`Predicate`), `forEach` (`Consumer`) trong Stream API.

</details>

**7. Đoạn code sau có biên dịch được không? Vì sao?**

```java
public class Test {
    public static void main(String[] args) {
        Runnable[] tacVu = new Runnable[3];
        for (int i = 0; i < 3; i++) {
            int gia = i; // biến effectively final RIÊNG cho mỗi vòng lặp
            tacVu[i] = () -> System.out.println("Giá trị: " + gia);
        }
        for (Runnable r : tacVu) {
            r.run();
        }
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Biên dịch được** và in ra `Giá trị: 0`, `Giá trị: 1`, `Giá trị: 2`.

- Mấu chốt là dòng `int gia = i;` bên trong thân vòng lặp: mỗi lần lặp, một biến `gia` **mới** được khai báo và gán giá trị một lần duy nhất, nên nó là effectively final trong phạm vi (scope) của lần lặp đó — dù `i` (biến điều khiển vòng lặp) liên tục thay đổi.
- Nếu bỏ dòng `int gia = i;` và lambda cố capture trực tiếp biến `i` của vòng lặp `for` kiểu C (biến bị thay đổi mỗi vòng), code sẽ **báo lỗi biên dịch** vì `i` không phải effectively final.
- Đây là lý do lambda trong vòng lặp `for-each` (`for (String s : list)`) luôn an toàn để capture biến lặp — mỗi vòng, biến đó được coi như một biến effectively final riêng biệt.

</details>

**8. Trong đoạn code sau, `this.ten` bên trong lambda và bên trong anonymous class lần lượt tham chiếu tới đối tượng nào?**

```java
class ViDu {
    String ten = "Ngoài";

    Runnable dungLambda() {
        return () -> System.out.println(this.ten);
    }

    Runnable dungAnonymous() {
        return new Runnable() {
            String ten = "Trong";
            @Override
            public void run() {
                System.out.println(this.ten);
            }
        };
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

- `dungLambda().run()` in ra **`"Ngoài"`**: lambda **không tạo scope `this` riêng**, nên `this` bên trong lambda chính là `this` của đối tượng `ViDu` bao ngoài.
- `dungAnonymous().run()` in ra **`"Trong"`**: anonymous class **tạo ra một lớp con thật sự** của `Runnable`, nên nó có `this` của riêng nó, và field `ten` tự khai báo (`"Trong"`) che khuất (shadow) field `ten` của lớp ngoài.
- Đây là khác biệt ngữ nghĩa quan trọng thường bị bỏ qua khi chỉ nghĩ lambda là "anonymous class viết gọn hơn".

</details>

**9. Khi nào KHÔNG nên viết logic phức tạp trực tiếp bên trong một biểu thức lambda?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên tách lambda phức tạp ra thành một **phương thức riêng có tên rõ ràng** (rồi dùng method reference) khi:

- Thân lambda có **nhiều bước logic, rẽ nhánh, hoặc lồng nhiều lambda khác** — khó đọc khi nằm giữa một chuỗi Stream dài.
- Logic đó **cần được test độc lập** (unit test) — một method riêng dễ viết test hơn một lambda ẩn danh nằm giữa code.
- Logic đó **được tái sử dụng ở nhiều nơi** — tách ra tránh lặp code.
- Ví dụ cải thiện:

```java
// Khó đọc: logic phức tạp nhồi hết vào lambda
list.stream().filter(x -> x.getTuoi() > 18 && x.getDiem() >= 5 && !x.daNghiHoc()).toList();

// Rõ ràng hơn: tách thành method có tên
list.stream().filter(HocSinh::duDieuKienTotNghiep).toList();
```

</details>

**10. Lambda có tự động cache/tái sử dụng instance khi không capture biến ngoài nào không? Điều này ảnh hưởng thế nào tới hiệu năng khi tạo lambda trong vòng lặp lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

- Với lambda **không capture** biến nào từ môi trường xung quanh (stateless), JVM **có thể** (nhưng không đảm bảo theo đặc tả) tái sử dụng cùng một instance đã tạo, vì hành vi của nó không phụ thuộc ngữ cảnh — tương tự như một hằng số.
- Với lambda **có capture** biến ngoài, mỗi lần biểu thức lambda được thực thi (ví dụ mỗi vòng lặp) sẽ tạo ra **một instance mới** giữ giá trị capture riêng — không thể tái sử dụng vì mỗi instance mang dữ liệu khác nhau.
- Về thực tế: chi phí tạo lambda **rất nhỏ** so với anonymous class cũ (JVM dùng cơ chế `invokedynamic` để sinh lambda hiệu quả hơn là tạo hẳn một `.class` file), nên trong tuyệt đại đa số trường hợp không cần lo lắng về hiệu năng khi dùng lambda trong vòng lặp — chỉ cần tránh capture những đối tượng nặng một cách không cần thiết.

</details>

---

## 3. Chú thích (Annotations)

Bài học: [3. Chú thích (Annotations)](../../java/04-advanced-features/3_annotations.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Annotation là gì? Bản thân annotation có tự thay đổi hành vi chương trình không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Annotation** (chú thích) là một dạng "nhãn dán" metadata (siêu dữ liệu) gắn vào lớp, phương thức, biến, tham số..., luôn bắt đầu bằng ký hiệu `@`.

- **Không**, bản thân annotation **không tự thay đổi** cách code chạy. Nó chỉ cung cấp thông tin để compiler, công cụ, hoặc framework **đọc và xử lý** (thường qua Reflection lúc chạy).
- Ví dụ: `@Entity` trên một class tự nó không làm gì cả — phải có Hibernate/JPA quét annotation này và tạo ra hành vi ánh xạ tới bảng dữ liệu tương ứng.

</details>

**2. Nêu công dụng của bốn annotation có sẵn thường gặp: `@Override`, `@Deprecated`, `@FunctionalInterface`, `@SuppressWarnings`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Annotation | Công dụng |
|---|---|
| `@Override` | Báo compiler kiểm tra phương thức có thực sự ghi đè phương thức lớp cha/interface không; gõ sai tên/tham số sẽ báo lỗi ngay thay vì âm thầm tạo ra một phương thức mới. |
| `@Deprecated` | Đánh dấu thành phần đã lỗi thời, cảnh báo không nên dùng vì có thể bị xóa trong tương lai. |
| `@FunctionalInterface` | Đánh dấu interface chỉ có đúng một phương thức trừu tượng; compiler báo lỗi nếu ai đó vô tình thêm phương thức trừu tượng thứ hai, phá vỡ khả năng dùng lambda. |
| `@SuppressWarnings` | Yêu cầu compiler bỏ qua một số cảnh báo cụ thể (ví dụ `"unchecked"`), tránh làm nhiễu log build với cảnh báo đã biết và chấp nhận được. |

</details>

**3. `@Retention` là gì? Phân biệt ba giá trị của `RetentionPolicy`.**

<details className="qa">
<summary>Xem đáp án</summary>

`@Retention` (vòng đời lưu giữ) quy định annotation tồn tại đến giai đoạn nào trong vòng đời biên dịch/chạy:

| `RetentionPolicy` | Tồn tại đến khi nào | Ví dụ |
|---|---|---|
| `SOURCE` | Chỉ trong mã nguồn, bị bỏ khi biên dịch | `@Override`, `@SuppressWarnings` |
| `CLASS` (mặc định) | Trong file `.class` nhưng JVM không nạp lúc chạy | Ít dùng trực tiếp, chủ yếu cho công cụ phân tích bytecode |
| `RUNTIME` | Còn tồn tại lúc chương trình chạy, đọc được bằng Reflection | `@Entity`, `@Autowired`, `@Test` |

- Các framework như Spring, JUnit, JPA **luôn** dùng `RUNTIME` vì chúng cần quét annotation bằng Reflection khi ứng dụng khởi động hoặc chạy.

</details>

**4. `@Target` dùng để làm gì? Kể tên vài giá trị `ElementType` thường gặp.**

<details className="qa">
<summary>Xem đáp án</summary>

`@Target` xác định annotation được phép gắn ở **vị trí nào** trong code. Nếu gắn sai vị trí không được cho phép, compiler sẽ báo lỗi.

Một số `ElementType` thường gặp:

- `TYPE` — lớp, interface, enum.
- `METHOD` — phương thức.
- `FIELD` — biến thành viên (field).
- `PARAMETER` — tham số phương thức.
- `CONSTRUCTOR` — hàm dựng.

```java
@Target({ElementType.METHOD, ElementType.FIELD}) // cho phép cả hai vị trí
@interface KiemTra {
}
```

</details>

**5. Viết một annotation tùy chỉnh có phần tử bắt buộc và phần tử có giá trị mặc định. Cú pháp `@interface` khác gì so với `interface` thường?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface ThongTinApi {
    String phienBan();                 // Phần tử BẮT BUỘC — phải truyền khi dùng
    String moTa() default "Không có";  // Phần tử có giá trị MẶC ĐỊNH — có thể bỏ qua
}

@ThongTinApi(phienBan = "1.0") // moTa dùng giá trị mặc định "Không có"
class NguoiDungController {
}
```

- `@interface` định nghĩa một **loại annotation**, không phải interface thông thường — các "phương thức" khai báo bên trong thực chất là **các phần tử (element)**, giống như tham số có tên.
- Nếu phần tử không có `default`, người dùng annotation **bắt buộc** phải truyền giá trị, nếu không sẽ lỗi biên dịch.

</details>

**6. Phân biệt hai cách một annotation có thể được xử lý: annotation processing lúc biên dịch (compile-time) và đọc qua Reflection lúc chạy (runtime).**

<details className="qa">
<summary>Xem đáp án</summary>

| | Compile-time (Annotation Processing / APT) | Runtime (Reflection) |
|---|---|---|
| Thời điểm xử lý | Trong lúc biên dịch, trước khi sinh bytecode | Sau khi chương trình đã chạy |
| Yêu cầu Retention | `SOURCE` hoặc `CLASS` là đủ | Bắt buộc `RUNTIME` |
| Ví dụ công cụ | Lombok (sinh getter/setter), MapStruct (sinh code mapper), `javac`'s `@Override` check | Spring (`@Autowired`, `@Component`), JUnit (`@Test`), JPA/Hibernate (`@Entity`) |
| Ưu điểm | Sinh code thật lúc build, **không tốn chi phí Reflection lúc chạy** | Linh hoạt hơn, không cần bước build riêng, dễ áp dụng cho ứng dụng đã đóng gói |
| Nhược điểm | Cần công cụ xử lý annotation riêng, phức tạp khi tự viết | Chậm hơn một chút do chi phí Reflection, lỗi cấu hình chỉ phát hiện lúc chạy |

</details>

**7. Đoạn code sau có biên dịch được không? Vì sao?**

```java
@Target(ElementType.METHOD)
@interface ChiDanhChoMethod {
}

@ChiDanhChoMethod // Gắn lên một CLASS, không phải method
class ViDu {
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không biên dịch được.** Annotation `ChiDanhChoMethod` khai báo `@Target(ElementType.METHOD)`, nghĩa là nó **chỉ được phép** gắn lên phương thức. Việc gắn nó lên khai báo `class ViDu` (một `TYPE`, không phải `METHOD`) vi phạm ràng buộc `@Target`, nên compiler báo lỗi ngay tại vị trí sử dụng sai — đây chính là lợi ích của `@Target`: bắt lỗi sử dụng sai sớm, ngay lúc biên dịch, thay vì để annotation bị dùng tùy tiện rồi gây lỗi khó hiểu lúc chạy.

</details>

**8. Mô tả (ở mức khái niệm) luồng hoạt động khi Spring quét và xử lý annotation như `@Component`/`@Autowired` lúc khởi động ứng dụng.**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Quét package (component scan)**: Spring dò qua các package được cấu hình, tìm các class có annotation đánh dấu như `@Component`, `@Service`, `@Repository`, `@RestController`.
2. **Đọc annotation bằng Reflection**: với mỗi class tìm thấy, Spring dùng Reflection để đọc annotation gắn trên class, constructor, field, method (annotation này phải có `@Retention(RUNTIME)` mới đọc được lúc chạy).
3. **Tạo bean**: Spring gọi constructor (hoặc factory method) để tạo instance — đây là nơi diễn ra Dependency Injection: nếu constructor có tham số, Spring tìm bean phù hợp để tiêm vào (dựa trên annotation `@Autowired` hoặc tự động từ Java 4.3+ nếu chỉ có một constructor).
4. **Lưu vào IoC Container**: bean được lưu vào container để tái sử dụng và tiêm cho các bean khác cần đến.
5. **Ánh xạ hành vi khác**: với `@RestController`/`@GetMapping`, Spring còn đọc annotation để đăng ký ánh xạ URL tới đúng phương thức xử lý.

Annotation ở đây đóng vai trò "khai báo ý định", còn Spring Container là nơi thực sự đọc và biến ý định đó thành hành vi.

</details>

**9. `@Repeatable` (Java 8) giải quyết vấn đề gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Java 8, mỗi phần tử code chỉ được gắn **một lần** cho mỗi loại annotation. `@Repeatable` cho phép gắn **nhiều annotation cùng loại** lên cùng một vị trí.

```java
import java.lang.annotation.Repeatable;

@Repeatable(LichLamViecs.class) // annotation "chứa" bắt buộc phải khai báo trước
@interface LichLamViec {
    String thu();
}

@interface LichLamViecs {
    LichLamViec[] value(); // annotation gom nhiều LichLamViec lại thành mảng
}

@LichLamViec(thu = "Thứ 2")
@LichLamViec(thu = "Thứ 4") // Gắn LẶP LẠI annotation cùng loại — chỉ hợp lệ nhờ @Repeatable
class NhanVien {
}
```

- Ứng dụng thực tế: định nghĩa nhiều ràng buộc validate trên cùng một field, hoặc khai báo nhiều lịch/nhiều vai trò cho cùng một phần tử mà không cần gộp thủ công vào một mảng khi khai báo.

</details>

---

## 4. Hệ thống Module (Java Module System)

Bài học: [4. Hệ thống Module (Java Module System)](../../java/04-advanced-features/4_modules.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Hệ thống Module (JPMS) là gì? Ra đời từ phiên bản Java nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**JPMS** (Java Platform Module System, còn gọi Project Jigsaw) là hệ thống module chính thức của Java, giới thiệu từ **Java 9**. Nó cho phép chia một chương trình thành các **module** — mỗi module là một nhóm package kèm bản mô tả rõ ràng về việc nó **cần gì** (`requires`) từ module khác và **cho phép** module nào khác dùng phần nào của nó (`exports`).

</details>

**2. Phân biệt `requires` và `exports` trong `module-info.java`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `requires` | `exports` |
|---|---|---|
| Ý nghĩa | Khai báo module **này phụ thuộc vào** module khác | Khai báo package nào của module này **được phép** module khác dùng |
| Kiểm tra khi nào | Lúc khởi động (nếu thiếu module cần, báo lỗi ngay) | Lúc biên dịch/chạy khi module khác cố `import` package không được `exports` |

```java
module com.shop.order {
    requires com.shop.payment;   // Cần dùng module payment
    exports com.shop.order.api;  // Cho phép module khác dùng package api của mình
}
```

</details>

**3. Vấn đề "JAR Hell" của classpath truyền thống là gì? JPMS giải quyết nó ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**JAR Hell** (địa ngục JAR) là tình trạng lộn xộn khi dùng classpath truyền thống:

- Hai thư viện khác nhau cần **hai phiên bản khác nhau** của cùng một thư viện thứ ba, nhưng classpath chỉ là một danh sách phẳng, không phân biệt được, gây xung đột hoặc lấy nhầm phiên bản.
- Thiếu một class/JAR chỉ được phát hiện **lúc chạy** (`ClassNotFoundException`), không phải lúc biên dịch/khởi động.
- Mọi class `public` đều lộ ra ngoài, không có ranh giới rõ ràng giữa API công khai và chi tiết nội bộ.

JPMS giảm thiểu vấn đề này nhờ **ranh giới module rõ ràng**: mỗi module khai báo tường minh phụ thuộc (`requires`) và phần được công khai (`exports`), giúp phát hiện thiếu phụ thuộc ngay khi khởi động, và giới hạn được việc lộ package nội bộ.

</details>

**4. `module-info.java` là gì? Nó phải đặt ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`module-info.java` là file đặc biệt mô tả một module: tên module, các `requires` (phụ thuộc) và `exports` (package công khai). File này **bắt buộc phải đặt ở thư mục gốc** (root) của module — ngang hàng với thư mục package gốc, không được đặt lồng bên trong bất kỳ package nào.

```text
src/
└── com.mycompany.app/
    ├── module-info.java   <- đúng vị trí: thư mục gốc của module
    └── com/mycompany/app/...
```

Đặt sai vị trí (ví dụ bên trong một package) sẽ khiến trình biên dịch không nhận diện được module.

</details>

**5. Thế nào là "đóng gói mạnh" (strong encapsulation) trong module system? Nó khác gì so với việc chỉ khai báo class là `private`/`package-private`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đóng gói mạnh** nghĩa là: một package **không được `exports`** sẽ hoàn toàn bị ẩn khỏi các module khác, **dù mọi class bên trong nó là `public`**.

- Trước JPMS, phạm vi truy cập (`public`/`private`/`package-private`) chỉ kiểm soát được **trong một package** hoặc trong classpath phẳng — một class `public` trong bất kỳ JAR nào cũng import được từ bất cứ đâu.
- Với JPMS, ranh giới kiểm soát nâng lên **cấp package giữa các module**: dù class là `public`, nếu package chứa nó không nằm trong danh sách `exports`, module khác **không thể** `import` hay dùng Reflection thông thường để truy cập — đây là lớp bảo vệ bổ sung, độc lập với access modifier của từng class.

</details>

**6. Đoạn khai báo module sau có vấn đề gì?**

```java
// File: payment/module-info.java
module com.shop.payment {
    // Không khai báo exports gì cả
}
```

```java
// File: order/module-info.java
module com.shop.order {
    requires com.shop.payment;
}
```

```java
package com.shop.order;
import com.shop.payment.api.ThanhToan; // Lỗi biên dịch tại đây
```

<details className="qa">
<summary>Xem đáp án</summary>

Module `com.shop.payment` **không `exports`** bất kỳ package nào, kể cả `com.shop.payment.api`. Dù `com.shop.order` đã `requires com.shop.payment` (khai báo đúng phụ thuộc), nó vẫn **không thể `import`** class `ThanhToan` — vì package chứa class đó bị "giấu kín" hoàn toàn theo nguyên tắc đóng gói mạnh.

**Cách sửa**: thêm dòng `exports com.shop.payment.api;` vào `module-info.java` của `com.shop.payment`. Lưu ý: `requires` chỉ cho phép module dùng **module khác nói chung**, còn `exports` mới thực sự quyết định **package nào** trong module đó lộ ra ngoài.

</details>

**7. Công cụ `jlink` dùng để làm gì? Vì sao nó chỉ khả thi nhờ có module system?**

<details className="qa">
<summary>Xem đáp án</summary>

`jlink` là công cụ tạo ra một **runtime image tối giản** — một bản JRE tùy chỉnh chỉ chứa đúng những module (kể cả module chuẩn của JDK) mà ứng dụng thực sự cần, thay vì đóng gói toàn bộ JDK khổng lồ.

- Điều này chỉ khả thi vì từ Java 9, **chính JDK cũng được chia thành các module** (`java.base`, `java.sql`, `java.logging`...) thay vì là một khối nguyên khối như trước.
- Lợi ích thực tế: tạo image Docker cho microservice **nhỏ gọn hơn nhiều**, khởi động nhanh hơn, giảm bề mặt tấn công (attack surface) vì không mang theo các module không dùng tới.

</details>

**8. `requires transitive` khác `requires` thông thường như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`requires transitive` (bắc cầu) khai báo rằng: bất kỳ module nào `requires` module hiện tại thì **cũng tự động** có quyền dùng module được `requires transitive` đó, không cần tự khai báo lại.

```java
module com.shop.api {
    requires transitive com.shop.common; // bắc cầu
}

module com.shop.web {
    requires com.shop.api;
    // Tự động dùng được com.shop.common luôn, KHÔNG cần "requires com.shop.common;"
}
```

- Hữu ích khi API công khai của một module (ví dụ tham số phương thức, kiểu trả về) sử dụng trực tiếp các kiểu từ module phụ thuộc — nếu không dùng `transitive`, module dùng API đó sẽ phải tự khai báo thêm `requires` cho module phụ thuộc ẩn, gây phiền toái và dễ quên.

</details>

**9. Với một dự án nhỏ hoặc mới học Java, có nên áp dụng module system ngay từ đầu không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bắt buộc**, và với đa số dự án nhỏ/vừa hiện nay, **classpath truyền thống vẫn hoạt động tốt** — thực tế nhiều framework lớn (Spring Boot mặc định) cũng chưa yêu cầu chạy dưới dạng module hóa đầy đủ.

- Module system mang lại giá trị rõ rệt nhất cho: **thư viện dùng chung** (cần ranh giới API rõ ràng để bên ngoài không phụ thuộc vào chi tiết nội bộ), **dự án rất lớn** (nhiều nhóm cùng phát triển, cần ranh giới cứng giữa các phần), và **ứng dụng cần runtime tối giản** (dùng `jlink`).
- Với dự án nhỏ, việc thêm `module-info.java` chỉ tạo thêm gánh nặng cấu hình (khai báo đủ mọi `requires` cho thư viện bên thứ ba, một số thư viện cũ chưa hỗ trợ tốt module) mà lợi ích thu được không tương xứng.
- Lời khuyên thực dụng: học để hiểu khái niệm và đọc được lỗi liên quan khi gặp (ví dụ khi dùng thư viện đã module hóa), nhưng không cần ép dự án cá nhân/nhỏ phải module hóa ngay.

</details>

---

## 5. Optional

Bài học: [5. Optional](../../java/04-advanced-features/5_optionals.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Optional<T>` là gì? Nó giải quyết vấn đề gì của `null`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Optional<T>` (Java 8) là một kiểu **bọc (container)** biểu diễn tường minh việc một giá trị **có thể có hoặc không có**.

- Vấn đề của `null`: khi nhìn vào chữ ký một phương thức trả về `String`, ta **không biết** nó có thể trả về `null` hay không — dẫn tới thiếu kiểm tra và gây `NullPointerException`, hoặc kiểm tra thừa ở khắp nơi vì không chắc chắn.
- `Optional<T>` đưa khả năng "trống" lên ngay **chữ ký kiểu trả về** (`Optional<NguoiDung>` thay vì `NguoiDung`), buộc người gọi phải chủ động xử lý trường hợp rỗng qua API của nó (`orElse`, `map`, `ifPresent`...) thay vì âm thầm bỏ qua.

</details>

**2. Phân biệt ba cách tạo `Optional`: `of`, `ofNullable`, `empty`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Phương thức | Dùng khi | Hành vi nếu truyền `null` |
|---|---|---|
| `Optional.of(giaTri)` | **Chắc chắn** giá trị không null | Ném ngay `NullPointerException` |
| `Optional.ofNullable(giaTri)` | Giá trị **có thể** null | Trả về `Optional` rỗng, không lỗi |
| `Optional.empty()` | Muốn tạo một `Optional` rỗng tường minh, không có giá trị đầu vào | — |

```java
Optional.of(null);            // NullPointerException ngay lập tức!
Optional.ofNullable(null);    // OK, trả về Optional rỗng
```

</details>

**3. So sánh `orElse` và `orElseGet`. Vì sao trong nhiều trường hợp `orElseGet` được khuyến nghị hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cùng cung cấp giá trị mặc định khi `Optional` rỗng, nhưng khác nhau về thời điểm **tính toán** giá trị mặc định đó:

- **`orElse(giaTri)`**: giá trị mặc định được **tính ngay**, bất kể `Optional` có giá trị hay không (eager evaluation).
- **`orElseGet(() -> ...)`**: giá trị mặc định chỉ được **tính khi thực sự cần** (lazy — chỉ gọi lambda khi `Optional` rỗng).

```java
Optional<String> ten = Optional.of("An");

// SAI hiệu năng: taoGiaTriMacDinhTonKem() LUÔN được gọi, dù ten đã có giá trị
ten.orElse(taoGiaTriMacDinhTonKem());

// ĐÚNG: chỉ gọi khi ten thực sự rỗng
ten.orElseGet(() -> taoGiaTriMacDinhTonKem());
```

- Nếu giá trị mặc định là một hằng số đơn giản (`"Không có"`), dùng `orElse` là đủ. Nếu nó là một phép tính tốn kém hoặc gọi service khác, luôn ưu tiên `orElseGet`.

</details>

**4. Đoạn code sau ném ra lỗi gì? Vì sao?**

```java
Optional<String> rong = Optional.empty();
String x = rong.get();
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném ra **`NoSuchElementException`**.

- `get()` chỉ nên gọi khi đã chắc chắn (thường qua `isPresent()`) rằng `Optional` có giá trị. Gọi `get()` trên một `Optional` rỗng sẽ ném lỗi — về bản chất, đây là một dạng lỗi **tương đương** với `NullPointerException` nếu gọi trực tiếp trên biến `null`, chỉ khác loại exception.
- Đây là lý do `get()` bị coi là "cửa sau" phá vỡ toàn bộ mục đích an toàn của `Optional` nếu bị lạm dụng — nên ưu tiên `orElse`/`orElseGet`/`ifPresent`/`map` thay vì `get()` trực tiếp.

</details>

**5. Phân biệt `map` và `flatMap` trên `Optional`. Khi nào bắt buộc phải dùng `flatMap`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`map(Function<T, R>)`**: biến đổi giá trị bên trong, hàm truyền vào trả về giá trị **thường** (`R`), và `map` tự động bọc kết quả đó vào `Optional<R>`.
- **`flatMap(Function<T, Optional<R>>)`**: dùng khi hàm biến đổi **đã trả về sẵn một `Optional<R>`** — nếu dùng `map` trong trường hợp này sẽ bị lồng hai lớp `Optional<Optional<R>>`, `flatMap` sẽ "làm phẳng" (flatten) kết quả về đúng một lớp `Optional<R>`.

```java
class NguoiDung {
    Optional<DiaChi> layDiaChi() { /* ... */ return Optional.empty(); }
}

Optional<NguoiDung> nd = timNguoiDung(1);

// SAI kiểu: Optional<Optional<DiaChi>> — lồng hai lớp, khó dùng tiếp
Optional<Optional<DiaChi>> longNhau = nd.map(NguoiDung::layDiaChi);

// ĐÚNG: flatMap làm phẳng thành Optional<DiaChi>
Optional<DiaChi> diaChi = nd.flatMap(NguoiDung::layDiaChi);
```

</details>

**6. Vì sao Brian Goetz (kiến trúc sư ngôn ngữ Java) khuyến nghị không nên dùng `Optional` làm kiểu tham số phương thức hay kiểu của field?**

<details className="qa">
<summary>Xem đáp án</summary>

`Optional` được thiết kế chủ yếu như một **kiểu trả về**, không phải kiểu dữ liệu đa dụng, vì:

- **Làm tham số**: nếu một phương thức có tham số kiểu `Optional<String>`, người gọi vẫn có thể truyền `null` cho chính tham số `Optional` đó (`ham(null)`), hoặc truyền `Optional.empty()` — vẫn phải kiểm tra hai tầng, không giải quyết triệt để vấn đề ban đầu. Cách tốt hơn là dùng **method overloading** hoặc tham số thường kèm validate.
- **Làm field của class**: `Optional` **không implement `Serializable`**, gây rắc rối khi serialize đối tượng (ví dụ lưu session, cache). Nó cũng tốn thêm một lớp bọc bộ nhớ không cần thiết cho mỗi field, trong khi field vốn có thể đơn giản là `null` và được che chắn bằng validate/kiểm tra tại các phương thức truy cập.
- Vị trí `Optional` phát huy tác dụng tốt nhất: **kiểu trả về** của phương thức, đặc biệt các phương thức tra cứu như `findById` — nơi "không tìm thấy" là kết quả hợp lệ cần được người gọi xử lý tường minh.

</details>

**7. `ifPresentOrElse` (Java 9) khác `ifPresent` như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`ifPresent(Consumer)` chỉ chạy hành động khi **có** giá trị, không làm gì khi rỗng. `ifPresentOrElse(Consumer, Runnable)` (thêm từ Java 9) cho phép khai báo **cả hai nhánh** trong một lời gọi: hành động khi có giá trị, và hành động khác khi rỗng.

```java
Optional<String> ten = timTen(99);

// Trước Java 9: phải viết if-else thủ công quanh ifPresent
if (ten.isPresent()) {
    System.out.println("Chào " + ten.get());
} else {
    System.out.println("Không tìm thấy");
}

// Từ Java 9: gọn trong một lời gọi
ten.ifPresentOrElse(
    t -> System.out.println("Chào " + t),      // khi CÓ giá trị
    () -> System.out.println("Không tìm thấy") // khi RỖNG
);
```

</details>

**8. Trong một repository, phương thức `findById` nên trả về `Optional<NguoiDung>` hay `NguoiDung` (có thể `null`)? Giải thích lựa chọn theo hướng thiết kế API.**

<details className="qa">
<summary>Xem đáp án</summary>

Nên trả về **`Optional<NguoiDung>`**, vì "không tìm thấy" là một kết quả **hoàn toàn hợp lệ và thường xuyên xảy ra** đối với thao tác tra cứu theo khóa — không phải là một lỗi bất thường.

```java
interface NguoiDungRepository {
    // Chữ ký nói RÕ: kết quả có thể vắng, người gọi PHẢI xử lý
    Optional<NguoiDung> findById(int id);
}

// Nơi gọi buộc phải cân nhắc trường hợp rỗng, khó bỏ sót
NguoiDung nd = repo.findById(99)
    .orElseThrow(() -> new NguoiDungKhongTonTaiException(99));
```

- Nếu trả về `NguoiDung` có thể `null`, người gọi rất dễ quên kiểm tra và gây NPE về sau — nhất là khi code được gọi từ nhiều nơi khác nhau qua thời gian.
- Đây cũng là lý do các framework hiện đại như **Spring Data JPA** đã chuẩn hóa `findById` trả về `Optional<T>` từ lâu.

</details>

**9. Từ Java 9, `Optional` có phương thức `stream()`. Nó dùng để làm gì và giải quyết tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`optional.stream()` trả về một `Stream` có **0 hoặc 1 phần tử**: rỗng nếu `Optional` rỗng, có đúng một phần tử nếu `Optional` có giá trị.

Ứng dụng phổ biến nhất: **lọc bỏ các `Optional` rỗng** khi xử lý một danh sách các phương thức trả về `Optional`, gộp gọn trong một pipeline Stream duy nhất thay vì phải `filter(Optional::isPresent).map(Optional::get)`:

```java
List<Optional<String>> danhSach = List.of(
    Optional.of("An"), Optional.empty(), Optional.of("Bình"));

List<String> ketQua = danhSach.stream()
    .flatMap(Optional::stream) // "làm phẳng" từng Optional thành 0 hoặc 1 phần tử
    .toList();
// ["An", "Bình"] — các Optional rỗng tự động bị loại bỏ
```

</details>

**10. Đoạn code sau in ra gì?**

```java
public class Test {
    public static void main(String[] args) {
        Optional<String> ten = Optional.ofNullable(null);

        String ketQua = ten
            .map(String::toUpperCase)
            .map(t -> t + "!")
            .orElse("KHONG CO TEN");

        System.out.println(ketQua);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`KHONG CO TEN`**.

- `Optional.ofNullable(null)` tạo ra một `Optional` **rỗng** ngay từ đầu.
- Khi gọi `map` trên một `Optional` rỗng, `map` **không thực thi hàm biến đổi** bên trong (không có giá trị nào để biến đổi) mà chỉ đơn giản trả về một `Optional` rỗng khác — dù có nối bao nhiêu `map` liên tiếp, kết quả vẫn rỗng, không hề ném lỗi.
- Cuối chuỗi, `orElse("KHONG CO TEN")` cung cấp giá trị mặc định vì toàn bộ chuỗi vẫn đang rỗng.
- Đây chính là điểm mạnh của `map` trên `Optional`: **an toàn tuyệt đối** trước `null` xuyên suốt cả chuỗi biến đổi, không cần kiểm tra `null` ở từng bước trung gian.

</details>

---

## 6. Dependency Injection (Tiêm phụ thuộc)

Bài học: [6. Dependency Injection (Tiêm phụ thuộc)](../../java/04-advanced-features/6_dependency-injection.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Dependency Injection là gì? Nó giải quyết vấn đề gì so với việc một lớp tự tạo phụ thuộc bằng `new`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dependency Injection (DI)** là kỹ thuật cho một đối tượng **nhận** các phụ thuộc (dependency) từ bên ngoài, thay vì **tự tạo** chúng bên trong bằng `new`.

Nếu tự tạo phụ thuộc bên trong, lớp bị **gắn kết chặt (tight coupling)** với một cài đặt cụ thể:

- **Khó thay đổi**: muốn đổi `EmailService` sang `SmsService` phải sửa code của lớp dùng nó.
- **Khó kiểm thử**: không thể thay phụ thuộc thật bằng bản giả (mock) khi viết test.
- **Khó tái sử dụng**: lớp bị dính chặt vào một cài đặt, không linh hoạt trong ngữ cảnh khác.

DI giải quyết bằng cách để phụ thuộc được **tiêm từ ngoài vào** (thường qua constructor), và lớp chỉ nên phụ thuộc vào **abstraction** (interface) thay vì lớp cụ thể.

</details>

**2. So sánh ba cách tiêm phụ thuộc: Constructor Injection, Setter Injection, Field Injection. Vì sao Constructor Injection được khuyến nghị nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Constructor Injection | Setter Injection | Field Injection |
|---|---|---|---|
| Cách tiêm | Qua tham số hàm dựng | Qua phương thức `setXxx()` | Trực tiếp vào field (thường qua Reflection, ví dụ `@Autowired` trên field) |
| Có thể dùng `final` | **Có** — phụ thuộc bất biến | Không | Không |
| Phụ thuộc bắt buộc | Rõ ràng (không tạo được object nếu thiếu tham số) | Có thể quên gọi setter, để object ở trạng thái thiếu phụ thuộc | Object trông "đủ" nhưng field có thể vẫn `null` khi test |
| Dễ viết unit test | Rất dễ — tự `new` với tham số mock, không cần framework | Cần gọi thêm setter | Khó nhất — cần Reflection hoặc chạy trong container để field được điền |

```java
class OrderService {
    private final PaymentService paymentService; // final -> bất biến, bắt buộc phải có

    public OrderService(PaymentService paymentService) { // Constructor Injection
        this.paymentService = paymentService;
    }
}
```

Constructor Injection được ưa chuộng nhất vì phụ thuộc trở thành **bắt buộc và bất biến** (`final`) — không thể tạo ra một `OrderService` "nửa vời" thiếu phụ thuộc, và không cần framework mới test được.

</details>

**3. Inversion of Control (IoC) là gì? Quan hệ giữa IoC và DI như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Inversion of Control (đảo ngược điều khiển)** là nguyên tắc: thay vì một đối tượng **tự quyết định và tự tạo** các phụ thuộc của nó, quyền kiểm soát đó được **chuyển ra bên ngoài** — một thành phần khác (người viết code, hoặc một container) quyết định cài đặt cụ thể nào sẽ được cung cấp.

- **IoC** là **nguyên tắc/tư tưởng thiết kế** tổng quát (đảo ngược ai kiểm soát việc tạo phụ thuộc).
- **DI** là **cách phổ biến nhất để hiện thực hóa** nguyên tắc IoC trong thực tế — tiêm phụ thuộc qua constructor/setter chính là một dạng cụ thể của việc "đảo ngược quyền kiểm soát".
- Nói cách khác: mọi DI đều là một hình thức IoC, nhưng IoC còn có thể được hiện thực bằng những cách khác (ví dụ Service Locator, Template Method...).

</details>

**4. DI giúp ích gì cho việc viết unit test? Minh họa bằng ví dụ tiêm một bản giả (mock/fake).**

<details className="qa">
<summary>Xem đáp án</summary>

DI cho phép **tiêm một phiên bản giả** (mock hoặc fake) thay cho phụ thuộc thật khi test, giúp kiểm thử logic của lớp mà **không cần gọi service thật** (không tốn tiền, không cần mạng, không phụ thuộc trạng thái bên ngoài).

```java
class FakePayment implements PaymentService {
    boolean daGoi = false;

    @Override
    public void thanhToan(double soTien) {
        daGoi = true; // Chỉ đánh dấu, không thanh toán thật
    }
}

// Test: tiêm bản giả vào OrderService qua constructor
OrderService dichVu = new OrderService(new FakePayment());
dichVu.datHang(50_000);
```

Nếu `OrderService` **tự tạo** `PaymentService` bên trong (không có DI), việc thay thế này là **không thể** — mỗi lần chạy test sẽ luôn gọi phải service thật.

</details>

**5. Vấn đề phụ thuộc vòng (circular dependency) trong DI là gì? Ví dụ và cách Spring xử lý (hoặc không xử lý được) với Constructor Injection.**

<details className="qa">
<summary>Xem đáp án</summary>

**Phụ thuộc vòng** xảy ra khi module/bean A cần B để khởi tạo, đồng thời B lại cần A — không bên nào có thể được tạo xong trước.

```java
class ServiceA {
    ServiceA(ServiceB b) { } // A cần B để khởi tạo
}
class ServiceB {
    ServiceB(ServiceA a) { } // B cần A để khởi tạo -> KẸT, không ai tạo trước được
}
```

- Với **Constructor Injection**, Spring **không thể** giải quyết vòng lặp này — sẽ ném lỗi `BeanCurrentlyInCreationException` lúc khởi động ứng dụng.
- Với **Setter Injection** hoặc `@Lazy`, Spring có thể "chữa cháy" bằng cách tạo bean rỗng trước rồi tiêm phụ thuộc sau khi cả hai đã tồn tại — nhưng đây chỉ là giải pháp tình thế.
- **Cách xử lý đúng đắn**: coi phụ thuộc vòng là **dấu hiệu thiết kế sai** — nên tách logic dùng chung ra một lớp thứ ba mà cả A và B cùng phụ thuộc vào, thay vì để chúng phụ thuộc lẫn nhau.

</details>

**6. Mô tả ngắn gọn Spring IoC Container hoạt động thế nào khi dùng annotation `@Autowired` trên constructor.**

<details className="qa">
<summary>Xem đáp án</summary>

1. Spring quét các class được đánh dấu quản lý (`@Service`, `@Component`, `@Repository`...).
2. Với mỗi class, Spring xem xét constructor: nếu chỉ có **một constructor**, Spring tự động dùng nó để tiêm (từ Spring 4.3+, không bắt buộc phải có `@Autowired` trên constructor nếu class chỉ có một constructor).
3. Với mỗi tham số của constructor, Spring tìm trong container một **bean phù hợp về kiểu** (interface hoặc class) để truyền vào.
4. Nếu bean phụ thuộc đó **chưa tồn tại**, Spring sẽ **tạo nó trước** (đệ quy theo đồ thị phụ thuộc), rồi mới quay lại tạo bean hiện tại.
5. Bean hoàn chỉnh được lưu vào container để tái sử dụng cho các bean khác cần đến, tránh phải tạo lại nhiều lần (mặc định là singleton).

</details>

**7. Nếu constructor của một lớp có 8, 9 tham số phụ thuộc, đây có phải dấu hiệu tốt không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đây là dấu hiệu cảnh báo (code smell)**, thường vi phạm **nguyên tắc đơn nhiệm (Single Responsibility Principle)**.

- Một lớp cần quá nhiều phụ thuộc thường có nghĩa nó đang **làm quá nhiều việc** — nên được tách thành các lớp nhỏ hơn, mỗi lớp đảm nhiệm một trách nhiệm rõ ràng, rồi lớp gốc chỉ điều phối (orchestrate) các lớp con đó.
- Cách xử lý thực tế: nhóm các phụ thuộc liên quan lại thành một đối tượng cấu hình/facade riêng, hoặc tách lớp theo use-case cụ thể thay vì một "God class" ôm hết logic nghiệp vụ liên quan.
- Constructor Injection có một lợi ích phụ đáng giá ở đây: nó khiến vấn đề "quá nhiều phụ thuộc" **hiện rõ ngay khi đọc code** (constructor dài loằng ngoằng), trong khi Field Injection dễ che giấu vấn đề này vì các field cứ thế được thêm dần mà không "đau" ngay lập tức.

</details>

**8. DI có bắt buộc phải dùng framework như Spring không? Viết một ví dụ DI thủ công (không dùng framework).**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bắt buộc.** DI là một **nguyên tắc thiết kế**, hoàn toàn có thể áp dụng thủ công bằng tay — Spring chỉ là công cụ **tự động hóa** việc tạo và nối các phụ thuộc khi số lượng bean lớn.

```java
interface Notifier {
    void gui(String noiDung);
}

class EmailNotifier implements Notifier {
    public void gui(String noiDung) { System.out.println("Email: " + noiDung); }
}

public class Main {
    public static void main(String[] args) {
        // "Wiring" thủ công: tự tạo và tự tiêm, không cần framework nào
        Notifier notifier = new EmailNotifier();
        OrderService dichVu = new OrderService(notifier);
        dichVu.datHang();
    }
}
```

Với dự án nhỏ, việc "wiring" thủ công như trên hoàn toàn hợp lý. Spring chỉ thực sự cần thiết khi số lượng bean và mối quan hệ giữa chúng lớn tới mức tự quản lý bằng tay trở nên cồng kềnh.

</details>

**9. So sánh Dependency Injection với mẫu thiết kế Service Locator. Vì sao DI thường được ưa chuộng hơn trong thiết kế hiện đại?**

<details className="qa">
<summary>Xem đáp án</summary>

**Service Locator** là một mẫu thiết kế khác cũng hiện thực IoC: thay vì tiêm phụ thuộc từ ngoài vào, lớp **tự chủ động hỏi** một "bộ định vị dịch vụ" trung tâm để lấy phụ thuộc nó cần.

```java
class OrderService {
    private final PaymentService paymentService =
        ServiceLocator.get(PaymentService.class); // TỰ đi hỏi, không được tiêm
}
```

| | Dependency Injection | Service Locator |
|---|---|---|
| Phụ thuộc có hiện rõ trong chữ ký không | Có — nhìn constructor là biết ngay cần gì | Không — phải đọc cả thân phương thức mới biết nó dùng dịch vụ gì |
| Dễ test | Rất dễ — tiêm mock trực tiếp | Khó hơn — phải cấu hình `ServiceLocator` toàn cục trước khi test |
| Gắn kết với hạ tầng | Thấp — lớp không biết gì về cách phụ thuộc được tạo | Cao — lớp phải biết và gọi trực tiếp `ServiceLocator` |

DI được ưa chuộng hơn vì nó giữ cho phụ thuộc của một lớp **minh bạch, hiện rõ trong chữ ký**, dễ kiểm thử hơn, và không làm lớp phụ thuộc ngược vào một "bộ định vị" toàn cục.

</details>

**10. Tình huống: bạn cần đổi từ `CardPayment` sang `PayPalPayment` cho một số khách hàng cụ thể (theo cấu hình), mà không sửa code của `OrderService`. DI giúp gì ở đây?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `OrderService` chỉ phụ thuộc vào **abstraction** `PaymentService` (không phụ thuộc lớp cụ thể), việc đổi cài đặt chỉ đơn giản là **tiêm một implementation khác** vào lúc khởi tạo — hoàn toàn không cần sửa `OrderService`:

```java
PaymentService phuongThuc = khachHang.dungPayPal()
    ? new PayPalPayment()
    : new CardPayment();

OrderService dichVu = new OrderService(phuongThuc); // Tiêm đúng cài đặt theo điều kiện
```

- Với Spring, việc này thường được làm gọn hơn bằng cách khai báo nhiều bean cùng implement một interface, dùng `@Qualifier` hoặc cấu hình `@Profile`/`@ConditionalOnProperty` để chọn bean phù hợp theo môi trường/cấu hình, mà code nghiệp vụ (`OrderService`) không hề thay đổi.
- Đây chính là giá trị cốt lõi của DI: **thay đổi hành vi bằng cách thay đổi thứ được tiêm vào**, không phải sửa logic bên trong lớp dùng nó.

</details>
