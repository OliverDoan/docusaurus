---
sidebar_position: 4
title: "Hướng dẫn sử dụng luồng vào ra ký tự trong Java - Character Stream"
---

# Hướng dẫn sử dụng luồng vào ra ký tự trong Java - Character Stream

Character Stream là loại luồng chuyên xử lý văn bản, đọc và ghi theo từng ký tự và tự động lo phần mã hóa (encoding). Nhờ vậy nó rất tiện khi làm việc với file văn bản như .txt, .csv hay .json, đặc biệt giúp tránh lỗi hiển thị tiếng Việt. Bài này hướng dẫn các lớp Character Stream thường dùng qua ví dụ cụ thể.

## Character Stream là gì?

**Character Stream** (luồng ký tự — luồng xử lý dữ liệu theo đơn vị 1 ký tự Unicode 16-bit) được thiết kế đặc biệt để xử lý văn bản. Khác với Byte Stream xử lý dữ liệu thô, Character Stream tự động xử lý **encoding** (mã hóa ký tự — cách chuyển đổi ký tự thành byte) và **decoding** (giải mã ký tự — cách chuyển đổi byte thành ký tự).

Hai lớp gốc trừu tượng:
- `Reader` — đọc ký tự
- `Writer` — ghi ký tự

---

## Các lớp Character Stream thường dùng

| Lớp | Mục đích |
|-----|---------|
| `FileReader` | Đọc ký tự từ file văn bản |
| `FileWriter` | Ghi ký tự vào file văn bản |
| `BufferedReader` | Bọc Reader, cung cấp bộ đệm và `readLine()` |
| `BufferedWriter` | Bọc Writer, cung cấp bộ đệm và `newLine()` |
| `InputStreamReader` | Cầu nối từ Byte Stream sang Character Stream |
| `OutputStreamWriter` | Cầu nối từ Character Stream sang Byte Stream |
| `StringReader` | Đọc ký tự từ chuỗi String |
| `StringWriter` | Ghi ký tự vào chuỗi String |
| `PrintWriter` | Ghi văn bản định dạng, hỗ trợ `println`, `printf` |

---

## FileReader và FileWriter

### Ghi văn bản vào file

```java
import java.io.FileWriter;
import java.io.IOException;

public class GhiVanBan {
    public static void main(String[] args) {
        // FileWriter(path, append): tham số append=true → nối tiếp thay vì ghi đè
        try (FileWriter fw = new FileWriter("bai-tho.txt", false)) {
            fw.write("Quê hương là chùm khế ngọt\n");
            fw.write("Cho con trèo hái mỗi ngày\n");
            fw.write("Quê hương là đường đi học\n");
            System.out.println("Ghi file thành công.");
        } catch (IOException e) {
            System.err.println("Lỗi ghi file: " + e.getMessage());
        }
    }
}
```

### Đọc văn bản từ file

```java
import java.io.FileReader;
import java.io.IOException;

public class DocVanBan {
    public static void main(String[] args) {
        try (FileReader fr = new FileReader("bai-tho.txt")) {
            int kyTu;
            StringBuilder nd = new StringBuilder();
            // read() trả về mã Unicode của ký tự, hoặc -1 khi hết file
            while ((kyTu = fr.read()) != -1) {
                nd.append((char) kyTu);
            }
            System.out.println("Nội dung:\n" + nd);
        } catch (IOException e) {
            System.err.println("Lỗi đọc file: " + e.getMessage());
        }
    }
}
```

---

## BufferedReader và BufferedWriter

**BufferedReader** (Reader có bộ đệm) cho phép đọc theo từng dòng với `readLine()`, rất hữu ích khi xử lý file văn bản.

### Ghi file với BufferedWriter

```java
import java.io.*;

public class GhiBuffered {
    public static void main(String[] args) {
        try (BufferedWriter bw = new BufferedWriter(
                new FileWriter("danh-sach.txt"))) {

            String[] tenSinhVien = {"An", "Bình", "Chi", "Dũng"};
            for (int i = 0; i < tenSinhVien.length; i++) {
                bw.write((i + 1) + ". " + tenSinhVien[i]);
                bw.newLine(); // Xuống dòng theo hệ điều hành (OS-independent)
            }
            System.out.println("Đã ghi danh sách.");
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

### Đọc file từng dòng với BufferedReader

```java
import java.io.*;

