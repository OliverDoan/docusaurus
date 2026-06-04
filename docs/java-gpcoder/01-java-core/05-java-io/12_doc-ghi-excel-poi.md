---
sidebar_position: 12
title: "Hướng dẫn đọc và ghi file Excel trong Java với Apache POI"
---

# Hướng dẫn đọc và ghi file Excel trong Java với Apache POI

## Apache POI là gì?

**Apache POI** (Poor Obfuscation Implementation — thư viện Java để đọc/ghi file Microsoft Office) là thư viện mã nguồn mở nổi tiếng nhất để làm việc với file Excel, Word, PowerPoint trong Java.

Hai API chính cho Excel:
- **HSSF** (Horrible Spreadsheet Format): hỗ trợ định dạng `.xls` (Excel 97-2003)
- **XSSF** (XML Spreadsheet Format): hỗ trợ định dạng `.xlsx` (Excel 2007+)
- **SS** (SpreadSheet): API chung, dùng được cho cả hai định dạng

---

## Dependency Maven

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.3.0</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>
```

---

## Ghi file Excel (.xlsx)

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import java.io.*;
import java.util.*;

public class GhiExcel {
    record SanPham(String ma, String ten, int soLuong, double gia) {}

    public static void main(String[] args) {
        List<SanPham> danhSach = List.of(
            new SanPham("SP001", "Laptop Dell XPS 15", 10, 25_000_000),
            new SanPham("SP002", "Màn hình LG 27\"", 25, 8_500_000),
            new SanPham("SP003", "Bàn phím cơ Keychron", 50, 2_200_000)
        );

        // XSSFWorkbook: workbook định dạng .xlsx
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // Sheet: bảng tính — một workbook có thể có nhiều sheet
            XSSFSheet sheet = workbook.createSheet("Danh sách sản phẩm");

            // --- Tạo style cho tiêu đề ---
            CellStyle styleTitle = workbook.createCellStyle();
            Font fontTitle = workbook.createFont();
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 12);
            fontTitle.setColor(IndexedColors.WHITE.getIndex());
            styleTitle.setFont(fontTitle);
            styleTitle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            styleTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleTitle.setAlignment(HorizontalAlignment.CENTER);
            styleTitle.setBorderBottom(BorderStyle.THIN);

            // --- Ghi hàng tiêu đề ---
            // Row: hàng trong sheet (chỉ số bắt đầu từ 0)
            Row tieuDe = sheet.createRow(0);
            String[] cotTieuDe = {"Mã SP", "Tên sản phẩm", "Số lượng", "Đơn giá (VNĐ)", "Thành tiền"};
            for (int i = 0; i < cotTieuDe.length; i++) {
                // Cell: ô trong bảng tính
                Cell cell = tieuDe.createCell(i);
                cell.setCellValue(cotTieuDe[i]);
                cell.setCellStyle(styleTitle);
            }

            // --- Style cho tiền tệ ---
            CellStyle styleTienTe = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            styleTienTe.setDataFormat(format.getFormat("#,##0"));

            // --- Ghi dữ liệu ---
            int soHang = 1;
            for (SanPham sp : danhSach) {
                Row hang = sheet.createRow(soHang++);
                hang.createCell(0).setCellValue(sp.ma());
                hang.createCell(1).setCellValue(sp.ten());
                hang.createCell(2).setCellValue(sp.soLuong());

                Cell cellGia = hang.createCell(3);
                cellGia.setCellValue(sp.gia());
                cellGia.setCellStyle(styleTienTe);

                // Công thức: thành tiền = số lượng × đơn giá
                // CellFormula: công thức Excel (C2*D2)
                Cell cellThanhTien = hang.createCell(4);
                cellThanhTien.setCellFormula("C" + soHang + "*D" + soHang);
                cellThanhTien.setCellStyle(styleTienTe);
            }

            // --- Thêm hàng tổng cộng ---
            Row tongCong = sheet.createRow(soHang);
            tongCong.createCell(1).setCellValue("TỔNG CỘNG");
            Cell cellTong = tongCong.createCell(4);
            cellTong.setCellFormula("SUM(E2:E" + soHang + ")");
            cellTong.setCellStyle(styleTienTe);

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < cotTieuDe.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Ghi file
            try (FileOutputStream fos = new FileOutputStream("san-pham.xlsx")) {
                workbook.write(fos);
            }
            System.out.println("Đã tạo file Excel: san-pham.xlsx");

        } catch (IOException e) {
            System.err.println("Lỗi ghi Excel: " + e.getMessage());
        }
    }
}
```

