---
sidebar_position: 3
title: "3. Thao tác với File"
---

# 3. Thao tác với File

Thao tác với file là việc đọc và ghi dữ liệu xuống ổ cứng để lưu trữ lâu dài, không bị mất khi tắt chương trình. Java cho phép tạo, đọc, ghi, xóa file với cả cách cũ (`File`) lẫn cách mới gọn gàng hơn (`Path` và `Files`). Đây là kỹ năng nền tảng khi bạn cần lưu cấu hình, ghi log hay xử lý dữ liệu từ file.

---

## Mục lục

- [Vì sao cần thao tác với file?](#vì-sao-cần-thao-tác-với-file)
- [Lớp File (cách cũ)](#lớp-file-cách-cũ)
- [java.nio.file: Path và Files (cách mới)](#javaniofile-path-và-files-cách-mới)
- [Kiểm tra tồn tại, tạo, xóa file](#kiểm-tra-tồn-tại-tạo-xóa-file)
- [Đọc file với Files.readAllLines](#đọc-file-với-filesreadalllines)
- [Ghi file với Files.write](#ghi-file-với-fileswrite)
- [try-with-resources khi xử lý file lớn](#try-with-resources-khi-xử-lý-file-lớn)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần thao tác với file?

File là cách lưu trữ dữ liệu **lâu dài** trên ổ cứng. Khi tắt chương trình, dữ liệu trong bộ nhớ (RAM) mất hết, nhưng dữ liệu trong file vẫn còn.

Ví dụ đời thường: ghi danh sách công việc vào file `todo.txt`, lần sau mở lại vẫn đọc được.

Java có hai cách làm việc với file:
- **Cách cũ**: lớp `File` (gói `java.io`) — có từ rất sớm, hơi cồng kềnh.
- **Cách mới (khuyên dùng)**: `java.nio.file` với `Path` và `Files` — gọn gàng, mạnh mẽ hơn, có từ Java 7.

---

## Lớp File (cách cũ)

Lớp **`File`** đại diện cho **đường dẫn** tới một file hoặc thư mục (không phải nội dung file).

```java
import java.io.File;

public class FileClassDemo {
    public static void main(String[] args) {
        // Tạo đối tượng File trỏ tới đường dẫn (chưa tạo file thật)
        File file = new File("ghichu.txt");

        // Một số phương thức kiểm tra thông tin
        System.out.println("Tồn tại? " + file.exists());        // file có tồn tại không
        System.out.println("Là file? " + file.isFile());        // có phải file không
        System.out.println("Là thư mục? " + file.isDirectory()); // có phải thư mục không
        System.out.println("Tên: " + file.getName());           // tên file
        System.out.println("Đường dẫn tuyệt đối: " + file.getAbsolutePath());
    }
}
```

Cách cũ này vẫn dùng được, nhưng để **đọc/ghi nội dung** thì cách mới tiện hơn nhiều.

---

## java.nio.file: Path và Files (cách mới)

- **`Path`** (đường dẫn): đại diện cho vị trí của file/thư mục. Thay thế cho `File` ở cách mới.
- **`Files`**: lớp tiện ích chứa nhiều phương thức tĩnh (static) để đọc, ghi, sao chép, xóa file một cách ngắn gọn.

```java
import java.nio.file.Path;
import java.nio.file.Paths;

public class PathDemo {
    public static void main(String[] args) {
        // Tạo một Path từ chuỗi đường dẫn
        Path path = Paths.get("ghichu.txt");

        System.out.println("Tên file: " + path.getFileName());      // ghichu.txt
        System.out.println("Đường dẫn tuyệt đối: " + path.toAbsolutePath());

        // Nối đường dẫn an toàn (không cần tự ghép dấu "/")
        Path conPath = Paths.get("data").resolve("users.txt");
        System.out.println(conPath); // data/users.txt (hoặc data\users.txt trên Windows)
    }
}
```

> **Mẹo**: `Paths.get(...)` tạo `Path`. Từ Java 11 có thể viết gọn `Path.of(...)`.

---

## Kiểm tra tồn tại, tạo, xóa file

Lớp `Files` cung cấp các phương thức rõ ràng cho từng việc.

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

public class FileCreateDelete {
    public static void main(String[] args) {
        Path path = Path.of("test.txt");

        try {
            // Kiểm tra tồn tại trước khi tạo để tránh lỗi
            if (!Files.exists(path)) {
                Files.createFile(path); // Tạo file rỗng
                System.out.println("Đã tạo file: " + path);
            } else {
                System.out.println("File đã tồn tại.");
            }

            // Xóa file. deleteIfExists trả về true nếu xóa được
            boolean daXoa = Files.deleteIfExists(path);
            System.out.println("Đã xóa? " + daXoa);

        } catch (IOException e) {
            System.err.println("Lỗi thao tác file: " + e.getMessage());
        }
    }
}
```

Tạo thư mục:

```java
// Tạo một thư mục (kể cả các thư mục cha nếu chưa có)
Files.createDirectories(Path.of("data/2026/06"));
```

---

## Đọc file với Files.readAllLines

Với file văn bản **nhỏ**, cách đọc nhanh gọn nhất là `Files.readAllLines()` — đọc tất cả các dòng vào một `List<String>`.

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.List;

public class ReadAllLinesDemo {
    public static void main(String[] args) {
        Path path = Path.of("ghichu.txt");

        try {
            // Đọc toàn bộ file thành danh sách các dòng
            List<String> cacDong = Files.readAllLines(path);

            for (int i = 0; i < cacDong.size(); i++) {
                System.out.println("Dòng " + (i + 1) + ": " + cacDong.get(i));
            }
        } catch (IOException e) {
            System.err.println("Không đọc được file: " + e.getMessage());
        }
    }
}
```

> **Cảnh báo**: `readAllLines()` nạp **cả file** vào bộ nhớ. Với file rất lớn (hàng GB) sẽ tốn RAM — khi đó dùng `BufferedReader` đọc từng dòng (xem bài I/O).

---

## Ghi file với Files.write

`Files.write()` ghi dữ liệu ra file chỉ trong một dòng.

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.io.IOException;
import java.util.List;

public class WriteFileDemo {
    public static void main(String[] args) {
        Path path = Path.of("danhsach.txt");
        List<String> noiDung = List.of("Táo", "Cam", "Chuối");

        try {
            // Ghi đè: nếu file đã có, nội dung cũ bị thay thế
            Files.write(path, noiDung);
            System.out.println("Đã ghi file.");

            // Ghi thêm (append) vào cuối file thay vì ghi đè
            Files.write(path, List.of("Xoài"), StandardOpenOption.APPEND);
            System.out.println("Đã thêm dòng mới.");

        } catch (IOException e) {
            System.err.println("Lỗi khi ghi file: " + e.getMessage());
        }
    }
}
```

Ghi một chuỗi duy nhất (Java 11+):

```java
// Cách ngắn nhất để ghi một chuỗi ra file
Files.writeString(Path.of("hello.txt"), "Xin chào!");
```

---

## try-with-resources khi xử lý file lớn

Khi đọc file lớn theo dòng, kết hợp `Files.newBufferedReader()` với **try-with-resources** để vừa tiết kiệm bộ nhớ vừa tự đóng tài nguyên.

```java
import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

public class ReadLargeFile {
    public static void main(String[] args) {
        Path path = Path.of("file-lon.txt");

        // try-with-resources: reader tự đóng khi khối try kết thúc
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String dong;
            while ((dong = reader.readLine()) != null) {
                // Xử lý từng dòng mà không nạp cả file vào RAM
                System.out.println(dong);
            }
        } catch (IOException e) {
            System.err.println("Lỗi khi đọc file lớn: " + e.getMessage());
        }
    }
}
```

---

## Lỗi thường gặp

1. **Nhầm `File`/`Path` với nội dung file**: `File` và `Path` chỉ là **đường dẫn**, không phải dữ liệu bên trong.
2. **Quên kiểm tra `Files.exists()`**: Gọi `createFile` khi file đã tồn tại sẽ ném `FileAlreadyExistsException`.
3. **Dùng `readAllLines()` cho file khổng lồ**: Tốn RAM, dễ tràn bộ nhớ. Hãy đọc theo dòng.
4. **Đường dẫn cứng (hardcode) theo hệ điều hành**: Đừng viết `"C:\\data\\file.txt"`. Dùng `Path.of(...)` và `resolve()` để chạy được trên mọi hệ điều hành.
5. **Không xử lý `IOException`**: Mọi thao tác file đều có thể lỗi; phải bắt ngoại lệ.

---

## Tóm tắt

- Cách mới **`java.nio.file`** với `Path` và `Files` gọn và mạnh hơn lớp `File` cũ.
- **`Files.exists()`**, **`Files.createFile()`**, **`Files.deleteIfExists()`** để kiểm tra/tạo/xóa.
- **`Files.readAllLines()`** đọc nhanh file nhỏ; **`Files.write()`** / **`Files.writeString()`** ghi nhanh.
- Với file lớn, dùng `Files.newBufferedReader()` trong **try-with-resources** để tiết kiệm bộ nhớ.
- Luôn dùng `Path.of(...)` thay vì ghép đường dẫn thủ công để chạy đa nền tảng.
