---
sidebar_position: 1
title: "1. Exception Handling (Xử lý ngoại lệ)"
---

# Exception Handling -- Xử lý ngoại lệ trong Java

Trong khi viết chương trình, sẽ có những tình huống "bất ngờ" xảy ra: chia cho 0, đọc file không tồn tại, truy cập phần tử mảng vượt giới hạn, mất kết nối mạng... Những tình huống đó gọi là **exception** (ngoại lệ). Nếu không xử lý, chương trình sẽ **crash** -- dừng đột ngột và làm phiền người dùng.

**Tương tự đơn giản:** Hãy tưởng tượng bạn đang đi xe máy. Có thể gặp các tình huống bất ngờ: hết xăng, thủng lốp, kẹt xe. Một người lái xe giỏi sẽ **chuẩn bị trước** -- mang theo dụng cụ vá xe, có kế hoạch dự phòng. **Exception Handling** chính là "kế hoạch dự phòng" của chương trình.

---

## Mục lục

- [1. Exception là gì?](#1-exception-là-gì)
- [2. Phân loại Exception](#2-phân-loại-exception)
- [3. Try - Catch - Finally](#3-try---catch---finally)
- [4. Throw và Throws](#4-throw-và-throws)
- [5. Custom Exception](#5-custom-exception)
- [6. Try-with-resources](#6-try-with-resources)
- [7. Multi-catch (từ Java 7)](#7-multi-catch-từ-java-7)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Exception là gì?

**Exception** là một **đối tượng** đại diện cho lỗi hoặc tình huống bất thường xảy ra trong quá trình chạy chương trình. Khi exception xảy ra mà không được xử lý, JVM sẽ in **stack trace** (dấu vết lỗi) và dừng chương trình.

```java
public class ExceptionDemo {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3};
        System.out.println(arr[10]); // Loi: ArrayIndexOutOfBoundsException
        System.out.println("Dong nay khong duoc chay");
    }
}
```

Kết quả:

```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 10 out of bounds for length 3
    at ExceptionDemo.main(ExceptionDemo.java:4)
```

### Cây phân cấp Exception

```
Throwable
├── Error           (Loi he thong, khong nen catch)
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception
    ├── RuntimeException    (Unchecked Exception)
    │   ├── NullPointerException
    │   ├── ArithmeticException
    │   └── IllegalArgumentException
    └── (Checked Exception)
        ├── IOException
        └── SQLException
```

**Giải thích thuật ngữ:**

- **Throwable:** Lớp cha của tất cả lỗi/ngoại lệ trong Java
- **Error:** Lỗi nghiêm trọng từ JVM (như hết RAM), không nên `catch`
- **Exception:** Ngoại lệ ở mức ứng dụng, có thể xử lý được

---

## 2. Phân loại Exception

### 2.1. Checked Exception (Ngoại lệ kiểm tra lúc compile)

Là exception **bắt buộc phải xử lý** -- nếu không sẽ lỗi compile. Đại diện cho lỗi mà chương trình **có thể dự đoán trước** (file không tồn tại, mất kết nối...).

```java
import java.io.FileReader;
import java.io.IOException;

public class CheckedDemo {
    public static void main(String[] args) {
        try {
            FileReader fr = new FileReader("khong-ton-tai.txt");
        } catch (IOException e) {
            System.out.println("Khong doc duoc file: " + e.getMessage());
        }
    }
}
```

Ví dụ: `IOException`, `SQLException`, `ClassNotFoundException`, `FileNotFoundException`.

### 2.2. Unchecked Exception (RuntimeException)

Không bắt buộc xử lý, thường do **lỗi lập trình** -- truy cập null, chia cho 0, sai index...

```java
public class UncheckedDemo {
    public static void main(String[] args) {
        String s = null;
        System.out.println(s.length()); // NullPointerException
    }
}
```

Ví dụ: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `ArithmeticException`, `ClassCastException`.

### So sánh

| Đặc điểm           | Checked Exception           | Unchecked Exception          |
| ------------------ | --------------------------- | ---------------------------- |
| Kiểm tra compile?  | Có                          | Không                        |
| Bắt buộc xử lý?    | Có (try-catch hoặc throws)  | Không                        |
| Khi nào xảy ra?    | Lỗi ngoài dự kiến của user  | Lỗi lập trình                |
| Ví dụ              | `IOException`, `SQLException` | `NullPointerException`     |

---

## 3. Try - Catch - Finally

Khối `try-catch` là cách phổ biến nhất để xử lý exception.

```java
public class TryCatchDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0; // Phat sinh ArithmeticException
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Khong the chia cho 0!");
        } finally {
            System.out.println("Khoi finally luon chay");
        }
    }
}
```

### Vai trò từng khối

- **`try`:** Bọc đoạn code có thể phát sinh exception
- **`catch`:** Bắt và xử lý exception cụ thể
- **`finally`:** Luôn chạy (kể cả khi có lỗi hay return), thường dùng để giải phóng tài nguyên

### Thứ tự catch

Phải catch class con **trước**, class cha **sau** -- nếu không sẽ lỗi compile.

```java
try {
    // code
} catch (FileNotFoundException e) {   // Con
    // ...
} catch (IOException e) {              // Cha
    // ...
} catch (Exception e) {                // Tat ca
    // ...
}
```

---

## 4. Throw và Throws

### 4.1. `throw` -- Ném exception thủ công

```java
public class ThrowDemo {
    public static void kiemTraTuoi(int tuoi) {
        if (tuoi < 18) {
            throw new IllegalArgumentException("Tuoi phai >= 18");
        }
        System.out.println("Da du tuoi");
    }

    public static void main(String[] args) {
        kiemTraTuoi(15); // Nem exception
    }
}
```

### 4.2. `throws` -- Khai báo exception phương thức có thể ném

Dùng khi **không muốn xử lý ngay** mà đẩy lên cho hàm gọi.

```java
import java.io.FileReader;
import java.io.IOException;

public class ThrowsDemo {
    public static void docFile(String path) throws IOException {
        FileReader fr = new FileReader(path);
        // ...
    }

    public static void main(String[] args) {
        try {
            docFile("data.txt");
        } catch (IOException e) {
            System.out.println("Loi: " + e.getMessage());
        }
    }
}
```

**Phân biệt:**

- `throw` (số ít): Ném 1 exception cụ thể
- `throws` (số nhiều): Khai báo trong signature

---

## 5. Custom Exception

Tự tạo exception riêng để **diễn tả nghiệp vụ** của ứng dụng.

```java
// Custom Exception (Checked)
public class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}

public class TaiKhoan {
    private double soDu;

    public TaiKhoan(double soDu) {
        this.soDu = soDu;
    }

    public void rutTien(double soTien) throws InsufficientBalanceException {
        if (soTien > soDu) {
            throw new InsufficientBalanceException(
                "So du khong du. So du hien tai: " + soDu
            );
        }
        soDu -= soTien;
        System.out.println("Rut thanh cong. Con lai: " + soDu);
    }

    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan(1_000_000);
        try {
            tk.rutTien(2_000_000);
        } catch (InsufficientBalanceException e) {
            System.out.println("Loi nghiep vu: " + e.getMessage());
        }
    }
}
```

**Lưu ý:** Nếu muốn Unchecked, kế thừa `RuntimeException` thay vì `Exception`.

---

## 6. Try-with-resources

Từ Java 7, có cú pháp **tự động đóng tài nguyên** -- không cần `finally` để gọi `close()`.

```java
import java.io.BufferedReader;
import java.io.FileReader;

public class TryWithResourcesDemo {
    public static void main(String[] args) {
        try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // br.close() duoc goi tu dong
    }
}
```

**Điều kiện:** Resource phải implement `AutoCloseable` (hầu hết I/O class đều có).

---

## 7. Multi-catch (từ Java 7)

Catch nhiều exception trong **một khối** nếu xử lý giống nhau:

```java
try {
    // code
} catch (IOException | SQLException e) {
    System.out.println("Loi I/O hoac SQL: " + e.getMessage());
}
```

---

## Khi nào dùng?

- **Dùng try-catch khi:** Có thể xử lý lỗi tại chỗ (log, retry, fallback)
- **Dùng throws khi:** Không phải vị trí thích hợp để xử lý, đẩy lên tầng trên (controller, main)
- **Custom Exception khi:** Cần thể hiện lỗi nghiệp vụ rõ ràng (`UserNotFoundException`, `PaymentFailedException`)
- **Best practice:**
  - Catch exception **cụ thể** thay vì `Exception` chung
  - Log đầy đủ (message + stack trace)
  - Không nuốt exception (catch rỗng)
  - Dùng `try-with-resources` cho mọi resource (file, DB, network)

---

## Lỗi thường gặp

### Lỗi 1: Nuốt exception (Empty catch block)

```java
// SAI -- nuot loi, debug rat kho
try {
    doSomething();
} catch (Exception e) {
    // im lang
}

// DUNG -- it nhat phai log
try {
    doSomething();
} catch (Exception e) {
    logger.error("Loi khi doSomething", e);
    throw new RuntimeException(e);
}
```

### Lỗi 2: Catch quá rộng

```java
// SAI -- bat het, kho biet loi gi
try {
    // code
} catch (Exception e) { ... }

// DUNG -- bat tung loai
try {
    // code
} catch (IOException e) { ... }
  catch (SQLException e) { ... }
```

### Lỗi 3: Quên đóng resource

```java
// SAI
FileReader fr = new FileReader("data.txt");
// neu loi xay ra, file khong dong --> resource leak

// DUNG
try (FileReader fr = new FileReader("data.txt")) {
    // ...
}
```

### Lỗi 4: Dùng exception cho luồng điều khiển

```java
// SAI -- dung exception nhu if-else
try {
    int x = Integer.parseInt(input);
} catch (NumberFormatException e) {
    x = 0;
}

// DUNG -- kiem tra truoc
if (input.matches("\\d+")) {
    int x = Integer.parseInt(input);
} else {
    x = 0;
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa Checked và Unchecked Exception?

**Trả lời:** **Checked Exception** kế thừa từ `Exception` (không phải `RuntimeException`), bắt buộc phải `try-catch` hoặc `throws` -- compiler sẽ kiểm tra. Đại diện cho lỗi có thể dự đoán (IO, SQL). **Unchecked Exception** kế thừa từ `RuntimeException`, không bắt buộc xử lý, thường do bug lập trình (NPE, AIOOBE).

### Câu 2: Khối `finally` có luôn được thực thi không?

**Trả lời:** Gần như luôn -- kể cả khi `try` có `return` hoặc throw exception. Trường hợp **không** chạy: `System.exit()` được gọi, JVM crash, hoặc thread bị kill.

### Câu 3: `throw` khác `throws` như thế nào?

**Trả lời:** `throw` là **statement** dùng để **ném** exception trong code (`throw new IOException(...)`). `throws` là **keyword** trong signature phương thức để **khai báo** exception có thể ném ra. Một dùng để thực thi, một dùng để khai báo.

### Câu 4: Có nên catch `Throwable` không?

**Trả lời:** **Không**. `Throwable` bao gồm cả `Error` (OutOfMemoryError, StackOverflowError) -- đây là lỗi nghiêm trọng từ JVM, ứng dụng không thể recover. Catch `Throwable` sẽ che giấu lỗi nghiêm trọng. Chỉ catch `Exception` hoặc cụ thể hơn.

### Câu 5: `try-with-resources` hoạt động như thế nào?

**Trả lời:** Khi resource implement `AutoCloseable`, Java tự động gọi `close()` ở cuối block, **ngay cả khi có exception**. Tương đương `try-finally` thủ công nhưng ngắn gọn và an toàn hơn (đảm bảo đóng theo thứ tự ngược). Hỗ trợ từ Java 7, từ Java 9 cho phép dùng biến đã khai báo bên ngoài.

### Câu 6: Best practice khi viết Custom Exception?

**Trả lời:**

- Đặt tên kết thúc bằng `Exception`
- Kế thừa từ `Exception` (checked) hoặc `RuntimeException` (unchecked) tùy mục đích
- Cung cấp ít nhất 2 constructor: `(String message)` và `(String message, Throwable cause)`
- Đặt trong package riêng (`com.app.exception`)
- Thể hiện rõ nghiệp vụ -- `OrderNotFoundException` rõ hơn `RuntimeException`
