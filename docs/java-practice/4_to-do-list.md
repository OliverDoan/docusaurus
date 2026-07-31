---
sidebar_position: 4
title: "4. Quản lý công việc (To-Do List)"
---

# Project 3: Quản lý công việc (To-Do List)

Project này xây một ứng dụng quản lý công việc chạy trong terminal: thêm việc, xem danh sách, đánh dấu hoàn thành, xoá việc. Đây là lần đầu bạn dùng **class & object** để mô tả một "thực thể" (mỗi công việc), dùng **`ArrayList`** để lưu một danh sách thay đổi được, dùng **`enum`** cho trạng thái, và thực hiện đủ bộ thao tác **CRUD** (Create-Read-Update-Delete) — nền tảng của hầu hết phần mềm thực tế.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`class` định nghĩa kiểu dữ liệu mới, `object` (`new ...`) là thực thể cụ thể** — `constructor` khởi tạo, `this` trỏ tới chính object đó.
- ⭐ **`ArrayList<T>` là danh sách co giãn** — dùng `add`, `get`, `remove`, `size`, `isEmpty` để làm đủ bộ CRUD trong bộ nhớ.
- **`enum` khai báo tập giá trị cố định** — an toàn hơn `String` cho trạng thái vì compiler bắt lỗi khi gõ sai.
- **Index bắt đầu từ 0** — luôn kiểm tra `index >= 0 && index < size()` trước khi `get`/`remove` để tránh `IndexOutOfBoundsException`.
- **Bẫy kinh điển `nextInt()` rồi `nextLine()`** — gọi thêm một `scanner.nextLine()` để dọn ký tự Enter còn sót.

