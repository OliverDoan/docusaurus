---
sidebar_position: 5
title: "5. Quản lý sinh viên + ghi file"
---

# Project 4: Quản lý sinh viên + ghi file

Project cuối cùng và "đời thực" nhất: quản lý danh sách sinh viên với điểm số, **sắp xếp** theo điểm, **tính điểm trung bình**, và quan trọng nhất — **lưu dữ liệu ra file** để lần sau mở lên không mất. Bài này gói trọn OOP đúng chuẩn (đóng gói với `private` + getter), `Comparator` để sắp xếp, **đọc/ghi file**, và một chút **Stream API** để tổng hợp dữ liệu gọn gàng. Đây là bước đệm sang phần mềm thực tế.

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Class Student với đóng gói (encapsulation)](#bước-1-class-student-với-đóng-gói-encapsulation)
- [Bước 2: Thêm và hiển thị sinh viên](#bước-2-thêm-và-hiển-thị-sinh-viên)
- [Bước 3: Sắp xếp theo điểm với Comparator](#bước-3-sắp-xếp-theo-điểm-với-comparator)
- [Bước 4: Tính toán nhanh với Stream API](#bước-4-tính-toán-nhanh-với-stream-api)
- [Bước 5: Lưu dữ liệu ra file](#bước-5-lưu-dữ-liệu-ra-file)
- [Bước 6: Đọc dữ liệu từ file khi khởi động](#bước-6-đọc-dữ-liệu-từ-file-khi-khởi-động)
- [Code hoàn chỉnh](#code-hoàn-chỉnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Mỗi sinh viên có **mã**, **tên**, **điểm**. Ta cần: thêm, xem (kèm sắp xếp), thống kê (trung bình, cao nhất), và **lưu/đọc file** dưới dạng văn bản đơn giản:

```
SV001,Nguyen Van A,8.5
SV002,Tran Thi B,7.0
```

Mỗi dòng là một sinh viên, các trường ngăn cách bởi dấu phẩy (định dạng **CSV** — Comma-Separated Values). Đây là cách lưu dữ liệu đơn giản và phổ biến nhất.

---

## Bước 1: Class Student với đóng gói (encapsulation)

Ở project trước, thuộc tính để "trần" (ai cũng sửa được). Lần này ta làm đúng chuẩn OOP: đặt thuộc tính **`private`** và truy cập qua **getter**.

```java
class Student {
    private String maSV;
    private String ten;
    private double diem;

    Student(String maSV, String ten, double diem) {
        this.maSV = maSV;
        this.ten = ten;
        this.diem = diem;
    }

    // getter: cho phép ĐỌC giá trị từ bên ngoài
    public String getMaSV() { return maSV; }
    public String getTen()  { return ten; }
    public double getDiem() { return diem; }

    // setter có kiểm tra: chỉ cho điểm hợp lệ 0-10
    public void setDiem(double diem) {
        if (diem < 0 || diem > 10) {
            throw new IllegalArgumentException("Điểm phải từ 0 đến 10");
        }
        this.diem = diem;
    }

    // chuyển object thành 1 dòng CSV để ghi file
    public String toCsv() {
        return maSV + "," + ten + "," + diem;
    }
}
```

Giải thích:

- **`private`** — chỉ code **bên trong** class `Student` mới truy cập trực tiếp được. Bên ngoài không thể `student.diem = -5` để phá dữ liệu.
- **Getter** (`getDiem`) — cổng để **đọc** giá trị một cách có kiểm soát.
- **Setter có kiểm tra** (`setDiem`) — cổng để **ghi**, nhưng chặn giá trị sai (điểm âm hay quá 10). Đây chính là sức mạnh của **đóng gói (encapsulation)**: object **tự bảo vệ tính đúng đắn của dữ liệu mình**, không phụ thuộc người dùng nhớ kiểm tra.

:::info Vì sao phải `private` + getter/setter?
Nếu để thuộc tính `public`, bất kỳ đâu trong chương trình cũng có thể gán giá trị bậy. Khi dự án lớn lên, bạn không kiểm soát nổi ai đã sửa gì. `private` + setter có kiểm tra đảm bảo **mọi thay đổi đều đi qua một cửa duy nhất có canh gác**.
:::

---

## Bước 2: Thêm và hiển thị sinh viên

Dùng lại `ArrayList` đã học:

```java
static ArrayList<Student> danhSach = new ArrayList<>();

static void them(String ma, String ten, double diem) {
    danhSach.add(new Student(ma, ten, diem));
    System.out.println("Đã thêm: " + ten);
}

static void hienThi() {
    if (danhSach.isEmpty()) {
        System.out.println("(Danh sách trống)");
        return;
    }
    System.out.printf("%-8s %-20s %s%n", "Mã", "Tên", "Điểm");
    for (Student sv : danhSach) {
        System.out.printf("%-8s %-20s %.1f%n",
                sv.getMaSV(), sv.getTen(), sv.getDiem());
    }
}
```

Điểm mới:

- **`for (Student sv : danhSach)`** — vòng lặp **for-each**: duyệt lần lượt từng phần tử mà không cần index. Đọc là "với mỗi `sv` trong `danhSach`". Gọn hơn `for (int i...)` khi không cần vị trí.
- **`System.out.printf`** — in **có định dạng**. `%-8s` = chuỗi canh trái rộng 8 ký tự, `%.1f` = số thực 1 chữ số thập phân, `%n` = xuống dòng. Nhờ vậy bảng thẳng cột, đẹp mắt.

---

## Bước 3: Sắp xếp theo điểm với Comparator

Muốn xem ai điểm cao nhất, ta sắp xếp danh sách. `Comparator` định nghĩa **tiêu chí so sánh**:

```java
import java.util.Comparator;

// sắp xếp theo điểm GIẢM DẦN (cao → thấp)
static void sapXepTheoDiem() {
    danhSach.sort(Comparator.comparingDouble(Student::getDiem).reversed());
    System.out.println("Đã sắp xếp theo điểm giảm dần.");
}
```

Giải thích:

- **`danhSach.sort(...)`** — `ArrayList` có sẵn hàm `sort`, chỉ cần cho nó biết **so sánh theo gì**.
- **`Comparator.comparingDouble(Student::getDiem)`** — tạo bộ so sánh dựa trên điểm (số thực). Mặc định là **tăng dần**.
- **`.reversed()`** — đảo ngược thành **giảm dần** (điểm cao lên đầu).
- **`Student::getDiem`** — cú pháp **method reference**, nghĩa là "lấy điểm của mỗi sinh viên". Tương đương viết `sv -> sv.getDiem()` nhưng gọn hơn.

Muốn sắp theo tên (A→Z): `danhSach.sort(Comparator.comparing(Student::getTen));`

---

## Bước 4: Tính toán nhanh với Stream API

**Stream API** cho phép xử lý cả danh sách bằng cú pháp khai báo (mô tả "muốn gì" thay vì "làm thế nào"). Tính điểm trung bình và tìm điểm cao nhất:

```java
import java.util.OptionalDouble;

static void thongKe() {
    if (danhSach.isEmpty()) {
        System.out.println("(Chưa có dữ liệu)");
        return;
    }

    double trungBinh = danhSach.stream()
            .mapToDouble(Student::getDiem)   // biến mỗi SV thành điểm (số)
            .average()                        // tính trung bình
            .orElse(0);                       // nếu rỗng thì 0

    double caoNhat = danhSach.stream()
            .mapToDouble(Student::getDiem)
            .max()
            .orElse(0);

    long soGioi = danhSach.stream()
            .filter(sv -> sv.getDiem() >= 8.0)   // chỉ giữ SV điểm >= 8
            .count();                            // đếm

    System.out.printf("Điểm trung bình: %.2f%n", trungBinh);
    System.out.printf("Điểm cao nhất: %.1f%n", caoNhat);
    System.out.println("Số SV giỏi (>= 8.0): " + soGioi);
}
```

Giải thích luồng Stream — đọc như một dây chuyền:

- **`.stream()`** — biến danh sách thành một "dòng chảy" dữ liệu để xử lý.
- **`.mapToDouble(Student::getDiem)`** — **biến đổi** mỗi sinh viên thành điểm số của họ.
- **`.average()` / `.max()`** — gộp dòng dữ liệu lại thành một kết quả.
- **`.orElse(0)`** — `average()` trả về `OptionalDouble` (có thể rỗng nếu list trống); `orElse(0)` cho giá trị mặc định để an toàn.
- **`.filter(sv -> sv.getDiem() >= 8.0)`** — **giữ lại** phần tử thoả điều kiện; `sv -> ...` là một **lambda** (hàm ẩn danh).
- **`.count()`** — đếm số phần tử còn lại.

:::tip Stream thay cho vòng lặp dài
Tính trung bình theo cách cũ cần khai báo biến tổng, vòng `for` cộng dồn, rồi chia. Stream gói gọn thành một dây chuyền dễ đọc. Khi quen, bạn sẽ thấy nó diễn đạt ý định rõ hơn nhiều.
:::

---

## Bước 5: Lưu dữ liệu ra file

Đây là kiến thức quan trọng nhất của bài: dữ liệu trong `ArrayList` **biến mất khi tắt chương trình**. Để giữ lại, ta ghi ra file.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

static final Path FILE = Path.of("sinhvien.csv");

static void luuFile() {
    List<String> dong = new ArrayList<>();
    for (Student sv : danhSach) {
        dong.add(sv.toCsv());          // mỗi SV thành 1 dòng CSV
    }
    try {
        Files.write(FILE, dong);       // ghi toàn bộ ra file
        System.out.println("Đã lưu " + danhSach.size() + " sinh viên vào " + FILE);
    } catch (IOException e) {
        System.out.println("Lỗi khi ghi file: " + e.getMessage());
    }
}
```

Giải thích:

- **`Path.of("sinhvien.csv")`** — đường dẫn tới file (nằm cùng thư mục chạy chương trình).
- **`Files.write(FILE, dong)`** — ghi một danh sách chuỗi ra file, **mỗi phần tử một dòng**. Nếu file chưa có thì tạo mới, có rồi thì ghi đè.
- **`try/catch (IOException)`** — thao tác file **bắt buộc** xử lý `IOException` (lỗi nhập/xuất: hết đĩa, không có quyền ghi…). Java buộc bạn bọc `try/catch`, nếu không sẽ **không biên dịch được** — đây gọi là *checked exception*.

:::warning Thao tác file luôn cần try/catch
Khác với lỗi chia 0 (tự chọn bắt hay không), `IOException` là *checked exception* — compiler **bắt buộc** bạn xử lý. Đừng "nuốt" lỗi bằng catch rỗng; ít nhất hãy in thông báo để biết chuyện gì xảy ra.
:::

---

## Bước 6: Đọc dữ liệu từ file khi khởi động

Khi chương trình mở lên, đọc lại file để khôi phục danh sách:

```java
static void docFile() {
    if (!Files.exists(FILE)) {
        return;   // chưa có file (lần chạy đầu) → bỏ qua, danh sách rỗng
    }
    try {
        List<String> dong = Files.readAllLines(FILE);
        for (String d : dong) {
            if (d.isBlank()) continue;          // bỏ dòng trống
            String[] phan = d.split(",");       // tách theo dấu phẩy
            String ma = phan[0];
            String ten = phan[1];
            double diem = Double.parseDouble(phan[2]);   // chuỗi → số
            danhSach.add(new Student(ma, ten, diem));
        }
        System.out.println("Đã nạp " + danhSach.size() + " sinh viên từ file.");
    } catch (IOException e) {
        System.out.println("Lỗi khi đọc file: " + e.getMessage());
    }
}
```

Giải thích:

- **`Files.exists(FILE)`** — kiểm tra file có tồn tại không; lần chạy đầu chưa có file nên ta `return` luôn.
- **`Files.readAllLines(FILE)`** — đọc toàn bộ file thành danh sách chuỗi, mỗi dòng một phần tử.
- **`d.split(",")`** — tách một dòng `"SV001,Nguyen Van A,8.5"` thành mảng `["SV001", "Nguyen Van A", "8.5"]`.
- **`Double.parseDouble(phan[2])`** — chuyển chuỗi `"8.5"` thành số `8.5`. Dữ liệu đọc từ file luôn là **chuỗi**, phải tự chuyển về số khi cần.

Gọi `docFile()` ngay đầu `main`, và `luuFile()` trước khi thoát.

---

## Code hoàn chỉnh

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Scanner;

class Student {
    private String maSV;
    private String ten;
    private double diem;

    Student(String maSV, String ten, double diem) {
        this.maSV = maSV;
        this.ten = ten;
        this.diem = diem;
    }

    public String getMaSV() { return maSV; }
    public String getTen()  { return ten; }
    public double getDiem() { return diem; }

    public void setDiem(double diem) {
        if (diem < 0 || diem > 10) {
            throw new IllegalArgumentException("Điểm phải từ 0 đến 10");
        }
        this.diem = diem;
    }

    public String toCsv() {
        return maSV + "," + ten + "," + diem;
    }
}

public class QuanLySinhVien {

    static final Path FILE = Path.of("sinhvien.csv");
    static ArrayList<Student> danhSach = new ArrayList<>();

    static void them(String ma, String ten, double diem) {
        danhSach.add(new Student(ma, ten, diem));
        System.out.println("Đã thêm: " + ten);
    }

    static void hienThi() {
        if (danhSach.isEmpty()) {
            System.out.println("(Danh sách trống)");
            return;
        }
        System.out.printf("%-8s %-20s %s%n", "Mã", "Tên", "Điểm");
        for (Student sv : danhSach) {
            System.out.printf("%-8s %-20s %.1f%n",
                    sv.getMaSV(), sv.getTen(), sv.getDiem());
        }
    }

    static void sapXepTheoDiem() {
        danhSach.sort(Comparator.comparingDouble(Student::getDiem).reversed());
        System.out.println("Đã sắp xếp theo điểm giảm dần.");
    }

    static void thongKe() {
        if (danhSach.isEmpty()) {
            System.out.println("(Chưa có dữ liệu)");
            return;
        }
        double trungBinh = danhSach.stream()
                .mapToDouble(Student::getDiem).average().orElse(0);
        double caoNhat = danhSach.stream()
                .mapToDouble(Student::getDiem).max().orElse(0);
        long soGioi = danhSach.stream()
                .filter(sv -> sv.getDiem() >= 8.0).count();

        System.out.printf("Điểm trung bình: %.2f%n", trungBinh);
        System.out.printf("Điểm cao nhất: %.1f%n", caoNhat);
        System.out.println("Số SV giỏi (>= 8.0): " + soGioi);
    }

    static void luuFile() {
        List<String> dong = new ArrayList<>();
        for (Student sv : danhSach) dong.add(sv.toCsv());
        try {
            Files.write(FILE, dong);
            System.out.println("Đã lưu " + danhSach.size() + " SV vào " + FILE);
        } catch (IOException e) {
            System.out.println("Lỗi khi ghi file: " + e.getMessage());
        }
    }

    static void docFile() {
        if (!Files.exists(FILE)) return;
        try {
            for (String d : Files.readAllLines(FILE)) {
                if (d.isBlank()) continue;
                String[] phan = d.split(",");
                danhSach.add(new Student(phan[0], phan[1],
                        Double.parseDouble(phan[2])));
            }
            System.out.println("Đã nạp " + danhSach.size() + " SV từ file.");
        } catch (IOException e) {
            System.out.println("Lỗi khi đọc file: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        docFile();   // nạp dữ liệu cũ khi khởi động
        boolean chay = true;

        System.out.println("=== QUẢN LÝ SINH VIÊN ===");
        while (chay) {
            System.out.println("\n1.Thêm  2.Xem  3.Sắp xếp điểm  4.Thống kê  5.Lưu  0.Thoát");
            System.out.print("Chọn: ");
            int chon = scanner.nextInt();
            scanner.nextLine();

            switch (chon) {
                case 1:
                    System.out.print("Mã SV: ");
                    String ma = scanner.nextLine();
                    System.out.print("Tên: ");
                    String ten = scanner.nextLine();
                    System.out.print("Điểm (0-10): ");
                    double diem = scanner.nextDouble();
                    try {
                        them(ma, ten, diem);
                    } catch (IllegalArgumentException e) {
                        System.out.println("Lỗi: " + e.getMessage());
                    }
                    break;
                case 2: hienThi(); break;
                case 3: sapXepTheoDiem(); break;
                case 4: thongKe(); break;
                case 5: luuFile(); break;
                case 0:
                    luuFile();        // tự lưu trước khi thoát
                    chay = false;
                    break;
                default: System.out.println("Lựa chọn không hợp lệ!");
            }
        }
        System.out.println("Tạm biệt!");
        scanner.close();
    }
}
```

Chạy thử: thêm vài sinh viên → chọn `0` thoát → mở lại chương trình, dữ liệu vẫn còn nhờ file `sinhvien.csv`. Mở file đó bằng trình soạn thảo để thấy nội dung CSV.

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `unreported exception IOException` | Quên bọc thao tác file trong `try/catch` | Bọc `Files.write`/`readAllLines` trong `try/catch (IOException e)` |
| `ArrayIndexOutOfBoundsException` khi đọc file | Dòng CSV thiếu trường hoặc file hỏng | Kiểm tra `phan.length == 3` trước khi dùng |
| `NumberFormatException` | Cột điểm trong file không phải số | Kiểm tra dữ liệu file; bọc `parseDouble` trong try/catch |
| Tên có dấu phẩy làm vỡ CSV | `split(",")` tách nhầm | Chọn ký tự phân cách khác (vd `;`) hoặc dùng thư viện CSV |
| Dữ liệu mất sau khi tắt | Quên gọi `luuFile()` | Gọi `luuFile()` ở nhánh thoát |

---

## Thử thách mở rộng

1. **Tìm kiếm:** thêm chức năng tìm sinh viên theo tên (dùng `filter` của Stream).
2. **Xếp loại:** thêm method `xepLoai()` trong `Student` trả về "Giỏi/Khá/TB/Yếu" theo điểm.
3. **Cập nhật điểm:** cho phép sửa điểm một sinh viên — dùng `setDiem` đã có sẵn kiểm tra.
4. **Nhóm theo xếp loại:** dùng `Collectors.groupingBy` để đếm số SV mỗi loại (Stream nâng cao).
5. **Định dạng file an toàn hơn:** chuyển sang lưu dạng JSON với thư viện như Jackson hoặc Gson (bước sang dự án thực tế).

---

## Tóm tắt

- **Đóng gói (encapsulation):** thuộc tính `private` + **getter/setter có kiểm tra** giúp object tự bảo vệ dữ liệu.
- **`Comparator`** định nghĩa tiêu chí sắp xếp: `comparingDouble(Student::getDiem).reversed()`.
- **Stream API** xử lý danh sách theo dây chuyền: `stream().mapToDouble(...).average()`, `filter(...).count()`.
- **Đọc/ghi file** với `Files.write` và `Files.readAllLines`; thao tác file **bắt buộc** `try/catch (IOException)`.
- Dữ liệu đọc từ file là **chuỗi** — nhớ chuyển kiểu (`Double.parseDouble`) và xác thực trước khi dùng.

🎉 Bạn đã hoàn thành cả 4 project console! Giờ hãy chọn một project và làm hết phần **thử thách mở rộng** — đó là lúc bạn thực sự trưởng thành thành lập trình viên Java.

Sẵn sàng lên cấp tiếp theo? Trong phần **nâng cao**, ta sẽ biến chính project quản lý sinh viên này thành một **REST API** để Frontend (React) kết nối: [REST API & Spring Boot](./6_gioi-thieu-rest-api.md).
