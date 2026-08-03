---
sidebar_position: 5
title: "5. Xử lý ngoại lệ (Exception)"
---

# Xử lý ngoại lệ (Exception)

> Tổng hợp các câu hỏi phỏng vấn thường gặp về xử lý ngoại lệ (exception handling) trong Java cho vị trí thực tập. Đây là chủ đề "kinh điển", gần như buổi phỏng vấn intern nào cũng hỏi, đặc biệt là `NullPointerException` và sự khác nhau giữa checked vs unchecked exception.

:::note[Ghi nhớ nhanh]

- ⭐ **`Error` vs `Exception`** — cả hai kế thừa `Throwable`; `Error` là lỗi JVM nghiêm trọng (không nên bắt), `Exception` là tình huống bất thường có thể xử lý được.
- ⭐ **Checked vs Unchecked** — checked (vd `IOException`) buộc phải `try/catch` hoặc `throws` lúc biên dịch; unchecked (vd `NullPointerException`) là lỗi logic runtime, không bắt buộc.
- **`try / catch / finally`** — `finally` gần như **luôn chạy** (dọn tài nguyên), kể cả khi có exception hay `return`.
- **`throw` vs `throws`** — `throw` là ném một exception cụ thể; `throws` khai báo method có thể ném exception.
- **`NullPointerException`** — do gọi method/thuộc tính trên tham chiếu null; phòng tránh bằng kiểm tra null hoặc `Optional`.
- **`try-with-resources`** — tự động đóng tài nguyên (implement `AutoCloseable`), gọn và an toàn hơn đóng thủ công trong `finally`.

:::

---

## Câu 1: Exception (ngoại lệ) là gì? Error và Exception khác nhau thế nào? `[Basic]`

### Câu hỏi

Hãy giải thích khái niệm exception trong Java và phân biệt giữa `Error` và `Exception`.

### Giải thích lý thuyết

**Exception (ngoại lệ)** là một sự kiện bất thường xảy ra trong quá trình chương trình đang chạy, làm gián đoạn luồng thực thi (flow) bình thường của chương trình. Ví dụ: chia cho 0, truy cập phần tử ngoài phạm vi mảng, đọc file không tồn tại...

Trong Java, mọi lỗi đều kế thừa từ lớp `Throwable`. `Throwable` có 2 nhánh con chính:

- **`Error`**: lỗi nghiêm trọng liên quan đến chính môi trường chạy (JVM), thường **không thể** và **không nên** xử lý bằng code. Ví dụ: `OutOfMemoryError` (hết bộ nhớ), `StackOverflowError` (tràn ngăn xếp do đệ quy vô hạn).
- **`Exception`**: các tình huống bất thường mà chương trình **có thể** dự đoán và xử lý (recover) được. Ví dụ: `IOException`, `NullPointerException`.

### Code minh hoạ

```java
public class ExceptionVsError {
    public static void main(String[] args) {
        // Exception: có thể bắt và xử lý được
        try {
            int ketQua = 10 / 0; // Ném ArithmeticException
        } catch (ArithmeticException e) {
            System.out.println("Bắt được exception: " + e.getMessage());
        }

        // Error: thường do JVM, không nên cố gắng xử lý
        // Ví dụ StackOverflowError do đệ quy vô hạn
        // deQuyVoHan(); // sẽ gây StackOverflowError
    }

    // Phương thức tự gọi chính nó mãi -> tràn ngăn xếp
    static void deQuyVoHan() {
        deQuyVoHan();
    }
}
```

### Đáp án mẫu

Exception là sự kiện bất thường làm gián đoạn luồng chạy bình thường của chương trình. Trong Java tất cả đều kế thừa từ `Throwable`, gồm 2 nhánh: `Error` là lỗi nghiêm trọng của JVM như hết bộ nhớ, tràn stack, không nên xử lý; còn `Exception` là các tình huống mà chương trình có thể bắt và xử lý được như đọc file lỗi hay truy cập null. Khi phỏng vấn em chỉ cần nhớ: Error thì để mặc kệ, Exception thì xử lý được.

---

## Câu 2: Checked exception và Unchecked exception khác nhau thế nào? `[Intermediate]`

### Câu hỏi

Phân biệt checked exception và unchecked (runtime) exception. Cho ví dụ mỗi loại. (Đây là câu **hay được hỏi** nhất ở vị trí intern.)

### Giải thích lý thuyết

Nhánh `Exception` lại chia thành 2 nhóm:

