---
sidebar_position: 10
title: "Đọc ghi file CSV trong Java"
---

# Đọc ghi file CSV trong Java

## CSV là gì?

**CSV** (Comma-Separated Values — giá trị phân cách bởi dấu phẩy) là định dạng file văn bản đơn giản, trong đó mỗi hàng là một bản ghi và các trường được phân cách bởi dấu phẩy (hoặc ký tự phân cách khác như dấu chấm phẩy, tab).

```
Họ tên,Tuổi,Email
Nguyễn Văn An,25,an@example.com
Trần Thị Bình,30,"bình,trần@example.com"
```

---

## Ghi file CSV thủ công (không dùng thư viện)

```java
import java.io.*;
import java.util.*;

public class GhiCSVThuCong {
    record SinhVien(String ten, int tuoi, String email, double diemTB) {}

    public static void main(String[] args) {
        List<SinhVien> danhSach = List.of(
            new SinhVien("Nguyễn Văn An", 20, "an@uni.edu", 8.5),
            new SinhVien("Trần Thị Bình", 21, "binh@uni.edu", 7.9),
            new SinhVien("Lê Văn Chi", 19, "chi@uni.edu", 9.1)
        );

        String tenFile = "sinh-vien.csv";

        try (PrintWriter pw = new PrintWriter(
                new BufferedWriter(
                    new OutputStreamWriter(
                        new FileOutputStream(tenFile), "UTF-8")))) {

            // Ghi BOM (Byte Order Mark — dấu hiệu mã hóa) để Excel hiển thị đúng tiếng Việt
            pw.print('﻿');

            // Ghi tiêu đề
            pw.println("Họ tên,Tuổi,Email,Điểm TB");

            // Ghi từng dòng dữ liệu
            for (SinhVien sv : danhSach) {
                // Bọc trong dấu ngoặc kép nếu có dấu phẩy trong giá trị
                pw.printf("%s,%d,%s,%.1f%n",
                    thoatCSV(sv.ten()),
                    sv.tuoi(),
                    thoatCSV(sv.email()),
                    sv.diemTB());
            }

            System.out.println("Đã ghi file: " + tenFile);

        } catch (IOException e) {
            System.err.println("Lỗi ghi CSV: " + e.getMessage());
        }
    }

    // Bọc giá trị trong dấu ngoặc kép nếu có dấu phẩy hoặc xuống dòng
    private static String thoatCSV(String gia_tri) {
        if (gia_tri == null) return "";
        if (gia_tri.contains(",") || gia_tri.contains("\"") || gia_tri.contains("\n")) {
            return "\"" + gia_tri.replace("\"", "\"\"") + "\"";
        }
        return gia_tri;
    }
}
```

---

## Đọc file CSV thủ công

```java
import java.io.*;
import java.util.*;

public class DocCSVThuCong {
    public static void main(String[] args) {
        String tenFile = "sinh-vien.csv";

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                    new FileInputStream(tenFile), "UTF-8"))) {

            String dong;
            boolean dongDau = true;
            List<String[]> ketQua = new ArrayList<>();

            while ((dong = br.readLine()) != null) {
                // Bỏ qua BOM nếu có
                if (dongDau) {
                    if (dong.startsWith("﻿")) {
                        dong = dong.substring(1);
                    }
                    dongDau = false;
                    System.out.println("Tiêu đề: " + Arrays.toString(dong.split(",")));
                    continue;
                }

                String[] cot = phanTachCSV(dong);
                ketQua.add(cot);
                System.out.printf("Tên: %-20s Tuổi: %s Email: %s Điểm: %s%n",
                    cot[0], cot[1], cot[2], cot[3]);
            }

            System.out.println("Tổng số dòng dữ liệu: " + ketQua.size());

        } catch (IOException e) {
            System.err.println("Lỗi đọc CSV: " + e.getMessage());
        }
    }

    // Phân tách dòng CSV xử lý đúng dấu ngoặc kép
    private static String[] phanTachCSV(String dong) {
        List<String> cac_truong = new ArrayList<>();
        StringBuilder hien_tai = new StringBuilder();
        boolean trongNgoac = false;

        for (int i = 0; i < dong.length(); i++) {
            char c = dong.charAt(i);
            if (c == '"') {
                if (trongNgoac && i + 1 < dong.length() && dong.charAt(i + 1) == '"') {
                    hien_tai.append('"');
                    i++;
                } else {
                    trongNgoac = !trongNgoac;
                }
            } else if (c == ',' && !trongNgoac) {
                cac_truong.add(hien_tai.toString().trim());
                hien_tai.setLength(0);
            } else {
                hien_tai.append(c);
            }
        }
        cac_truong.add(hien_tai.toString().trim());
        return cac_truong.toArray(new String[0]);
    }
}
```

