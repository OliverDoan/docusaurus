---
sidebar_position: 9
title: "Hướng dẫn sử dụng Printing Service trong Java"
---

# Hướng dẫn sử dụng Printing Service trong Java

Java Print Service là bộ API cho phép chương trình Java tìm máy in trên hệ thống và gửi lệnh in tài liệu như văn bản, PDF hay ảnh. Nó hữu ích khi bạn cần in ấn trực tiếp từ ứng dụng mà không qua phần mềm trung gian. Bài này hướng dẫn cách liệt kê máy in, in file và theo dõi trạng thái lệnh in qua các ví dụ cụ thể.

## Printing Service là gì?

**Java Print Service** (dịch vụ in ấn Java — API cho phép chương trình Java tìm kiếm, lựa chọn và gửi lệnh in đến máy in) thuộc gói `javax.print`. API này cung cấp khả năng:
- Phát hiện máy in cài đặt trên hệ thống
- Lọc máy in theo loại dữ liệu hỗ trợ
- In file PDF, HTML, text, ảnh
- Kiểm soát cài đặt in (số bản sao, khổ giấy, in hai mặt...)

---

## Các gói liên quan

| Gói | Mô tả |
|-----|-------|
| `javax.print` | API chính cho Java Print Service |
| `javax.print.attribute` | Thuộc tính lệnh in (số bản sao, màu sắc, khổ giấy...) |
| `javax.print.attribute.standard` | Các thuộc tính tiêu chuẩn |
| `javax.print.event` | Sự kiện theo dõi trạng thái lệnh in |

---

## Liệt kê tất cả máy in

```java
import javax.print.*;
import javax.print.attribute.*;

public class LietKeMayIn {
    public static void main(String[] args) {
        // PrintServiceLookup.lookupPrintServices: tìm kiếm máy in
        // Tham số null, null = không lọc theo loại dữ liệu hay thuộc tính
        PrintService[] danhSachMayIn = PrintServiceLookup.lookupPrintServices(null, null);

        System.out.println("Số máy in tìm thấy: " + danhSachMayIn.length);
        System.out.println("---");

        for (int i = 0; i < danhSachMayIn.length; i++) {
            PrintService mayIn = danhSachMayIn[i];
            System.out.println((i + 1) + ". Tên: " + mayIn.getName());

            // DocFlavor: định dạng dữ liệu có thể in (MIME type + biểu diễn Java)
            DocFlavor[] dinh_dang = mayIn.getSupportedDocFlavors();
            System.out.println("   Định dạng hỗ trợ: " + dinh_dang.length + " loại");
        }

        // Lấy máy in mặc định
        PrintService mayInMacDinh = PrintServiceLookup.lookupDefaultPrintService();
        if (mayInMacDinh != null) {
            System.out.println("\nMáy in mặc định: " + mayInMacDinh.getName());
        } else {
            System.out.println("\nKhông tìm thấy máy in mặc định.");
        }
    }
}
```

---

## In file văn bản đơn giản

```java
import javax.print.*;
import javax.print.attribute.*;
import javax.print.attribute.standard.*;
import java.io.*;

public class InFileVanBan {
    public static void main(String[] args) {
        String noiDungIn = "Xin chào từ Java!\nDây là trang in thử.\nKết thúc.";
        byte[] duLieu = noiDungIn.getBytes();

        // DocFlavor.BYTE_ARRAY.TEXT_PLAIN_UTF_8: dữ liệu là mảng byte, nội dung text UTF-8
        DocFlavor dinh_dang = DocFlavor.BYTE_ARRAY.TEXT_PLAIN_UTF_8;

        // Tìm máy in hỗ trợ định dạng văn bản UTF-8
        PrintService[] mayInPhuHop = PrintServiceLookup.lookupPrintServices(dinh_dang, null);

        if (mayInPhuHop.length == 0) {
            System.out.println("Không tìm thấy máy in phù hợp.");
            return;
        }

        PrintService mayIn = mayInPhuHop[0]; // Lấy máy in đầu tiên
        System.out.println("In trên máy: " + mayIn.getName());

        // Thiết lập thuộc tính lệnh in
        PrintRequestAttributeSet thuocTinh = new HashPrintRequestAttributeSet();
        thuocTinh.add(new Copies(1));                      // 1 bản sao
        thuocTinh.add(MediaSizeName.ISO_A4);               // Khổ giấy A4
        thuocTinh.add(Sides.ONE_SIDED);                    // In một mặt
        thuocTinh.add(new JobName("LenhIn-VanBan", null)); // Tên lệnh in

        try {
            // DocPrintJob: đối tượng đại diện cho một lệnh in
            DocPrintJob lenhIn = mayIn.createPrintJob();

            // Doc: gói dữ liệu cần in cùng định dạng của nó
            Doc tai_lieu = new SimpleDoc(duLieu, dinh_dang, null);

            lenhIn.print(tai_lieu, thuocTinh);
            System.out.println("Đã gửi lệnh in thành công.");

        } catch (PrintException e) {
            System.err.println("Lỗi in: " + e.getMessage());
        }
    }
}
```

---

## In file PDF