**1. Checked exception (ngoại lệ được kiểm tra lúc biên dịch)**
- Được trình biên dịch (compiler) kiểm tra **tại thời điểm compile**.
- Bắt buộc phải xử lý bằng `try-catch` hoặc khai báo `throws`, nếu không code sẽ **không biên dịch được**.
- Kế thừa từ `Exception` (nhưng KHÔNG kế thừa từ `RuntimeException`).
- Ví dụ: `IOException`, `FileNotFoundException`, `SQLException`.

**2. Unchecked exception (ngoại lệ runtime)**
- Xảy ra **lúc chạy (runtime)**, compiler **không** ép buộc xử lý.
- Kế thừa từ `RuntimeException`.
- Thường do lỗi logic của lập trình viên gây ra.
- Ví dụ: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `ArithmeticException`, `NumberFormatException`.

### Code minh hoạ

```java
import java.io.FileReader;
import java.io.IOException;

public class CheckedVsUnchecked {

    // Checked: BẮT BUỘC khai báo throws hoặc try-catch, nếu không sẽ lỗi compile
    static void docFile() throws IOException {
        FileReader reader = new FileReader("data.txt"); // có thể ném IOException
        reader.close();
    }

    // Unchecked: KHÔNG cần khai báo gì, compiler vẫn cho qua
    static void chiaSo() {
        int a = 10 / 0; // Ném ArithmeticException (runtime) khi chạy tới đây
    }

    public static void main(String[] args) {
        // Phải xử lý checked exception
        try {
            docFile();
        } catch (IOException e) {
            System.out.println("Lỗi đọc file: " + e.getMessage());
        }
    }
}
```

### Đáp án mẫu

Checked exception được compiler kiểm tra lúc biên dịch, bắt buộc phải `try-catch` hoặc `throws`, nếu không thì không compile được; ví dụ `IOException`, `SQLException`. Còn unchecked exception (kế thừa `RuntimeException`) xảy ra lúc chạy, compiler không bắt buộc xử lý, thường do lỗi logic của lập trình viên; ví dụ `NullPointerException`, `ArrayIndexOutOfBoundsException`. Cách nhớ nhanh: cứ kế thừa từ `RuntimeException` thì là unchecked, còn lại là checked.

---

## Câu 3: try / catch / finally hoạt động thế nào? `finally` có luôn chạy không? `[Basic]`

### Câu hỏi

Giải thích cơ chế hoạt động của khối `try`, `catch`, `finally`. Khối `finally` có phải lúc nào cũng được thực thi không?

### Giải thích lý thuyết

- **`try`**: chứa đoạn code có khả năng ném ra exception.
- **`catch`**: bắt và xử lý exception khi nó xảy ra. Một `try` có thể có nhiều `catch` cho các loại exception khác nhau (bắt từ cụ thể đến tổng quát).
- **`finally`**: khối code **luôn được thực thi** dù có exception hay không, thường dùng để dọn dẹp tài nguyên (đóng file, đóng kết nối).

`finally` chạy trong cả 3 trường hợp: code chạy bình thường, có exception bị bắt, hoặc thậm chí có `return` trong `try`/`catch`. **Ngoại lệ hiếm gặp**: `finally` sẽ KHÔNG chạy nếu gọi `System.exit()` hoặc JVM bị tắt đột ngột.

### Code minh hoạ

```java
public class TryCatchFinally {
    public static void main(String[] args) {
        try {
            int[] mang = {1, 2, 3};
            System.out.println(mang[5]); // Ném ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Truy cập ngoài phạm vi mảng!");
        } finally {
            // Luôn chạy dù có lỗi hay không
            System.out.println("Khối finally luôn được thực thi.");
        }

        System.out.println("Ket qua: " + test());
    }

    static int test() {
        try {
            return 1; // dù có return ở đây
        } finally {
            System.out.println("Finally vẫn chạy trước khi return thực sự!");
        }
    }
}
```

### Đáp án mẫu

`try` chứa code có thể gây lỗi, `catch` bắt và xử lý exception tương ứng, còn `finally` là khối luôn chạy dù có lỗi hay không, dùng để dọn dẹp tài nguyên như đóng file. Quan trọng: `finally` chạy cả khi trong `try` có lệnh `return`. Trường hợp duy nhất `finally` không chạy là khi gọi `System.exit()` hoặc JVM tắt đột ngột.

---

## Câu 4: `throw` và `throws` khác nhau thế nào? `[Basic]`

### Câu hỏi

Phân biệt từ khóa `throw` và `throws` trong Java. (Hai từ này **rất dễ nhầm** vì viết gần giống nhau.)

### Giải thích lý thuyết

