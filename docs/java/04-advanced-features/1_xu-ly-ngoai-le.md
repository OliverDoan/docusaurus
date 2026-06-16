---
sidebar_position: 1
title: "1. Xử lý ngoại lệ (Exception Handling)"
---

# 1. Xử lý ngoại lệ (Exception Handling)

Ngoại lệ (exception) là những sự kiện bất thường xảy ra khi chương trình đang chạy, như chia cho 0 hay mở file không tồn tại. Nếu không xử lý, chương trình sẽ dừng đột ngột; vì vậy Java cung cấp cơ chế `try-catch-finally` để bắt và xử lý lỗi một cách an toàn. Bài này giới thiệu `try/catch/finally`, `throw`/`throws`, checked vs unchecked, tự tạo ngoại lệ và `try-with-resources`; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có xử lý ngoại lệ?](#vì-sao-có-xử-lý-ngoại-lệ)
- [Ngoại lệ (Exception) là gì?](#ngoại-lệ-exception-là-gì)
- [Khối try / catch / finally](#khối-try--catch--finally)
- [Ném ngoại lệ với throw](#ném-ngoại-lệ-với-throw)
- [Khai báo ngoại lệ với throws](#khai-báo-ngoại-lệ-với-throws)
- [Checked vs Unchecked Exception](#checked-vs-unchecked-exception)
- [Tự tạo ngoại lệ (Custom Exception)](#tự-tạo-ngoại-lệ-custom-exception)
- [try-with-resources](#try-with-resources)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có xử lý ngoại lệ?

**Vấn đề:** Nếu báo lỗi bằng **mã trả về**, code logic bị trộn lẫn với code kiểm lỗi ở mọi tầng. Lập trình viên rất dễ **quên kiểm tra** mã lỗi, khiến lỗi lan âm thầm làm sai dữ liệu hoặc sập app. Ngoài ra tài nguyên (file, connection) thường không được đóng khi có lỗi.

```java
// Báo lỗi bằng mã trả về: -1 nghĩa là lỗi
int docFile(String duongDan) {
    if (!fileTonTai(duongDan)) {
        return -1; // Lỗi: file không tồn tại
    }
    // ...đọc file...
    return 0; // Thành công
}

void xuLy() {
    int ma = docFile("data.txt");
    // QUÊN kiểm tra ma == -1 → lỗi lan âm thầm, dữ liệu sai
    int kt = ghiLog();   // tiếp tục dù bước trên đã lỗi
    int kt2 = guiEmail(); // mỗi lời gọi lại phải tự kiểm mã → code rối
}
```

**Giải pháp:** Java dùng cơ chế **exception**. `throw` ném lỗi ra, `try/catch/finally` tách luồng lỗi khỏi luồng chính; lỗi tự "nổi" lên đúng tầng biết cách xử lý. Java phân biệt **checked exception** (ép xử lý ngay lúc biên dịch) với **unchecked**, cho phép tạo **custom exception** để phân loại lỗi, và `try-with-resources` tự đóng tài nguyên.

```java
// Luồng chính sạch sẽ, luồng lỗi gom về một chỗ
void xuLy() {
    try {
        docFile("data.txt"); // nếu lỗi sẽ ném exception
        ghiLog();
        guiEmail();
    } catch (IOException e) {
        // Lỗi tự nổi lên đây, không thể bị quên
        System.out.println("Có lỗi: " + e.getMessage());
    }
}

// try-with-resources: tài nguyên tự đóng dù có lỗi hay không
void doc(String duongDan) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader(duongDan))) {
        System.out.println(br.readLine());
    } // br được đóng tự động
}
```

:::tip[Dùng thực tế]

- **Bọc đọc file / gọi DB:** đặt thao tác dễ lỗi trong `try`, bắt `IOException` hay `SQLException` để báo lại rõ ràng thay vì để app sập.
- **Ném lỗi nghiệp vụ riêng:** tạo `TaiKhoanKhongDuTienException` rồi `throw` khi số dư không đủ, giúp tầng trên phân biệt loại lỗi.
- **Đóng connection an toàn:** dùng `try-with-resources` cho `Connection`, `Statement` để chắc chắn tài nguyên được giải phóng kể cả khi có lỗi.
- **Gom xử lý lỗi tập trung:** để lỗi "nổi" lên một lớp xử lý chung (ví dụ middleware/controller) thay vì kiểm mã lỗi rải rác khắp nơi.

:::

---

## Ngoại lệ (Exception) là gì?

**Ngoại lệ (Exception — sự kiện bất thường)** là một tình huống xảy ra trong khi chương trình đang chạy mà làm gián đoạn luồng thực thi bình thường. Hãy tưởng tượng bạn đang lái xe theo một lộ trình đã định, nhưng đột nhiên gặp một cây cầu bị sập — bạn buộc phải dừng lại và tìm cách xử lý. Ngoại lệ trong lập trình cũng giống như vậy.

Một số ví dụ đời thường về ngoại lệ:

- Bạn chia một số cho 0 (toán học không cho phép).
- Bạn cố mở một file không tồn tại.
- Bạn truy cập phần tử thứ 10 của một mảng chỉ có 5 phần tử.

Nếu không xử lý, ngoại lệ sẽ khiến chương trình **dừng đột ngột (crash)** và in ra một thông báo lỗi khó hiểu.

```java
public class ViDuNgoaiLe {
    public static void main(String[] args) {
        int a = 10;
        int b = 0;
        // Phép chia cho 0 sẽ ném ra ngoại lệ ArithmeticException
        int ketQua = a / b; // Chương trình dừng tại đây
        System.out.println("Kết quả: " + ketQua); // Dòng này không bao giờ chạy
    }
}
```

Khi chạy, Java sẽ in ra: `Exception in thread "main" java.lang.ArithmeticException: / by zero`.

---

## Khối try / catch / finally

Để xử lý ngoại lệ một cách an toàn, Java cung cấp ba từ khóa:

- **`try`** (thử): đặt đoạn code có thể gây lỗi vào đây.
- **`catch`** (bắt): bắt và xử lý lỗi nếu xảy ra.
- **`finally`** (cuối cùng): code trong này **luôn luôn** chạy, dù có lỗi hay không.

```java
public class ViDuTryCatch {
    public static void main(String[] args) {
        try {
            // Khối "thử" - chứa code có thể gây lỗi
            int a = 10;
            int b = 0;
            int ketQua = a / b; // Sẽ ném ngoại lệ tại đây
            System.out.println("Kết quả: " + ketQua);
        } catch (ArithmeticException e) {
            // Khối "bắt" - chạy khi có lỗi ArithmeticException
            System.out.println("Không thể chia cho 0!");
            System.out.println("Chi tiết lỗi: " + e.getMessage());
        } finally {
            // Khối "cuối cùng" - LUÔN chạy dù có lỗi hay không
            System.out.println("Đã hoàn tất xử lý phép tính.");
        }

        System.out.println("Chương trình tiếp tục chạy bình thường.");
    }
}
```

Bạn có thể bắt nhiều loại ngoại lệ khác nhau bằng nhiều khối `catch`:

```java
try {
    int[] mang = {1, 2, 3};
    System.out.println(mang[5]); // Lỗi truy cập ngoài mảng
} catch (ArithmeticException e) {
    System.out.println("Lỗi tính toán");
} catch (ArrayIndexOutOfBoundsException e) {
    // Bắt riêng lỗi truy cập mảng ngoài phạm vi
    System.out.println("Truy cập phần tử không tồn tại trong mảng");
}
```

---

## Ném ngoại lệ với throw

Từ khóa **`throw`** (ném) dùng để **chủ động** tạo ra một ngoại lệ. Bạn dùng nó khi muốn báo hiệu rằng có điều gì đó sai trong logic của mình.

```java
public class ViDuThrow {
    // Kiểm tra tuổi, nếu không hợp lệ thì ném ngoại lệ
    static void kiemTraTuoi(int tuoi) {
        if (tuoi < 0) {
            // Chủ động ném ngoại lệ với thông báo rõ ràng
            throw new IllegalArgumentException("Tuổi không thể là số âm: " + tuoi);
        }
        System.out.println("Tuổi hợp lệ: " + tuoi);
    }

    public static void main(String[] args) {
        kiemTraTuoi(25); // Hợp lệ
        kiemTraTuoi(-5); // Ném ngoại lệ
    }
}
```

---

## Khai báo ngoại lệ với throws

Từ khóa **`throws`** (khai báo có thể ném) được đặt ở chữ ký phương thức (method signature) để báo cho người gọi biết rằng phương thức này **có thể** ném ra ngoại lệ. Người gọi buộc phải xử lý nó.

```java
import java.io.IOException;

public class ViDuThrows {
    // Khai báo rằng phương thức này có thể ném IOException
    static void docFile(String tenFile) throws IOException {
        if (tenFile == null) {
            throw new IOException("Tên file không hợp lệ");
        }
        System.out.println("Đang đọc file: " + tenFile);
    }

    public static void main(String[] args) {
        try {
            docFile(null);
        } catch (IOException e) {
            // Bắt buộc phải xử lý vì docFile khai báo throws IOException
            System.out.println("Lỗi khi đọc file: " + e.getMessage());
        }
    }
}
```

Phân biệt nhanh: `throw` thực sự **ném** một ngoại lệ ngay lập tức; còn `throws` chỉ **khai báo** rằng phương thức có khả năng ném.

---

## Checked vs Unchecked Exception

Java chia ngoại lệ thành hai nhóm chính:

### Checked Exception (ngoại lệ được kiểm tra lúc biên dịch)

- Trình biên dịch (compiler) **bắt buộc** bạn phải xử lý (dùng try-catch hoặc khai báo throws).
- Thường liên quan đến tài nguyên bên ngoài: file, mạng, database.
- Ví dụ: `IOException`, `SQLException`.

### Unchecked Exception (ngoại lệ không bắt buộc kiểm tra)

- Trình biên dịch **không** bắt buộc xử lý.
- Thường do lỗi lập trình: chia cho 0, truy cập null, vượt mảng.
- Kế thừa từ `RuntimeException`.
- Ví dụ: `NullPointerException`, `ArithmeticException`, `ArrayIndexOutOfBoundsException`.

```java
// Checked: BẮT BUỘC khai báo throws hoặc dùng try-catch
static void viDuChecked() throws java.io.IOException {
    throw new java.io.IOException("Lỗi đọc/ghi");
}

// Unchecked: KHÔNG bắt buộc xử lý (nhưng nên tránh để xảy ra)
static void viDuUnchecked() {
    String text = null;
    System.out.println(text.length()); // NullPointerException
}
```

---

## Tự tạo ngoại lệ (Custom Exception)

Đôi khi các ngoại lệ có sẵn không mô tả đúng vấn đề của bạn. Bạn có thể tạo ngoại lệ riêng bằng cách kế thừa `Exception` (checked) hoặc `RuntimeException` (unchecked).

```java
// Tự tạo ngoại lệ cho nghiệp vụ rút tiền ngân hàng
class SoDuKhongDuException extends Exception {
    public SoDuKhongDuException(String thongBao) {
        super(thongBao); // Gọi constructor của lớp cha để lưu thông báo
    }
}

class TaiKhoan {
    private double soDu = 100_000;

    // Phương thức rút tiền có thể ném ngoại lệ tùy chỉnh
    void rutTien(double soTien) throws SoDuKhongDuException {
        if (soTien > soDu) {
            throw new SoDuKhongDuException(
                "Số dư không đủ. Số dư hiện tại: " + soDu);
        }
        soDu -= soTien;
        System.out.println("Rút thành công. Số dư còn lại: " + soDu);
    }
}
```

---

## try-with-resources

**`try-with-resources`** là cú pháp đặc biệt giúp **tự động đóng** các tài nguyên (resource) như file, kết nối database sau khi dùng xong, kể cả khi có lỗi xảy ra. Tài nguyên phải triển khai interface `AutoCloseable`.

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ViDuTryWithResources {
    public static void main(String[] args) {
        // Tài nguyên khai báo trong dấu ngoặc sẽ tự động được đóng
        try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
            String dong = reader.readLine();
            System.out.println("Dòng đầu tiên: " + dong);
        } catch (IOException e) {
            System.out.println("Lỗi đọc file: " + e.getMessage());
        }
        // Không cần gọi reader.close() — Java tự đóng giúp bạn!
    }
}
```

So với cách cũ phải gọi `finally { reader.close(); }` thủ công, cách này gọn và an toàn hơn nhiều vì bạn không bao giờ quên đóng tài nguyên.

---

## Lỗi thường gặp

- **Bắt ngoại lệ rồi để trống (nuốt lỗi)**: viết `catch (Exception e) {}` mà không làm gì cả. Lỗi bị che giấu, cực kỳ khó debug. Luôn ghi log hoặc xử lý.
- **Bắt `Exception` quá chung chung**: nên bắt loại cụ thể (như `IOException`) để xử lý đúng cách.
- **Quên rằng `finally` luôn chạy**: nếu đặt `return` trong `finally`, nó có thể ghi đè giá trị trả về của `try`.
- **Dùng ngoại lệ cho luồng điều khiển thông thường**: ngoại lệ chỉ dành cho tình huống bất thường, không phải để thay thế `if-else`.
- **Quên đóng tài nguyên**: dùng `try-with-resources` thay vì đóng thủ công để tránh rò rỉ tài nguyên (resource leak).

---

## Tóm tắt

- **Ngoại lệ (Exception)** là sự kiện bất thường làm gián đoạn chương trình.
- **`try-catch-finally`**: thử code nguy hiểm, bắt lỗi, và chạy code dọn dẹp cuối cùng.
- **`throw`** chủ động ném ngoại lệ; **`throws`** khai báo phương thức có thể ném.
- **Checked exception** bắt buộc xử lý lúc biên dịch; **unchecked exception** thì không.
- Bạn có thể **tự tạo ngoại lệ** bằng cách kế thừa `Exception` hoặc `RuntimeException`.
- **`try-with-resources`** tự động đóng tài nguyên, giúp code an toàn và gọn gàng hơn.
