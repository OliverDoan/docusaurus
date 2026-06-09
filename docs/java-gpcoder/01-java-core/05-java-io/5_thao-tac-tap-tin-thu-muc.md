---
sidebar_position: 5
title: "Thao tác với tập tin và thư mục trong Java"
---

# Thao tác với tập tin và thư mục trong Java

Hầu hết ứng dụng đều cần làm việc với file và thư mục: tạo, xóa, đổi tên, kiểm tra thuộc tính hay liệt kê nội dung. Java cung cấp lớp File truyền thống và bộ API NIO.2 hiện đại hơn để làm những việc này. Bài này hướng dẫn cả hai cách qua các ví dụ thực tế.

## Lớp File trong Java

**Lớp `File`** (đại diện tập tin/thư mục — lớp dùng để thao tác với đường dẫn, tập tin và thư mục trên hệ thống file) trong gói `java.io` là công cụ truyền thống để làm việc với hệ thống file. Từ Java 7 trở đi, gói `java.nio.file` (NIO.2) được khuyến nghị dùng thay thế.

---

## Tạo đối tượng File

```java
import java.io.File;

public class TaoFileObject {
    public static void main(String[] args) {
        // Tạo bằng đường dẫn tuyệt đối (absolute path)
        File f1 = new File("/home/user/tai-lieu/bao-cao.txt");

        // Tạo bằng đường dẫn tương đối (relative path — tính từ thư mục chạy)
        File f2 = new File("data/config.properties");

        // Tạo từ thư mục cha + tên file
        File thuMuc = new File("/home/user");
        File f3 = new File(thuMuc, "README.md");

        System.out.println("Đường dẫn: " + f1.getPath());
        System.out.println("Đường dẫn tuyệt đối: " + f1.getAbsolutePath());
        System.out.println("Tên file: " + f1.getName());
        System.out.println("Thư mục cha: " + f1.getParent());
    }
}
```

---

## Kiểm tra thuộc tính tập tin/thư mục

```java
import java.io.File;
import java.util.Date;

public class KiemTraThuocTinh {
    public static void main(String[] args) {
        File file = new File("bao-cao.txt");

        System.out.println("Tồn tại?      " + file.exists());
        System.out.println("Là file?      " + file.isFile());
        System.out.println("Là thư mục?   " + file.isDirectory());
        System.out.println("Có thể đọc?   " + file.canRead());
        System.out.println("Có thể ghi?   " + file.canWrite());
        System.out.println("Có thể chạy?  " + file.canExecute());
        System.out.println("Kích thước:   " + file.length() + " byte");
        System.out.println("Sửa lần cuối: " + new Date(file.lastModified()));
        System.out.println("Ẩn?           " + file.isHidden());
    }
}
```

---

## Tạo file và thư mục

```java
import java.io.File;
import java.io.IOException;

public class TaoFileThuMuc {
    public static void main(String[] args) throws IOException {
        // Tạo file mới
        File fileM = new File("file-moi.txt");
        if (fileM.createNewFile()) {
            System.out.println("Đã tạo file: " + fileM.getName());
        } else {
            System.out.println("File đã tồn tại.");
        }

        // Tạo một thư mục
        File thuMuc1 = new File("thu-muc-moi");
        if (thuMuc1.mkdir()) { // mkdir: tạo đúng 1 thư mục (thư mục cha phải tồn tại)
            System.out.println("Đã tạo thư mục: " + thuMuc1.getName());
        }

        // Tạo nhiều cấp thư mục cùng lúc
        File thuMuc2 = new File("du-an/src/main/java/com/example");
        if (thuMuc2.mkdirs()) { // mkdirs: tạo tất cả thư mục cha nếu cần
            System.out.println("Đã tạo cấu trúc thư mục.");
        }
    }
}
```

---

## Liệt kê nội dung thư mục

```java
import java.io.File;
import java.util.Arrays;

public class LietKeNoiDung {
    public static void main(String[] args) {
        File thuMuc = new File(".");

        // Lấy danh sách tên
        String[] danhSachTen = thuMuc.list();
        System.out.println("Tên trong thư mục hiện tại:");
        if (danhSachTen != null) {
            Arrays.sort(danhSachTen);
            for (String ten : danhSachTen) {
                System.out.println("  " + ten);
            }
        }

        // Lọc chỉ lấy file .java (dùng FilenameFilter — bộ lọc tên file)
        String[] fileJava = thuMuc.list(
            (dir, name) -> name.endsWith(".java")
        );
        System.out.println("\nCác file .java:");
        if (fileJava != null) {
            Arrays.stream(fileJava).forEach(f -> System.out.println("  " + f));
        }
    }
}
```

---

## Duyệt thư mục đệ quy (Recursive)