- **`throw`** (không có "s"): dùng để **ném ra một đối tượng exception cụ thể** ngay tại chỗ. Đặt bên trong thân phương thức. Theo sau `throw` là một đối tượng exception (ví dụ `throw new IllegalArgumentException(...)`).
- **`throws`** (có "s"): dùng trong **phần khai báo (signature) của phương thức** để báo rằng phương thức này *có thể* ném ra loại exception nào, đẩy trách nhiệm xử lý cho nơi gọi nó. Theo sau `throws` là **tên (các) lớp exception**.

Cách nhớ: `throw` = hành động ném ra; `throws` = lời cảnh báo trên chữ ký hàm.

### Code minh hoạ

```java
public class ThrowVsThrows {

    // throws: khai báo phương thức CÓ THỂ ném ra Exception
    static void kiemTraTuoi(int tuoi) throws IllegalAccessException {
        if (tuoi < 18) {
            // throw: ném ra một đối tượng exception cụ thể ngay tại đây
            throw new IllegalAccessException("Tuổi phải >= 18");
        }
        System.out.println("Hợp lệ, tuổi = " + tuoi);
    }

    public static void main(String[] args) {
        try {
            kiemTraTuoi(15);
        } catch (IllegalAccessException e) {
            System.out.println("Bắt được: " + e.getMessage());
        }
    }
}
```

### Đáp án mẫu

`throw` (không có "s") là lệnh ném ra một đối tượng exception cụ thể, dùng bên trong thân hàm, ví dụ `throw new RuntimeException(...)`. Còn `throws` (có "s") đặt trên chữ ký phương thức để khai báo phương thức đó có thể ném ra những loại exception nào, đẩy việc xử lý cho nơi gọi. Tóm lại: `throw` là ném thật, `throws` là cảnh báo.

---

## Câu 5: `NullPointerException` là gì? Nguyên nhân thường gặp và cách tránh? `[Basic]`

### Câu hỏi

`NullPointerException` (NPE) là gì? Liệt kê các nguyên nhân thường gặp và cách phòng tránh. (Câu này **cực kỳ hay hỏi** với intern vì NPE là lỗi phổ biến nhất.)

### Giải thích lý thuyết

`NullPointerException` là một unchecked exception, xảy ra khi chương trình cố gắng **sử dụng một tham chiếu (reference) đang mang giá trị `null`** như thể nó trỏ tới một đối tượng thật.

Các nguyên nhân thường gặp:
- Gọi phương thức trên biến `null`: `chuoi.length()` khi `chuoi == null`.
- Truy cập thuộc tính của đối tượng `null`.
- Tự động unboxing một `Integer` đang `null` về `int`.
- Trả về `null` từ một phương thức rồi dùng tiếp mà không kiểm tra.

Cách phòng tránh:
- Kiểm tra `null` trước khi dùng (`if (x != null)`).
- Dùng `Optional` (Java 8+) thay vì trả về `null`.
- So sánh chuỗi hằng đặt trước: `"abc".equals(bien)` thay vì `bien.equals("abc")`.
- Khởi tạo giá trị mặc định, tránh để biến `null`.

### Code minh hoạ

```java
import java.util.Optional;

public class NullPointerDemo {
    public static void main(String[] args) {
        String ten = null;

        // SAI: gây NullPointerException vì ten đang là null
        // System.out.println(ten.length());

        // ĐÚNG 1: kiểm tra null trước khi dùng
        if (ten != null) {
            System.out.println(ten.length());
        } else {
            System.out.println("ten đang null, bỏ qua");
        }

        // ĐÚNG 2: đặt hằng số trước để tránh NPE khi so sánh
        System.out.println("hello".equals(ten)); // an toàn, in ra false

        // ĐÚNG 3: dùng Optional để diễn đạt "có thể không có giá trị"
        Optional<String> tenOpt = Optional.ofNullable(ten);
        System.out.println(tenOpt.orElse("Khách")); // in ra "Khách"
    }
}
```

### Đáp án mẫu

`NullPointerException` xảy ra khi mình cố dùng một biến đang mang giá trị `null` như một đối tượng thật, ví dụ gọi `chuoi.length()` khi `chuoi` là null. Nguyên nhân hay gặp là quên kiểm tra null, hoặc unboxing `Integer` null về `int`. Để tránh thì em kiểm tra null trước khi dùng, dùng `Optional` thay cho trả về null, và khi so sánh chuỗi thì đặt hằng số trước như `"abc".equals(bien)`.

---

## Câu 6: Làm sao để tự tạo một exception (custom exception)? `[Intermediate]`

### Câu hỏi

Khi nào cần tự tạo exception riêng và cách tạo custom exception trong Java như thế nào?

### Giải thích lý thuyết

