---
sidebar_position: 11
title: "Hướng dẫn nén và giải nén trong Java - Zip"
---

# Hướng dẫn nén và giải nén trong Java - Zip

## Tổng quan

Java cung cấp gói `java.util.zip` với các lớp hỗ trợ nén và giải nén file theo định dạng **ZIP** (định dạng nén phổ biến) và **GZIP** (nén một file đơn):

| Lớp | Mục đích |
|-----|---------|
| `ZipOutputStream` | Tạo file ZIP (ghi nhiều file vào một archive) |
| `ZipInputStream` | Đọc/giải nén file ZIP |
| `ZipFile` | Đọc ngẫu nhiên các entry trong file ZIP |
| `GZIPOutputStream` | Nén một file theo định dạng GZIP |
| `GZIPInputStream` | Giải nén file GZIP |
| `ZipEntry` | Đại diện cho một file/thư mục trong archive ZIP |

---

## Nén file vào ZIP

```java
import java.io.*;
import java.util.zip.*;

public class NenFileZip {
    public static void main(String[] args) {
        // Các file cần nén
        String[] cac_file = {"bao-cao.txt", "du-lieu.csv", "hinh-anh.png"};
        String fileZip = "tai-lieu.zip";

        try (ZipOutputStream zos = new ZipOutputStream(
                new BufferedOutputStream(new FileOutputStream(fileZip)))) {

            // Mức nén: 0 (không nén) đến 9 (nén tối đa), mặc định là -1 (cân bằng)
            zos.setLevel(Deflater.BEST_COMPRESSION); // Nén tối đa

            for (String tenFile : cac_file) {
                File file = new File(tenFile);
                if (!file.exists()) {
                    System.out.println("Bỏ qua (không tồn tại): " + tenFile);
                    continue;
                }

                // ZipEntry: mục nhập zip — đại diện cho một file bên trong archive
                ZipEntry entry = new ZipEntry(file.getName());
                zos.putNextEntry(entry);

                try (FileInputStream fis = new FileInputStream(file)) {
                    byte[] buffer = new byte[8192];
                    int soByteDoc;
                    while ((soByteDoc = fis.read(buffer)) != -1) {
                        zos.write(buffer, 0, soByteDoc);
                    }
                }

                zos.closeEntry(); // Đóng entry hiện tại trước khi sang entry tiếp theo
                System.out.println("Đã nén: " + tenFile);
            }

            System.out.println("Tạo ZIP thành công: " + fileZip);

        } catch (IOException e) {
            System.err.println("Lỗi nén ZIP: " + e.getMessage());
        }
    }
}
```

---

## Nén cả thư mục vào ZIP

```java
import java.io.*;
import java.nio.file.*;
import java.util.zip.*;

public class NenThuMucZip {
    public static void nenThuMuc(String thuMucNguon, String fileZipDich) throws IOException {
        Path nguon = Paths.get(thuMucNguon);

        try (ZipOutputStream zos = new ZipOutputStream(
                new BufferedOutputStream(new FileOutputStream(fileZipDich)))) {

            zos.setLevel(Deflater.DEFAULT_COMPRESSION);

            // Files.walk: duyệt đệ quy tất cả file/thư mục trong nguon
            Files.walk(nguon).forEach(path -> {
                try {
                    // Tạo tên entry tương đối (relative path — đường dẫn tính từ thư mục gốc)
                    String tenEntry = nguon.relativize(path).toString();

                    if (Files.isDirectory(path)) {
                        // Thêm thư mục với dấu /
                        if (!tenEntry.isEmpty()) {
                            zos.putNextEntry(new ZipEntry(tenEntry + "/"));
                            zos.closeEntry();
                        }
                    } else {
                        zos.putNextEntry(new ZipEntry(tenEntry));
                        Files.copy(path, zos); // Sao chép nội dung file vào ZIP
                        zos.closeEntry();
                        System.out.println("  Đã nén: " + tenEntry);
                    }
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }
    }

    public static void main(String[] args) throws IOException {
        nenThuMuc("du-an", "du-an-backup.zip");
        System.out.println("Đã nén thư mục 'du-an' vào 'du-an-backup.zip'.");
    }
}
```

---

## Giải nén file ZIP