public class DocTungDong {
    public static void main(String[] args) {
        try (BufferedReader br = new BufferedReader(
                new FileReader("danh-sach.txt"))) {

            String dong;
            int soDong = 0;
            // readLine() trả về null khi hết file
            while ((dong = br.readLine()) != null) {
                soDong++;
                System.out.println("Dòng " + soDong + ": " + dong);
            }
            System.out.println("Tổng: " + soDong + " dòng.");
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## InputStreamReader — Kiểm soát Encoding

**InputStreamReader** (đọc stream đầu vào — cầu nối chuyển đổi byte stream sang character stream với encoding chỉ định) rất quan trọng khi file dùng encoding khác UTF-8.

```java
import java.io.*;
import java.nio.charset.StandardCharsets;

public class DocVoiEncoding {
    public static void main(String[] args) {
        // Đọc file UTF-8 (khuyến nghị)
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                    new FileInputStream("file-utf8.txt"),
                    StandardCharsets.UTF_8))) { // Chỉ định rõ encoding

            String dong;
            while ((dong = br.readLine()) != null) {
                System.out.println(dong);
            }
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }

        // Đọc file mã hóa Windows-1252 (thường gặp với file cũ)
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                    new FileInputStream("file-cp1252.txt"),
                    "Windows-1252"))) {

            String dong;
            while ((dong = br.readLine()) != null) {
                System.out.println(dong);
            }
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## PrintWriter — Ghi văn bản định dạng

**PrintWriter** (trình ghi in — lớp ghi văn bản tiện lợi với nhiều phương thức định dạng):

```java
import java.io.*;

public class GhiDinhDang {
    public static void main(String[] args) {
        try (PrintWriter pw = new PrintWriter(
                new BufferedWriter(new FileWriter("bao-cao.txt")))) {

            pw.println("=== BÁO CÁO DOANH THU ===");
            pw.printf("%-20s %10s%n", "Sản phẩm", "Doanh thu");
            pw.printf("%-20s %10s%n", "-".repeat(20), "-".repeat(10));

            Object[][] data = {
                {"Laptop", 15_000_000},
                {"Điện thoại", 8_500_000},
                {"Tai nghe", 1_200_000}
            };

            for (Object[] row : data) {
                pw.printf("%-20s %,10d VNĐ%n", row[0], row[1]);
            }

            System.out.println("Xuất báo cáo thành công.");
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## StringReader và StringWriter

Xử lý văn bản trong bộ nhớ (không cần file):

```java
import java.io.*;

public class XuLyChuoiBoNho {
    public static void main(String[] args) throws IOException {
        // StringWriter: ghi ký tự vào chuỗi trong bộ nhớ
        StringWriter sw = new StringWriter();
        sw.write("Xin chào, ");
        sw.write("Java I/O!");
        String ketQua = sw.toString();
        System.out.println("Kết quả: " + ketQua);

        // StringReader: đọc ký tự từ chuỗi
        try (BufferedReader br = new BufferedReader(
                new StringReader("Dòng 1\nDòng 2\nDòng 3"))) {
            String dong;
            while ((dong = br.readLine()) != null) {
                System.out.println(">> " + dong);
            }
        }
    }
}
```

---

## So sánh Byte Stream vs Character Stream

| Tiêu chí | Byte Stream | Character Stream |
|----------|-------------|-----------------|
| Đơn vị | 1 byte | 1 ký tự (2 byte Unicode) |
| Lớp gốc | `InputStream`/`OutputStream` | `Reader`/`Writer` |
| Phù hợp | File nhị phân (ảnh, video) | File văn bản |
| Encoding | Không xử lý | Tự động xử lý |
| `readLine()` | Không có | Có (BufferedReader) |

---

## Tóm tắt

- **Character Stream** tự động xử lý encoding/decoding, phù hợp cho mọi file văn bản.
- Dùng **BufferedReader/BufferedWriter** để tăng hiệu năng và có phương thức `readLine()`/`newLine()`.
- Luôn chỉ định rõ **encoding** (mã hóa ký tự) khi dùng `InputStreamReader`/`OutputStreamWriter` để tránh lỗi hiển thị tiếng Việt.
- **PrintWriter** tiện lợi khi cần định dạng đầu ra với `printf`.