:::

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Mô tả công việc bằng class](#bước-1-mô-tả-công-việc-bằng-class)
- [Bước 2: Trạng thái công việc với enum](#bước-2-trạng-thái-công-việc-với-enum)
- [Bước 3: Lưu danh sách với ArrayList](#bước-3-lưu-danh-sách-với-arraylist)
- [Bước 4: Thêm và hiển thị công việc (Create & Read)](#bước-4-thêm-và-hiển-thị-công-việc-create--read)
- [Bước 5: Đánh dấu hoàn thành và xoá (Update & Delete)](#bước-5-đánh-dấu-hoàn-thành-và-xoá-update--delete)
- [Bước 6: Menu điều khiển](#bước-6-menu-điều-khiển)
- [Code hoàn chỉnh](#code-hoàn-chỉnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Một "công việc" có những thông tin gì? → **tiêu đề** và **trạng thái** (chưa làm / đã xong). Đây là dấu hiệu rõ ràng cần một **class** để gom các thông tin liên quan lại thành một "kiểu dữ liệu" của riêng mình.

Pseudocode menu:

```
Lặp lại:
    Hiển thị menu: 1.Thêm  2.Xem  3.Hoàn thành  4.Xoá  0.Thoát
    Đọc lựa chọn
    Tùy chọn → gọi chức năng tương ứng
```

---

## Bước 1: Mô tả công việc bằng class

Cho tới giờ ta chỉ dùng kiểu có sẵn (`int`, `double`, `String`). Giờ ta **tự định nghĩa kiểu mới** tên `CongViec`:

```java
class CongViec {
    String tieuDe;
    boolean hoanThanh;

    // constructor: chạy khi tạo công việc mới
    CongViec(String tieuDe) {
        this.tieuDe = tieuDe;
        this.hoanThanh = false;   // việc mới luôn chưa hoàn thành
    }
}
```

Giải thích:

- **`class CongViec`** — định nghĩa một "khuôn mẫu" cho công việc. Từ khuôn này ta tạo được nhiều **object** (đối tượng) khác nhau, mỗi cái là một công việc cụ thể.
- **`String tieuDe;` và `boolean hoanThanh;`** — các **thuộc tính (field)**: dữ liệu mà mỗi công việc mang theo.
- **`CongViec(String tieuDe)`** — **constructor** (hàm khởi tạo), trùng tên class, **không có kiểu trả về**. Nó chạy đúng một lần khi ta tạo object mới.
- **`this.tieuDe = tieuDe;`** — `this.tieuDe` là thuộc tính của object; `tieuDe` (bên phải) là tham số truyền vào. `this` giúp phân biệt hai cái trùng tên. Đọc là: "gán giá trị tham số vào thuộc tính của chính object này".

Tạo một object từ class:

```java
CongViec cv = new CongViec("Học Java");
System.out.println(cv.tieuDe);       // → Học Java
System.out.println(cv.hoanThanh);    // → false
```

**`new CongViec("Học Java")`** gọi constructor, tạo ra một object trong bộ nhớ và trả về cho biến `cv`. Dùng dấu `.` để truy cập thuộc tính: `cv.tieuDe`.

---

## Bước 2: Trạng thái công việc với enum

Dùng `boolean hoanThanh` thì chỉ có 2 trạng thái. Nếu sau này muốn thêm "đang làm" thì sao? **`enum`** là cách khai báo một tập giá trị cố định, rõ nghĩa:

```java
enum TrangThai {
    CHUA_LAM,
    DANG_LAM,
    HOAN_THANH
}
```

Sửa lại class dùng `enum` thay cho `boolean`:

```java
class CongViec {
    String tieuDe;
    TrangThai trangThai;

    CongViec(String tieuDe) {
        this.tieuDe = tieuDe;
        this.trangThai = TrangThai.CHUA_LAM;   // mặc định
    }
}
```

:::tip Vì sao dùng enum thay vì String?
Nếu lưu trạng thái bằng `String`, bạn có thể lỡ gõ `"hoan thanh"`, `"Hoàn Thành"`, `"done"`… loạn hết. `enum` chỉ cho phép đúng các giá trị đã khai báo (`CHUA_LAM`, `DANG_LAM`, `HOAN_THANH`) — **compiler bắt lỗi ngay** nếu gõ sai. An toàn hơn hẳn.
:::

---

## Bước 3: Lưu danh sách với ArrayList

Ta cần lưu **nhiều** công việc. Mảng thường (`CongViec[]`) có kích thước cố định — bất tiện khi thêm/xoá. `ArrayList` là danh sách **co giãn tự động**:

```java
import java.util.ArrayList;

ArrayList<CongViec> danhSach = new ArrayList<>();
```

Giải thích:

- **`ArrayList<CongViec>`** — một danh sách chỉ chứa các object `CongViec`. Phần `<CongViec>` gọi là **generic**, nói rõ "danh sách của cái gì" để Java kiểm tra kiểu giúp.
- **`new ArrayList<>()`** — tạo danh sách rỗng (cặp `<>` rỗng vì Java tự suy ra kiểu từ vế trái).

Các thao tác chính của `ArrayList`:

```java
danhSach.add(cv);              // thêm vào cuối
danhSach.get(0);               // lấy phần tử ở vị trí 0 (đầu tiên)
danhSach.remove(0);            // xoá phần tử ở vị trí 0
danhSach.size();               // số phần tử hiện có
```

:::info Vị trí (index) bắt đầu từ 0
Phần tử đầu tiên ở vị trí `0`, thứ hai ở `1`… Phần tử cuối ở vị trí `size() - 1`. Đây là quy ước chung của lập trình, cần nhớ kỹ để tránh lỗi lệch chỉ số.
:::

---

## Bước 4: Thêm và hiển thị công việc (Create & Read)

Viết hàm thêm và hàm hiển thị. Vì `danhSach` cần được nhiều hàm dùng chung, ta khai báo nó là **field static** của class chính:

```java
static ArrayList<CongViec> danhSach = new ArrayList<>();

static void themCongViec(String tieuDe) {
    danhSach.add(new CongViec(tieuDe));
    System.out.println("Đã thêm: " + tieuDe);
}

static void hienThi() {
    if (danhSach.isEmpty()) {
        System.out.println("(Chưa có công việc nào)");
        return;
    }
    System.out.println("--- DANH SÁCH CÔNG VIỆC ---");
    for (int i = 0; i < danhSach.size(); i++) {
        CongViec cv = danhSach.get(i);
        // in dạng:  1. [CHUA_LAM] Học Java
        System.out.println((i + 1) + ". [" + cv.trangThai + "] " + cv.tieuDe);
    }
}
```

Giải thích:

- **`danhSach.isEmpty()`** — trả `true` nếu danh sách rỗng; ta `return` sớm để khỏi in tiêu đề thừa.
- **Vòng `for`** duyệt từ `0` đến `size() - 1`, lấy từng công việc bằng `get(i)`.
- **`(i + 1)`** — hiển thị số thứ tự bắt đầu từ **1** cho thân thiện với người dùng, dù index nội bộ bắt đầu từ 0.
- Khi nối `enum` vào chuỗi (`+ cv.trangThai`), Java tự in tên hằng số, ví dụ `CHUA_LAM`.

---

## Bước 5: Đánh dấu hoàn thành và xoá (Update & Delete)

Người dùng chọn theo **số thứ tự** (bắt đầu từ 1), ta phải đổi về index (trừ 1) và **kiểm tra hợp lệ** trước khi truy cập:

```java
static void hoanThanh(int soThuTu) {
    int index = soThuTu - 1;
    if (index < 0 || index >= danhSach.size()) {
        System.out.println("Số thứ tự không hợp lệ!");
        return;
    }
    danhSach.get(index).trangThai = TrangThai.HOAN_THANH;
    System.out.println("Đã hoàn thành công việc " + soThuTu);
}

static void xoa(int soThuTu) {
    int index = soThuTu - 1;
    if (index < 0 || index >= danhSach.size()) {
        System.out.println("Số thứ tự không hợp lệ!");
        return;
    }
    CongViec daXoa = danhSach.remove(index);
    System.out.println("Đã xoá: " + daXoa.tieuDe);
}
```

:::warning Luôn kiểm tra index trước khi `get`/`remove`
Nếu danh sách có 3 việc mà người dùng nhập `5`, gọi `get(4)` sẽ ném `IndexOutOfBoundsException` và làm crash. Điều kiện `index < 0 || index >= size()` chặn cả hai phía. **Không bao giờ tin tưởng dữ liệu người dùng nhập** — luôn xác thực trước khi dùng.
:::

- **`danhSach.get(index).trangThai = ...`** — lấy object ra rồi đổi thuộc tính của nó. Vì object trong list là cùng một tham chiếu, sửa ở đây là sửa luôn trong danh sách.
- **`remove(index)`** trả về chính object vừa xoá, tiện để in tên ra xác nhận.

---

## Bước 6: Menu điều khiển

Ghép tất cả vào vòng lặp menu trong `main`:

```java
public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    boolean chay = true;

    while (chay) {
        System.out.println("\n1.Thêm  2.Xem  3.Hoàn thành  4.Xoá  0.Thoát");
        System.out.print("Chọn: ");
        int chon = scanner.nextInt();
        scanner.nextLine();   // dọn ký tự xuống dòng còn sót (xem lỗi thường gặp)

        switch (chon) {
            case 1:
                System.out.print("Tiêu đề công việc: ");
                themCongViec(scanner.nextLine());
                break;
            case 2:
                hienThi();
                break;
            case 3:
                System.out.print("Hoàn thành việc số: ");
                hoanThanh(scanner.nextInt());
                break;
            case 4:
                System.out.print("Xoá việc số: ");
                xoa(scanner.nextInt());
                break;
            case 0:
                chay = false;
                break;
            default:
                System.out.println("Lựa chọn không hợp lệ!");
        }
    }
    System.out.println("Tạm biệt!");
    scanner.close();
}
```

:::warning Bẫy kinh điển: `nextInt()` rồi `nextLine()`
`nextInt()` chỉ đọc con số, **để lại ký tự Enter** trong bộ đệm. Lần `nextLine()` tiếp theo sẽ đọc ngay ký tự Enter đó và trả về chuỗi rỗng — tiêu đề công việc bị "nhảy cóc". Cách sửa: gọi một `scanner.nextLine()` "dọn dẹp" ngay sau `nextInt()`, như dòng có ghi chú ở trên.
:::

---

## Code hoàn chỉnh

```java
import java.util.ArrayList;
import java.util.Scanner;

enum TrangThai { CHUA_LAM, DANG_LAM, HOAN_THANH }

class CongViec {
    String tieuDe;
    TrangThai trangThai;

    CongViec(String tieuDe) {
        this.tieuDe = tieuDe;
        this.trangThai = TrangThai.CHUA_LAM;
    }
}

public class QuanLyCongViec {

    static ArrayList<CongViec> danhSach = new ArrayList<>();

    static void themCongViec(String tieuDe) {
        danhSach.add(new CongViec(tieuDe));
        System.out.println("Đã thêm: " + tieuDe);
    }

    static void hienThi() {
        if (danhSach.isEmpty()) {
            System.out.println("(Chưa có công việc nào)");
            return;
        }
        System.out.println("--- DANH SÁCH CÔNG VIỆC ---");
        for (int i = 0; i < danhSach.size(); i++) {
            CongViec cv = danhSach.get(i);
            System.out.println((i + 1) + ". [" + cv.trangThai + "] " + cv.tieuDe);
        }
    }

    static void hoanThanh(int soThuTu) {
        int index = soThuTu - 1;
        if (index < 0 || index >= danhSach.size()) {
            System.out.println("Số thứ tự không hợp lệ!");
            return;
        }
        danhSach.get(index).trangThai = TrangThai.HOAN_THANH;
        System.out.println("Đã hoàn thành công việc " + soThuTu);
    }

    static void xoa(int soThuTu) {
        int index = soThuTu - 1;
        if (index < 0 || index >= danhSach.size()) {
            System.out.println("Số thứ tự không hợp lệ!");
            return;
        }
        CongViec daXoa = danhSach.remove(index);
        System.out.println("Đã xoá: " + daXoa.tieuDe);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean chay = true;

        System.out.println("=== QUẢN LÝ CÔNG VIỆC ===");
        while (chay) {
            System.out.println("\n1.Thêm  2.Xem  3.Hoàn thành  4.Xoá  0.Thoát");
            System.out.print("Chọn: ");
            int chon = scanner.nextInt();
            scanner.nextLine();

            switch (chon) {
                case 1:
                    System.out.print("Tiêu đề công việc: ");
                    themCongViec(scanner.nextLine());
                    break;
                case 2: hienThi(); break;
                case 3:
                    System.out.print("Hoàn thành việc số: ");
                    hoanThanh(scanner.nextInt());
                    break;
                case 4:
                    System.out.print("Xoá việc số: ");
                    xoa(scanner.nextInt());
                    break;
                case 0: chay = false; break;
                default: System.out.println("Lựa chọn không hợp lệ!");
            }
        }
        System.out.println("Tạm biệt!");
        scanner.close();
    }
}
```

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Tiêu đề công việc bị rỗng/nhảy cóc | `nextInt()` để sót Enter trong bộ đệm | Gọi `scanner.nextLine()` dọn dẹp sau `nextInt()` |
| `IndexOutOfBoundsException` | Truy cập index ngoài phạm vi danh sách | Kiểm tra `index >= 0 && index < size()` trước khi `get`/`remove` |
| `NullPointerException` khi dùng object | Quên `new` (object chưa được tạo) | Đảm bảo đã `new CongViec(...)` trước khi truy cập |
| Sửa thuộc tính không có tác dụng | Sửa trên bản sao thay vì phần tử trong list | Lấy đúng `danhSach.get(index)` rồi sửa trực tiếp |

---

## Thử thách mở rộng

1. **Trạng thái "đang làm":** thêm chức năng chuyển việc sang `DANG_LAM`.
2. **Độ ưu tiên:** thêm thuộc tính `int doUuTien` (1-3) vào `CongViec`, hiển thị kèm.
3. **Lọc:** thêm menu "Xem việc chưa xong" — chỉ hiển thị việc có trạng thái khác `HOAN_THANH`.
4. **Tách lớp quản lý:** chuyển các hàm thêm/xoá/hiển thị vào một class `QuanLy` riêng (luyện đóng gói — encapsulation).

---

## Tóm tắt

- **`class`** định nghĩa kiểu dữ liệu mới; **object** (`new ...`) là một thực thể cụ thể; **constructor** khởi tạo object; **`this`** trỏ tới chính object đó.
- **`enum`** khai báo tập giá trị cố định, an toàn hơn `String` cho trạng thái.
- **`ArrayList<T>`** là danh sách co giãn: `add`, `get`, `remove`, `size`, `isEmpty`.
- Index bắt đầu từ **0**; luôn **kiểm tra index** trước khi truy cập.
- Nhớ bẫy **`nextInt()` + `nextLine()`** và xác thực mọi dữ liệu người dùng nhập.

Tiếp theo: [Quản lý sinh viên + ghi file](./5_quan-ly-sinh-vien.md) — OOP đầy đủ, sắp xếp và lưu dữ liệu ra file.