---

## Dùng thư viện OpenCSV

**OpenCSV** là thư viện phổ biến để đọc/ghi CSV trong Java, xử lý đúng các trường hợp phức tạp.

### Dependency Maven

```xml
<dependency>
    <groupId>com.opencsv</groupId>
    <artifactId>opencsv</artifactId>
    <version>5.9</version>
</dependency>
```

### Ghi CSV với OpenCSV

```java
import com.opencsv.CSVWriter;
import java.io.*;
import java.util.*;

public class GhiOpenCSV {
    public static void main(String[] args) {
        List<String[]> duLieu = new ArrayList<>();

        // Tiêu đề
        duLieu.add(new String[]{"Mã SP", "Tên sản phẩm", "Giá", "Số lượng"});

        // Dữ liệu
        duLieu.add(new String[]{"SP001", "Laptop Dell XPS", "25000000", "10"});
        duLieu.add(new String[]{"SP002", "Màn hình, 27 inch", "8500000", "25"});
        duLieu.add(new String[]{"SP003", "Chuột \"không dây\"", "350000", "100"});

        try (CSVWriter writer = new CSVWriter(
                new OutputStreamWriter(
                    new FileOutputStream("san-pham.csv"), "UTF-8"),
                CSVWriter.DEFAULT_SEPARATOR,      // Dấu phẩy
                CSVWriter.DEFAULT_QUOTE_CHARACTER, // Dấu ngoặc kép
                CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                CSVWriter.DEFAULT_LINE_END)) {

            writer.writeAll(duLieu);
            System.out.println("Đã ghi CSV với OpenCSV.");

        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

### Đọc CSV với OpenCSV

```java
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import java.io.*;
import java.util.*;

public class DocOpenCSV {
    public static void main(String[] args) {
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(
                    new FileInputStream("san-pham.csv"), "UTF-8"))) {

            String[] dong;
            int soHang = 0;

            while ((dong = reader.readNext()) != null) {
                soHang++;
                if (soHang == 1) {
                    System.out.println("Tiêu đề: " + Arrays.toString(dong));
                    continue;
                }
                System.out.printf("Mã: %-8s Tên: %-30s Giá: %,-15s SL: %s%n",
                    dong[0], dong[1], dong[2], dong[3]);
            }

            System.out.println("Đọc xong " + (soHang - 1) + " sản phẩm.");

        } catch (IOException | CsvValidationException e) {
            System.err.println("Lỗi đọc CSV: " + e.getMessage());
        }
    }
}
```

---

## Mapping CSV sang Object với OpenCSV

```java
import com.opencsv.bean.*;
import com.opencsv.exceptions.CsvException;
import java.io.*;
import java.util.List;

public class CSVMapping {
    // Dùng annotation để ánh xạ CSV sang Java Bean
    public static class SanPham {
        @CsvBindByName(column = "Mã SP")
        private String maSP;

        @CsvBindByName(column = "Tên sản phẩm")
        private String tenSP;

        @CsvBindByName(column = "Giá")
        private long gia;

        @CsvBindByName(column = "Số lượng")
        private int soLuong;

        // Getters
        public String getMaSP() { return maSP; }
        public String getTenSP() { return tenSP; }
        public long getGia() { return gia; }
        public int getSoLuong() { return soLuong; }

        @Override
        public String toString() {
            return String.format("SanPham{ma='%s', ten='%s', gia=%,d, sl=%d}",
                maSP, tenSP, gia, soLuong);
        }
    }

    public static void main(String[] args) {
        try (Reader reader = new InputStreamReader(
                new FileInputStream("san-pham.csv"), "UTF-8")) {

            CsvToBean<SanPham> csvToBean = new CsvToBeanBuilder<SanPham>(reader)
                .withType(SanPham.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build();

            List<SanPham> danhSach = csvToBean.parse();
            danhSach.forEach(sp -> System.out.println(sp));

        } catch (IOException | RuntimeException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Tóm tắt

| Cách tiếp cận | Ưu điểm | Nhược điểm |
|--------------|---------|-----------|
| Thủ công | Không cần thư viện | Phức tạp khi xử lý edge cases |
| OpenCSV | Đơn giản, đầy đủ tính năng | Thêm dependency |

**Khuyến nghị:** Dùng **OpenCSV** cho dự án thực tế; dùng thủ công khi muốn hiểu bản chất hoặc môi trường không cho thêm thư viện.

Lưu ý luôn ghi **BOM UTF-8** (`﻿`) ở đầu file CSV để Excel mở đúng tiếng Việt.