```java
import java.io.*;
import java.util.zip.*;

public class GiaiNenZip {
    public static void main(String[] args) {
        String fileZip = "tai-lieu.zip";
        String thuMucDich = "giai-nen-output";

        new File(thuMucDich).mkdirs();

        try (ZipInputStream zis = new ZipInputStream(
                new BufferedInputStream(new FileInputStream(fileZip)))) {

            ZipEntry entry;
            byte[] buffer = new byte[8192];

            // Duyệt từng entry trong ZIP
            while ((entry = zis.getNextEntry()) != null) {
                // Ngăn tấn công Zip Slip (zip slip attack — chèn đường dẫn độc hại)
                File fileOut = kiemTraZipSlip(new File(thuMucDich), entry.getName());

                if (entry.isDirectory()) {
                    fileOut.mkdirs();
                } else {
                    fileOut.getParentFile().mkdirs(); // Tạo thư mục cha nếu cần

                    try (FileOutputStream fos = new FileOutputStream(fileOut)) {
                        int soByteDoc;
                        while ((soByteDoc = zis.read(buffer)) != -1) {
                            fos.write(buffer, 0, soByteDoc);
                        }
                    }
                    System.out.printf("Đã giải nén: %-30s (%,d byte)%n",
                        entry.getName(), entry.getSize());
                }

                zis.closeEntry();
            }

            System.out.println("Giải nén hoàn tất vào: " + thuMucDich);

        } catch (IOException e) {
            System.err.println("Lỗi giải nén: " + e.getMessage());
        }
    }

    // Kiểm tra Zip Slip: ngăn chặn tấn công qua đường dẫn "../../../etc/passwd"
    private static File kiemTraZipSlip(File thuMucDich, String tenEntry) throws IOException {
        File fileOut = new File(thuMucDich, tenEntry);
        String canonicalDich = thuMucDich.getCanonicalPath() + File.separator;
        String canonicalOut  = fileOut.getCanonicalPath();

        if (!canonicalOut.startsWith(canonicalDich)) {
            throw new IOException("Phát hiện tấn công Zip Slip: " + tenEntry);
        }
        return fileOut;
    }
}
```

---

## Đọc thông tin file ZIP (không giải nén)

```java
import java.io.*;
import java.util.*;
import java.util.zip.*;

public class DocThongTinZip {
    public static void main(String[] args) {
        String fileZip = "tai-lieu.zip";

        // ZipFile cho phép đọc ngẫu nhiên — không cần đọc tuần tự
        try (ZipFile zf = new ZipFile(fileZip)) {
            System.out.printf("File ZIP: %s%n", fileZip);
            System.out.printf("Số entry:  %d%n", zf.size());
            System.out.println("---");
            System.out.printf("%-35s %12s %12s %6s%n",
                "Tên", "Kích thước", "Nén xuống", "Tỷ lệ");

            Enumeration<? extends ZipEntry> entries = zf.entries();
            long tongGoc = 0, tongNen = 0;

            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                long goc = entry.getSize();
                long nen  = entry.getCompressedSize();
                double ty_le = (goc > 0) ? (1.0 - (double) nen / goc) * 100 : 0;

                System.out.printf("%-35s %,12d %,12d %5.1f%%%n",
                    entry.getName(), goc, nen, ty_le);

                tongGoc += goc;
                tongNen += nen;
            }

            System.out.printf("%n%-35s %,12d %,12d %5.1f%%%n",
                "TỔNG CỘNG", tongGoc, tongNen,
                (tongGoc > 0) ? (1.0 - (double) tongNen / tongGoc) * 100 : 0);

        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Nén và giải nén GZIP (một file đơn)

**GZIP** (GNU Zip — định dạng nén một file đơn, không phải archive nhiều file):

```java
import java.io.*;
import java.util.zip.*;

public class NenGzip {
    // Nén file thành .gz
    public static void nen(String fileNguon, String fileGz) throws IOException {
        try (
            FileInputStream fis = new FileInputStream(fileNguon);
            GZIPOutputStream gos = new GZIPOutputStream(
                new FileOutputStream(fileGz))
        ) {
            byte[] buffer = new byte[8192];
            int n;
            while ((n = fis.read(buffer)) != -1) {
                gos.write(buffer, 0, n);
            }
        }
        System.out.println("Đã nén: " + fileNguon + " → " + fileGz);
    }

    // Giải nén file .gz
    public static void giaiNen(String fileGz, String fileRa) throws IOException {
        try (
            GZIPInputStream gis = new GZIPInputStream(
                new FileInputStream(fileGz));
            FileOutputStream fos = new FileOutputStream(fileRa)
        ) {
            byte[] buffer = new byte[8192];
            int n;
            while ((n = gis.read(buffer)) != -1) {
                fos.write(buffer, 0, n);
            }
        }
        System.out.println("Đã giải nén: " + fileGz + " → " + fileRa);
    }

    public static void main(String[] args) throws IOException {
        nen("log-server.txt", "log-server.txt.gz");
        giaiNen("log-server.txt.gz", "log-server-khoi-phuc.txt");
    }
}
```

---

## Tóm tắt

| Tác vụ | Lớp sử dụng |
|--------|------------|
| Tạo file ZIP | `ZipOutputStream` + `ZipEntry` |
| Giải nén ZIP | `ZipInputStream` |
| Đọc thông tin ZIP | `ZipFile` |
| Nén một file (GZIP) | `GZIPOutputStream` |
| Giải nén GZIP | `GZIPInputStream` |

**Lưu ý bảo mật:** Luôn kiểm tra **Zip Slip** khi giải nén file từ nguồn không tin cậy để tránh ghi file ra ngoài thư mục đích.