```java
import javax.print.*;
import javax.print.attribute.*;
import javax.print.attribute.standard.*;
import java.io.*;

public class InFilePDF {
    public static void main(String[] args) {
        File filePDF = new File("bao-cao.pdf");
        if (!filePDF.exists()) {
            System.out.println("File PDF không tồn tại.");
            return;
        }

        // DocFlavor.INPUT_STREAM.PDF: dữ liệu là InputStream, định dạng PDF
        DocFlavor dinhDangPDF = DocFlavor.INPUT_STREAM.PDF;

        // Tìm máy in hỗ trợ in PDF
        PrintService[] mayInPDF = PrintServiceLookup.lookupPrintServices(dinhDangPDF, null);

        if (mayInPDF.length == 0) {
            System.out.println("Không có máy in hỗ trợ PDF trực tiếp.");
            System.out.println("Gợi ý: Dùng thư viện iText hoặc Apache PDFBox để render PDF.");
            return;
        }

        PrintService mayIn = mayInPDF[0];
        System.out.println("Máy in: " + mayIn.getName());

        PrintRequestAttributeSet thuocTinh = new HashPrintRequestAttributeSet();
        thuocTinh.add(new Copies(2));               // In 2 bản
        thuocTinh.add(MediaSizeName.ISO_A4);
        thuocTinh.add(Sides.TWO_SIDED_LONG_EDGE);   // In hai mặt

        try (InputStream is = new FileInputStream(filePDF)) {
            DocPrintJob lenhIn = mayIn.createPrintJob();
            Doc tai_lieu = new SimpleDoc(is, dinhDangPDF, null);
            lenhIn.print(tai_lieu, thuocTinh);
            System.out.println("Đã gửi lệnh in PDF.");
        } catch (PrintException | IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Lắng nghe sự kiện in

```java
import javax.print.*;
import javax.print.event.*;
import javax.print.attribute.*;
import javax.print.attribute.standard.*;

public class TheoDoiLenhIn {
    public static void main(String[] args) throws InterruptedException {
        String noiDung = "Nội dung cần in...";
        DocFlavor dinhDang = DocFlavor.BYTE_ARRAY.TEXT_PLAIN_UTF_8;

        PrintService mayIn = PrintServiceLookup.lookupDefaultPrintService();
        if (mayIn == null) { System.out.println("Không có máy in."); return; }

        DocPrintJob lenhIn = mayIn.createPrintJob();

        // PrintJobListener: lắng nghe sự kiện lệnh in (hoàn thành, lỗi, hủy...)
        lenhIn.addPrintJobListener(new PrintJobAdapter() {
            @Override
            public void printJobCompleted(PrintJobEvent pje) {
                System.out.println("In hoàn thành!");
            }

            @Override
            public void printJobFailed(PrintJobEvent pje) {
                System.out.println("In thất bại!");
            }

            @Override
            public void printJobCanceled(PrintJobEvent pje) {
                System.out.println("Lệnh in bị hủy.");
            }

            @Override
            public void printDataTransferCompleted(PrintJobEvent pje) {
                System.out.println("Đã truyền dữ liệu đến máy in.");
            }
        });

        try {
            Doc taiLieu = new SimpleDoc(noiDung.getBytes(), dinhDang, null);
            lenhIn.print(taiLieu, null);
            Thread.sleep(3000); // Đợi sự kiện
        } catch (PrintException | InterruptedException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Kiểm tra khả năng in của máy in

```java
import javax.print.*;
import javax.print.attribute.*;
import javax.print.attribute.standard.*;

public class KiemTraMayIn {
    public static void main(String[] args) {
        PrintService[] danhSach = PrintServiceLookup.lookupPrintServices(null, null);

        for (PrintService mayIn : danhSach) {
            System.out.println("=== " + mayIn.getName() + " ===");

            // Kiểm tra hỗ trợ in màu
            ColorSupported mau = (ColorSupported) mayIn.getAttribute(ColorSupported.class);
            System.out.println("  Hỗ trợ màu: " + (mau == ColorSupported.SUPPORTED ? "Có" : "Không"));

            // Kiểm tra hỗ trợ in hai mặt
            SidesSupported haiMat = (SidesSupported) mayIn.getAttribute(SidesSupported.class);
            System.out.println("  Hỗ trợ hai mặt: " + (haiMat != null ? "Có" : "Không"));

            // Kiểm tra số bản sao tối đa
            CopiesSupported soSao = (CopiesSupported) mayIn.getAttribute(CopiesSupported.class);
            if (soSao != null) {
                System.out.println("  Bản sao tối đa: " + soSao.getUpperBound());
            }

            // Các định dạng in được hỗ trợ
            DocFlavor[] dinh_dang = mayIn.getSupportedDocFlavors();
            System.out.println("  Định dạng hỗ trợ:");
            for (DocFlavor df : dinh_dang) {
                System.out.println("    - " + df.getMimeType());
            }
        }
    }
}
```

---

## Tóm tắt

| Lớp/Interface | Vai trò |
|--------------|---------|
| `PrintServiceLookup` | Tìm kiếm máy in trên hệ thống |
| `PrintService` | Đại diện cho một máy in |
| `DocPrintJob` | Một lệnh in cụ thể |
| `Doc` / `SimpleDoc` | Đóng gói dữ liệu + định dạng cần in |
| `DocFlavor` | Định dạng dữ liệu (MIME type + kiểu Java) |
| `PrintRequestAttributeSet` | Tập hợp thuộc tính lệnh in |
| `PrintJobListener` | Lắng nghe sự kiện in |

Khi cần in tài liệu phức tạp (PDF, Excel), nên kết hợp Java Print Service với thư viện `Apache PDFBox` (render PDF) hoặc `Apache POI` (tạo Excel) để chuẩn bị dữ liệu trước khi gửi đến máy in.