```java
import java.io.File;

public class DuyetDuqui {
    // Đệ quy (recursive): hàm tự gọi lại chính nó để duyệt qua các thư mục con
    public static void lietKeDuqui(File thuMuc, int capDo) {
        if (!thuMuc.exists()) return;

        String khoangCach = "  ".repeat(capDo);
        File[] items = thuMuc.listFiles();

        if (items == null) return;

        for (File item : items) {
            if (item.isDirectory()) {
                System.out.println(khoangCach + "[THU MUC] " + item.getName());
                lietKeDuqui(item, capDo + 1); // Gọi đệ quy
            } else {
                System.out.printf("%s%-30s (%,d byte)%n",
                    khoangCach, item.getName(), item.length());
            }
        }
    }

    public static void main(String[] args) {
        File goc = new File("du-an");
        System.out.println("[GỐC] " + goc.getAbsolutePath());
        lietKeDuqui(goc, 1);
    }
}
```

---

## Đổi tên và di chuyển file

```java
import java.io.File;

public class DoiTenDiChuyen {
    public static void main(String[] args) {
        // Đổi tên file
        File cu = new File("file-cu.txt");
        File moi = new File("file-moi.txt");

        if (cu.renameTo(moi)) {
            System.out.println("Đổi tên thành công.");
        } else {
            System.out.println("Đổi tên thất bại.");
        }

        // Di chuyển file (rename với đường dẫn khác)
        File nguon = new File("tai-lieu.pdf");
        File dich  = new File("luu-tru/2024/tai-lieu.pdf");

        // Đảm bảo thư mục đích tồn tại
        dich.getParentFile().mkdirs();

        if (nguon.renameTo(dich)) {
            System.out.println("Di chuyển thành công.");
        }
    }
}
```

---

## Xóa file và thư mục

```java
import java.io.File;

public class XoaFileThuMuc {
    // Xóa thư mục và toàn bộ nội dung bên trong (đệ quy)
    public static boolean xoaDuqui(File item) {
        if (item.isDirectory()) {
            File[] con = item.listFiles();
            if (con != null) {
                for (File c : con) {
                    if (!xoaDuqui(c)) return false;
                }
            }
        }
        return item.delete();
    }

    public static void main(String[] args) {
        // Xóa file đơn
        File file = new File("file-tam.txt");
        if (file.delete()) {
            System.out.println("Đã xóa file.");
        }

        // Xóa thư mục rỗng
        File thuMucRong = new File("thu-muc-rong");
        thuMucRong.delete(); // Chỉ xóa được nếu rỗng

        // Xóa thư mục có nội dung
        File thuMucDay = new File("du-an-cu");
        if (xoaDuqui(thuMucDay)) {
            System.out.println("Đã xóa toàn bộ thư mục.");
        }

        // deleteOnExit: xóa khi JVM thoát (dùng cho file tạm)
        File fileTam = new File("temp_" + System.currentTimeMillis() + ".tmp");
        fileTam.deleteOnExit();
    }
}
```

---

## Sử dụng java.nio.file.Files (NIO.2 — Java 7+)

**NIO.2** (New I/O version 2 — API I/O mới hỗ trợ từ Java 7) cung cấp `java.nio.file.Files` với nhiều phương thức tiện lợi hơn:

```java
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.io.IOException;

public class NIO2ViDu {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("ghi-chu.txt"); // Path: đường dẫn tập tin

        // Ghi file (ghi đè)
        Files.writeString(path, "Nội dung mới\nDòng 2", StandardCharsets.UTF_8);

        // Đọc toàn bộ file thành String
        String noiDung = Files.readString(path, StandardCharsets.UTF_8);
        System.out.println(noiDung);

        // Đọc từng dòng thành List
        List<String> cácDòng = Files.readAllLines(path, StandardCharsets.UTF_8);
        cácDòng.forEach(d -> System.out.println(">> " + d));

        // Sao chép file
        Path dich = Paths.get("ghi-chu-copy.txt");
        Files.copy(path, dich, StandardCopyOption.REPLACE_EXISTING);

        // Di chuyển file
        Files.move(dich, Paths.get("backup/ghi-chu.txt"),
            StandardCopyOption.REPLACE_EXISTING);

        // Xóa file
        Files.deleteIfExists(path);
    }
}
```

---

## Tóm tắt

| Thao tác | Lớp cũ (`java.io.File`) | Lớp mới (`java.nio.file`) |
|----------|------------------------|--------------------------|
| Tạo file | `createNewFile()` | `Files.createFile(path)` |
| Tạo thư mục | `mkdir()` / `mkdirs()` | `Files.createDirectories(path)` |
| Xóa | `delete()` | `Files.delete(path)` |
| Sao chép | Thủ công với stream | `Files.copy(src, dst)` |
| Di chuyển | `renameTo()` | `Files.move(src, dst)` |
| Đọc file | Qua Stream | `Files.readString(path)` |

Với dự án mới, nên dùng **NIO.2** (`java.nio.file`) vì API rõ ràng hơn, hỗ trợ xử lý lỗi tốt hơn, và ném exception thay vì trả về `false` như lớp `File` cũ.
