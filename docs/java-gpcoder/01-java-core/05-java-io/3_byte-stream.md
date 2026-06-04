---
sidebar_position: 3
title: "Hướng dẫn sử dụng luồng vào ra nhị phân trong Java - Byte Stream"
---

# Hướng dẫn sử dụng luồng vào ra nhị phân trong Java - Byte Stream

## Byte Stream là gì?

**Byte Stream** (luồng byte — luồng xử lý dữ liệu theo đơn vị 1 byte = 8 bit) là loại luồng dùng để đọc và ghi dữ liệu nhị phân như hình ảnh, âm thanh, video, file nén, hoặc bất kỳ file nào không phải văn bản thuần.

Hai lớp gốc trừu tượng:
- `InputStream` — đọc byte
- `OutputStream` — ghi byte

---

## Các lớp Byte Stream thường dùng

| Lớp | Mục đích |
|-----|---------|
| `FileInputStream` | Đọc byte từ file |
| `FileOutputStream` | Ghi byte vào file |
| `BufferedInputStream` | Bọc stream để có bộ đệm, tăng hiệu năng khi đọc |
| `BufferedOutputStream` | Bọc stream để có bộ đệm, tăng hiệu năng khi ghi |
| `DataInputStream` | Đọc kiểu dữ liệu nguyên thủy (int, double, boolean...) |
| `DataOutputStream` | Ghi kiểu dữ liệu nguyên thủy |
| `ByteArrayInputStream` | Đọc byte từ mảng byte trong bộ nhớ |
| `ByteArrayOutputStream` | Ghi byte vào mảng byte trong bộ nhớ |

---

## FileInputStream và FileOutputStream

### Ghi byte vào file

```java
import java.io.FileOutputStream;
import java.io.IOException;

public class GhiByte {
    public static void main(String[] args) {
        // try-with-resources: tự động đóng stream khi thoát khối lệnh
        try (FileOutputStream fos = new FileOutputStream("output.bin")) {
            byte[] duLieu = {72, 101, 108, 108, 111}; // "Hello" dạng byte
            fos.write(duLieu);              // Ghi toàn bộ mảng
            fos.write(32);                  // Ghi 1 byte (dấu cách)
            fos.write(duLieu, 0, 3);        // Ghi 3 byte đầu: "Hel"
            System.out.println("Đã ghi file thành công.");
        } catch (IOException e) {
            System.err.println("Lỗi khi ghi file: " + e.getMessage());
        }
    }
}
```

### Đọc byte từ file

```java
import java.io.FileInputStream;
import java.io.IOException;

public class DocByte {
    public static void main(String[] args) {
        try (FileInputStream fis = new FileInputStream("output.bin")) {
            int byteDoc;
            // read() trả về -1 khi hết dữ liệu
            while ((byteDoc = fis.read()) != -1) {
                System.out.printf("Byte: %d | Ký tự: %c%n", byteDoc, (char) byteDoc);
            }
        } catch (IOException e) {
            System.err.println("Lỗi khi đọc file: " + e.getMessage());
        }
    }
}
```

---

## Sao chép file nhị phân

```java
import java.io.*;

public class SaoChepFile {
    public static void main(String[] args) {
        String nguon = "anh-goc.jpg";
        String dich  = "anh-copy.jpg";

        // BufferedInputStream/BufferedOutputStream: tăng tốc nhờ bộ đệm 8KB
        try (
            InputStream  doc  = new BufferedInputStream(new FileInputStream(nguon));
            OutputStream ghi  = new BufferedOutputStream(new FileOutputStream(dich))
        ) {
            byte[] buffer = new byte[8192]; // Bộ đệm 8 KB
            int soByte;
            while ((soByte = doc.read(buffer)) != -1) {
                ghi.write(buffer, 0, soByte);
            }
            System.out.println("Sao chép thành công!");
        } catch (IOException e) {
            System.err.println("Lỗi sao chép: " + e.getMessage());
        }
    }
}
```

---

## DataInputStream và DataOutputStream