---

## Đọc file Excel (.xlsx)

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;

public class DocExcel {
    public static void main(String[] args) {
        String tenFile = "san-pham.xlsx";

        try (Workbook workbook = new XSSFWorkbook(new FileInputStream(tenFile))) {
            // Lấy sheet đầu tiên (chỉ số 0)
            Sheet sheet = workbook.getSheetAt(0);

            System.out.println("=== Nội dung file: " + tenFile + " ===");
            System.out.println("Số hàng: " + (sheet.getLastRowNum() + 1));

            // Duyệt từng hàng
            for (Row hang : sheet) {
                if (hang.getRowNum() == 0) {
                    System.out.println("--- Tiêu đề ---");
                }

                StringBuilder dong = new StringBuilder();
                for (Cell cell : hang) {
                    dong.append(docGiaTriCell(cell)).append("\t");
                }
                System.out.println(dong);
            }

        } catch (IOException e) {
            System.err.println("Lỗi đọc Excel: " + e.getMessage());
        }
    }

    // Đọc giá trị cell theo đúng kiểu dữ liệu
    private static String docGiaTriCell(Cell cell) {
        // CellType: kiểu dữ liệu của ô (STRING, NUMERIC, BOOLEAN, FORMULA, BLANK)
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                }
                yield String.valueOf((long) cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            case BLANK   -> "";
            default      -> "?";
        };
    }
}
```

---

## Tạo nhiều Sheet

```java
import org.apache.poi.xssf.usermodel.*;
import java.io.*;

public class NhieuSheet {
    public static void main(String[] args) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // Tạo sheet cho từng quý
            String[] cacQuy = {"Quý 1", "Quý 2", "Quý 3", "Quý 4"};
            double[][] doanhThu = {
                {1.2e9, 1.5e9, 0.9e9},
                {1.8e9, 2.1e9, 1.4e9},
                {2.3e9, 1.9e9, 2.5e9},
                {3.1e9, 2.8e9, 3.4e9}
            };

            for (int q = 0; q < cacQuy.length; q++) {
                XSSFSheet sheet = workbook.createSheet(cacQuy[q]);
                Row tieuDe = sheet.createRow(0);
                tieuDe.createCell(0).setCellValue("Tháng");
                tieuDe.createCell(1).setCellValue("Doanh thu (tỷ)");

                for (int t = 0; t < doanhThu[q].length; t++) {
                    Row hang = sheet.createRow(t + 1);
                    hang.createCell(0).setCellValue("Tháng " + (q * 3 + t + 1));
                    hang.createCell(1).setCellValue(doanhThu[q][t] / 1e9);
                }
            }

            try (FileOutputStream fos = new FileOutputStream("doanh-thu-nam.xlsx")) {
                workbook.write(fos);
            }
            System.out.println("Đã tạo file với " + cacQuy.length + " sheet.");
        }
    }
}
```

---

## Hỗ trợ cả .xls và .xlsx

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;

public class DocCaHaiDinhDang {
    public static void main(String[] args) {
        String tenFile = "bao-cao.xlsx"; // hoặc .xls

        try (InputStream is = new FileInputStream(tenFile);
             Workbook workbook = WorkbookFactory.create(is)) { // Tự phát hiện định dạng

            Sheet sheet = workbook.getSheetAt(0);
            System.out.println("Đọc thành công " + tenFile);
            System.out.println("Tên sheet: " + sheet.getSheetName());

        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Tóm tắt

| Đối tượng | Ý nghĩa |
|-----------|---------|
| `Workbook` | File Excel tổng thể |
| `Sheet` | Một tab/bảng tính trong file |
| `Row` | Một hàng trong sheet |
| `Cell` | Một ô trong hàng |
| `CellStyle` | Định dạng ô (font, màu, border...) |
| `DataFormat` | Định dạng hiển thị số/ngày |

Apache POI phù hợp cho file Excel kích thước vừa. Với file hàng triệu dòng, dùng **SXSSF** (Streaming XSSF) để tiết kiệm bộ nhớ.
