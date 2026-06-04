---
sidebar_position: 13
title: "Hướng dẫn xuất dữ liệu lớn ra file Excel với Apache POI - SXSSF"
---

# Hướng dẫn xuất dữ liệu lớn ra file Excel với Apache POI - SXSSF

## Vấn đề với XSSF khi dữ liệu lớn

**XSSF** (XSSFWorkbook) giữ toàn bộ dữ liệu trong bộ nhớ RAM. Khi xuất hàng trăm ngàn hoặc triệu dòng, ứng dụng sẽ:
- Tiêu tốn gigabyte RAM
- Ném `OutOfMemoryError` (lỗi hết bộ nhớ)
- Chạy rất chậm do GC (garbage collection — thu gom rác) liên tục

**SXSSF** (Streaming XSSF) giải quyết vấn đề này bằng cách chỉ giữ một số lượng hàng nhất định trong RAM, phần còn lại ghi tạm vào ổ đĩa.

---

## Dependency Maven

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>
```

---

## Tạo file Excel lớn với SXSSF

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.*;
import java.io.*;

public class XuatExcelLon {
    public static void main(String[] args) throws IOException {
        int TONG_DONG = 500_000; // 500.000 dòng
        int CAP_BO_DEM = 1000;   // Giữ 1000 hàng trong RAM, phần còn lại ghi tạm ra ổ đĩa

        System.out.println("Bắt đầu xuất " + TONG_DONG + " dòng...");
        long batDau = System.currentTimeMillis();

        // SXSSFWorkbook(rowAccessWindowSize): số hàng tối đa trong RAM
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(CAP_BO_DEM)) {
            // Nén file tạm trên ổ đĩa để tiết kiệm không gian
            workbook.setCompressTempFiles(true);

            SXSSFSheet sheet = workbook.createSheet("Dữ liệu lớn");

            // Ghi tiêu đề
            CellStyle styleTitle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            styleTitle.setFont(font);

            Row tieuDe = sheet.createRow(0);
            String[] cot = {"STT", "Họ tên", "Email", "Điện thoại", "Địa chỉ", "Điểm"};
            for (int i = 0; i < cot.length; i++) {
                Cell cell = tieuDe.createCell(i);
                cell.setCellValue(cot[i]);
                cell.setCellStyle(styleTitle);
            }

            // Ghi dữ liệu
            for (int i = 1; i <= TONG_DONG; i++) {
                Row hang = sheet.createRow(i);
                hang.createCell(0).setCellValue(i);
                hang.createCell(1).setCellValue("Nguyen Van " + i);
                hang.createCell(2).setCellValue("user" + i + "@example.com");
                hang.createCell(3).setCellValue("09" + String.format("%08d", i));
                hang.createCell(4).setCellValue("Hà Nội, Việt Nam");
                hang.createCell(5).setCellValue(Math.random() * 10);

                // In tiến độ mỗi 100.000 dòng
                if (i % 100_000 == 0) {
                    System.out.printf("Đã ghi %,d / %,d dòng...%n", i, TONG_DONG);
                }
            }

            // Ghi ra file
            try (FileOutputStream fos = new FileOutputStream("du-lieu-lon.xlsx")) {
                workbook.write(fos);
            }

            // Xóa file tạm trên ổ đĩa
            workbook.dispose();

        }

        long ketThuc = System.currentTimeMillis();
        System.out.printf("Hoàn thành! Thời gian: %.2f giây%n",
            (ketThuc - batDau) / 1000.0);
    }
}
```

---

## So sánh XSSF vs SXSSF

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import java.io.*;

public class SoSanhHieuNang {
    static void xuatVoiXSSF(int soDong, String tenFile) throws IOException {
        long ramTruoc = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        long bat_dau = System.currentTimeMillis();

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Data");
            for (int i = 0; i < soDong; i++) {
                Row r = sheet.createRow(i);
                r.createCell(0).setCellValue("Row " + i);
                r.createCell(1).setCellValue(i * 1.5);
            }
            try (FileOutputStream fos = new FileOutputStream(tenFile)) {
                wb.write(fos);
            }
        }