**DataInputStream/DataOutputStream** (luồng dữ liệu có kiểu — đọc/ghi kiểu nguyên thủy) cho phép ghi/đọc `int`, `double`, `boolean`, `String`... theo định dạng nhị phân.

```java
import java.io.*;

public class LuuDocKieuNguyenThuy {
    public static void main(String[] args) throws IOException {
        // Ghi dữ liệu có kiểu
        try (DataOutputStream dos = new DataOutputStream(
                new FileOutputStream("data.bin"))) {
            dos.writeInt(42);           // Ghi số nguyên
            dos.writeDouble(3.14);      // Ghi số thực
            dos.writeBoolean(true);     // Ghi boolean
            dos.writeUTF("Xin chào");   // Ghi chuỗi UTF-8
            System.out.println("Đã ghi xong.");
        }

        // Đọc lại đúng thứ tự đã ghi
        try (DataInputStream dis = new DataInputStream(
                new FileInputStream("data.bin"))) {
            int    soNguyen  = dis.readInt();
            double soThuc    = dis.readDouble();
            boolean coHieu   = dis.readBoolean();
            String chuoi     = dis.readUTF();

            System.out.println("int    = " + soNguyen);
            System.out.println("double = " + soThuc);
            System.out.println("bool   = " + coHieu);
            System.out.println("String = " + chuoi);
        }
    }
}
```

> **Lưu ý:** Dữ liệu phải được đọc **đúng thứ tự** đã ghi, vì file nhị phân không có dấu phân cách giữa các giá trị.

---

## ByteArrayInputStream và ByteArrayOutputStream

Dùng để xử lý dữ liệu trong bộ nhớ (RAM) mà không cần file.

```java
import java.io.*;

public class XuLyBộNho {
    public static void main(String[] args) throws IOException {
        // Ghi vào bộ nhớ
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write("Dữ liệu trong RAM".getBytes("UTF-8"));

        // Lấy mảng byte kết quả
        byte[] ketQua = baos.toByteArray();
        System.out.println("Số byte: " + ketQua.length);

        // Đọc từ mảng byte
        try (ByteArrayInputStream bais = new ByteArrayInputStream(ketQua)) {
            int b;
            StringBuilder sb = new StringBuilder();
            while ((b = bais.read()) != -1) {
                sb.append((char) b);
            }
            System.out.println("Đọc lại: " + sb);
        }
    }
}
```

---

## So sánh hiệu năng có và không có Buffer

```java
import java.io.*;

public class SoSanhHieuNang {
    // Đọc file 10MB không có buffer (chậm)
    static long khongBuffer(String path) throws IOException {
        long start = System.currentTimeMillis();
        try (FileInputStream fis = new FileInputStream(path)) {
            while (fis.read() != -1) {} // Đọc từng byte
        }
        return System.currentTimeMillis() - start;
    }

    // Đọc file 10MB có buffer (nhanh)
    static long coBuffer(String path) throws IOException {
        long start = System.currentTimeMillis();
        try (BufferedInputStream bis = new BufferedInputStream(
                new FileInputStream(path), 65536)) { // Buffer 64KB
            while (bis.read() != -1) {}
        }
        return System.currentTimeMillis() - start;
    }

    public static void main(String[] args) throws IOException {
        System.out.println("Không buffer: " + khongBuffer("file-lon.dat") + " ms");
        System.out.println("Có buffer:    " + coBuffer("file-lon.dat")    + " ms");
    }
}
```

---

## Tóm tắt

- **Byte Stream** xử lý dữ liệu theo đơn vị byte, phù hợp cho dữ liệu nhị phân.
- Luôn bọc `FileInputStream`/`FileOutputStream` trong `BufferedInputStream`/`BufferedOutputStream` để tăng tốc.
- `DataInputStream`/`DataOutputStream` dùng khi cần lưu/đọc kiểu nguyên thủy theo format nhị phân.
- Luôn dùng **try-with-resources** để đảm bảo stream được đóng đúng cách.