Đôi khi các exception có sẵn của Java không diễn tả đúng lỗi nghiệp vụ (business logic) của ứng dụng. Khi đó ta tạo custom exception để code rõ ràng và dễ xử lý hơn (ví dụ `InsufficientBalanceException` cho lỗi không đủ số dư).

Cách tạo:
- Kế thừa từ `Exception` → trở thành **checked exception** (bắt buộc xử lý).
- Kế thừa từ `RuntimeException` → trở thành **unchecked exception** (không bắt buộc xử lý).

Nên cung cấp constructor nhận thông điệp (message) và gọi `super(message)` để truyền cho lớp cha. Việc chọn kế thừa từ `Exception` hay `RuntimeException` tùy vào: nếu muốn ép nơi gọi phải xử lý thì dùng `Exception`, ngược lại dùng `RuntimeException`.

### Code minh hoạ

```java
// Tự tạo exception cho nghiệp vụ "không đủ số dư"
// Kế thừa Exception -> là checked exception
class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(String message) {
        super(message); // truyền thông điệp cho lớp cha
    }
}

public class CustomExceptionDemo {

    static void rutTien(double soDu, double soTien) throws InsufficientBalanceException {
        if (soTien > soDu) {
            throw new InsufficientBalanceException(
                "Số dư không đủ. Số dư: " + soDu + ", yêu cầu: " + soTien);
        }
        System.out.println("Rút thành công " + soTien);
    }

    public static void main(String[] args) {
        try {
            rutTien(100, 500); // số tiền > số dư -> ném exception
        } catch (InsufficientBalanceException e) {
            System.out.println("Lỗi: " + e.getMessage());
        }
    }
}
```

### Đáp án mẫu

Khi exception có sẵn không diễn tả đúng lỗi nghiệp vụ, mình tự tạo exception riêng bằng cách kế thừa `Exception` (nếu muốn nó là checked, bắt buộc xử lý) hoặc `RuntimeException` (nếu muốn unchecked). Trong lớp con mình tạo constructor nhận message rồi gọi `super(message)`. Sau đó dùng `throw new TenException(...)` để ném ra. Việc này giúp code rõ ràng hơn, ví dụ `InsufficientBalanceException` đọc là biết ngay lỗi gì.

---

## Câu 7: `try-with-resources` là gì? Vì sao tốt hơn `finally` khi đóng tài nguyên? `[Intermediate]`

### Câu hỏi

Giải thích `try-with-resources` (Java 7+) và ưu điểm của nó so với việc đóng tài nguyên thủ công trong khối `finally`.

### Giải thích lý thuyết

`try-with-resources` là cú pháp khai báo tài nguyên (resource) ngay trong dấu ngoặc của `try`. Sau khi khối `try` kết thúc (dù thành công hay có exception), Java sẽ **tự động gọi `close()`** để đóng tài nguyên.

Điều kiện: tài nguyên phải triển khai interface `AutoCloseable` (hầu hết các lớp như `FileReader`, `BufferedReader`, `Connection` đều có).

Ưu điểm so với `finally` thủ công:
- **Ngắn gọn hơn**: không cần viết khối `finally` để gọi `close()`.
- **An toàn hơn**: tránh quên đóng tài nguyên gây rò rỉ (resource leak).
- **Tự đóng đúng thứ tự** và xử lý cả trường hợp `close()` cũng ném exception (gọi là suppressed exception), trong khi viết `finally` thủ công dễ làm mất exception gốc.

### Code minh hoạ

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class TryWithResourcesDemo {

    // CÁCH CŨ: dùng finally để đóng thủ công -> dài và dễ quên
    static void cachCu() throws IOException {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader("data.txt"));
            System.out.println(reader.readLine());
        } finally {
            if (reader != null) {
                reader.close(); // phải tự nhớ đóng
            }
        }
    }

    // CÁCH MỚI: try-with-resources -> tự động đóng reader
    static void cachMoi() throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
            System.out.println(reader.readLine());
        } // reader.close() được gọi tự động ở đây
    }

    public static void main(String[] args) {
        // Gọi minh hoạ (giả định có file data.txt)
    }
}
```

### Đáp án mẫu

`try-with-resources` cho phép khai báo tài nguyên ngay trong ngoặc của `try`, và Java sẽ tự động gọi `close()` khi kết thúc, miễn là tài nguyên đó triển khai `AutoCloseable`. So với việc đóng thủ công trong `finally` thì nó ngắn gọn hơn, an toàn hơn vì không lo quên đóng gây rò rỉ tài nguyên, và xử lý tốt cả khi `close()` cũng ném exception. Đây là cách được khuyên dùng từ Java 7 trở đi khi làm việc với file hay kết nối.