        long ramSau = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        System.out.printf("XSSF  | %,d dòng | %,d ms | RAM: +%,d KB%n",
            soDong, System.currentTimeMillis() - bat_dau, (ramSau - ramTruoc) / 1024);
    }

    static void xuatVoiSXSSF(int soDong, String tenFile) throws IOException {
        long ramTruoc = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        long bat_dau = System.currentTimeMillis();

        try (SXSSFWorkbook wb = new SXSSFWorkbook(100)) { // Chỉ 100 hàng trong RAM
            Sheet sheet = wb.createSheet("Data");
            for (int i = 0; i < soDong; i++) {
                Row r = sheet.createRow(i);
                r.createCell(0).setCellValue("Row " + i);
                r.createCell(1).setCellValue(i * 1.5);
            }
            try (FileOutputStream fos = new FileOutputStream(tenFile)) {
                wb.write(fos);
            }
            ((SXSSFWorkbook) wb).dispose();
        }

        long ramSau = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        System.out.printf("SXSSF | %,d dòng | %,d ms | RAM: +%,d KB%n",
            soDong, System.currentTimeMillis() - bat_dau, (ramSau - ramTruoc) / 1024);
    }

    public static void main(String[] args) throws IOException {
        System.out.println("So sánh XSSF vs SXSSF với 50.000 dòng:");
        xuatVoiXSSF(50_000, "test-xssf.xlsx");
        xuatVoiSXSSF(50_000, "test-sxssf.xlsx");
    }
}
```

---

## Xuất có định dạng nâng cao

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.*;
import org.apache.poi.ss.util.*;
import java.io.*;
import java.time.LocalDate;
import java.util.*;

public class XuatDinhDangNangCao {
    public static void main(String[] args) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(500)) {
            workbook.setCompressTempFiles(true);
            SXSSFSheet sheet = workbook.createSheet("Báo cáo bán hàng");

            // Theo dõi độ rộng cột (SXSSF không hỗ trợ autoSizeColumn tốt)
            // trackAllColumnsForAutoSizing: theo dõi để tự động căn chỉnh
            sheet.trackAllColumnsForAutoSizing();

            // --- Style số tiền ---
            CellStyle styleTien = workbook.createCellStyle();
            DataFormat df = workbook.createDataFormat();
            styleTien.setDataFormat(df.getFormat("#,##0 \"VNĐ\""));

            // --- Style ngày ---
            CellStyle styleNgay = workbook.createCellStyle();
            styleNgay.setDataFormat(df.getFormat("dd/MM/yyyy"));

            // --- Hàng tiêu đề ---
            String[] tieuDe = {"STT", "Ngày", "Khách hàng", "Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"};
            Row hangTD = sheet.createRow(0);
            for (int i = 0; i < tieuDe.length; i++) {
                hangTD.createCell(i).setCellValue(tieuDe[i]);
            }

            // --- Dữ liệu ---
            String[] khachHang = {"An", "Bình", "Chi", "Dũng", "Em"};
            String[] sanPham = {"Laptop", "Điện thoại", "Máy tính bảng", "Tai nghe", "Chuột"};
            double[] donGia = {25e6, 8e6, 12e6, 1.5e6, 350e3};
            Random rand = new Random(42);

            for (int i = 1; i <= 10_000; i++) {
                int idx = rand.nextInt(5);
                int soLuong = rand.nextInt(5) + 1;
                double thanhTien = soLuong * donGia[idx];

                Row hang = sheet.createRow(i);
                hang.createCell(0).setCellValue(i);

                Cell cellNgay = hang.createCell(1);
                cellNgay.setCellValue(LocalDate.now().minusDays(rand.nextInt(365)));
                cellNgay.setCellStyle(styleNgay);

                hang.createCell(2).setCellValue(khachHang[rand.nextInt(5)]);
                hang.createCell(3).setCellValue(sanPham[idx]);
                hang.createCell(4).setCellValue(soLuong);

                Cell cellDonGia = hang.createCell(5);
                cellDonGia.setCellValue(donGia[idx]);
                cellDonGia.setCellStyle(styleTien);

                Cell cellThanhTien = hang.createCell(6);
                cellThanhTien.setCellValue(thanhTien);
                cellThanhTien.setCellStyle(styleTien);
            }

            // Tự động căn chỉnh cột
            for (int i = 0; i < tieuDe.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (FileOutputStream fos = new FileOutputStream("bao-cao-ban-hang.xlsx")) {
                workbook.write(fos);
            }
            workbook.dispose();
            System.out.println("Xuất 10.000 dòng có định dạng thành công.");
        }
    }
}
```

---

## Các lưu ý quan trọng với SXSSF

```java
// 1. KHÔNG thể đọc lại hàng đã bị flush (đẩy) ra ổ đĩa
SXSSFWorkbook wb = new SXSSFWorkbook(100); // Chỉ giữ 100 hàng
Sheet sheet = wb.createSheet("Test");
for (int i = 0; i < 200; i++) {
    sheet.createRow(i); // Sau hàng 100, các hàng cũ bị flush
}
// sheet.getRow(0) sẽ trả về null vì đã bị flush!
Row hang0 = sheet.getRow(0); // null

// 2. Luôn gọi dispose() sau khi dùng
wb.dispose(); // Xóa file tạm

// 3. SXSSF chỉ hỗ trợ ghi, không đọc
// Để đọc file .xlsx lớn, dùng SAX Parser hoặc streaming API riêng

// 4. Không hỗ trợ một số tính năng nâng cao của XSSF
// (conditional formatting phức tạp, pivot table, chart với dữ liệu lớn)
```

---

## Tóm tắt

| Tiêu chí | XSSF | SXSSF |
|----------|------|-------|
| RAM sử dụng | Toàn bộ dữ liệu | Chỉ N hàng (cấu hình được) |
| Tốc độ ghi | Chậm khi dữ liệu lớn | Nhanh và ổn định |
| Giới hạn dòng | ~100K (OutOfMemory) | Hàng triệu dòng |
| Đọc lại hàng cũ | Có | Không (đã flush) |
| Phù hợp khi | < 50K dòng | > 50K dòng |

Với dữ liệu **hơn 50.000 dòng**, luôn dùng **SXSSF** thay vì XSSF để tránh lỗi bộ nhớ trong môi trường production.
