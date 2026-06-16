---
sidebar_position: 3
title: "3. Trừu tượng (Abstraction)"
---

# Trừu tượng (Abstraction)

Trừu tượng là cách bạn tập trung mô tả "làm gì" mà giấu đi chi tiết "làm như thế nào". Trong Java, ta thể hiện nó bằng lớp trừu tượng (abstract class) và phương thức trừu tượng (abstract method) để đặt ra khuôn mẫu chung bắt buộc các lớp con phải tuân theo. Bài này giúp bạn hiểu vì sao cần trừu tượng và cách dùng nó để viết code linh hoạt; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có tính trừu tượng (abstraction)?](#vì-sao-có-tính-trừu-tượng-abstraction)
- [Trừu tượng là gì?](#trừu-tượng-là-gì)
- [Abstract class — lớp trừu tượng](#abstract-class--lớp-trừu-tượng)
- [Abstract method — phương thức trừu tượng](#abstract-method--phương-thức-trừu-tượng)
- [Vì sao cần trừu tượng?](#vì-sao-cần-trừu-tượng)
- [Khác gì với class thường?](#khác-gì-với-class-thường)
- [Kết hợp method thường và abstract](#kết-hợp-method-thường-và-abstract)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có tính trừu tượng (abstraction)?

**Vấn đề:** Người DÙNG một thành phần không cần (và không nên) biết chi tiết CÀI ĐẶT bên trong. Khi code phụ thuộc thẳng vào lớp cụ thể, chỉ cần đổi cài đặt là vỡ hàng loạt. Ngoài ra ta còn muốn ép các lớp con tuân theo một KHUÔN chung.

```java
// Code dính chặt vào từng lớp cụ thể — thêm hình mới là phải sửa chỗ này
class HinhTron {
    double r;
    double dienTichTron() { return 3.14 * r * r; }
}

class HinhChuNhat {
    double rong, cao;
    double dienTichChuNhat() { return rong * cao; }
}

class Main {
    public static void main(String[] args) {
        HinhTron tron = new HinhTron();
        tron.r = 2;
        // Mỗi loại một tên hàm khác nhau → khó gom chung, dễ vỡ khi đổi
        System.out.println(tron.dienTichTron());
    }
}
```

**Giải pháp:** TRỪU TƯỢNG — chỉ phơi bày "LÀM GÌ" (what) và giấu "LÀM THẾ NÀO" (how). Dùng `abstract class` làm khuôn: chứa code dùng chung và `abstract method` bắt buộc lớp con cài đặt, đồng thời không cho `new` trực tiếp. Người dùng chỉ lập trình theo abstraction, không phụ thuộc cài đặt cụ thể nên dễ thay đổi/mở rộng.

```java
// Khuôn chung: mọi hình đều có dienTich(), nhưng "làm thế nào" thì giấu đi
abstract class Hinh {
    abstract double dienTich(); // what: bắt buộc lớp con cài đặt
}

class HinhTron extends Hinh {
    double r;
    @Override
    double dienTich() { return 3.14 * r * r; } // how: giấu trong lớp con
}

class HinhChuNhat extends Hinh {
    double rong, cao;
    @Override
    double dienTich() { return rong * cao; }
}

class Main {
    public static void main(String[] args) {
        // Lập trình theo abstraction Hinh, không quan tâm hình cụ thể nào
        Hinh[] danhSach = { new HinhTron(), new HinhChuNhat() };
        for (Hinh h : danhSach) {
            System.out.println(h.dienTich());
        }
    }
}
```

:::tip[Dùng thực tế]
- **Hình học**: `abstract class Shape` với `area()` trừu tượng — mỗi hình tự tính diện tích theo cách riêng.
- **Khuôn xử lý chung (template method)**: lớp cha giữ luồng chung, để lớp con điền vào các bước trừu tượng.
- **Ẩn chi tiết sau API**: lộ ra giao diện trừu tượng, giấu cài đặt thật nên đổi bên trong không ảnh hưởng người dùng.
- **Lập trình theo abstraction**: khai báo biến/tham số bằng kiểu trừu tượng thay vì lớp cụ thể để dễ thay thế và mở rộng.
:::

---

## Trừu tượng là gì?

**Trừu tượng** (abstraction — chỉ tập trung vào "làm gì" mà giấu đi "làm như thế nào") là việc mô tả khái niệm chung mà chưa cần nói rõ chi tiết.

Ví dụ đời thường: "Phương tiện di chuyển" là một khái niệm trừu tượng. Bạn biết nó có thể "di chuyển", nhưng xe máy di chuyển khác ô tô, khác máy bay. Khái niệm "Phương tiện" tự nó không thể tồn tại cụ thể — bạn không thể mua "một chiếc phương tiện" chung chung, mà phải là một loại cụ thể.

Trong Java, ta thể hiện trừu tượng bằng **abstract class** (lớp trừu tượng) và **abstract method** (phương thức trừu tượng).

---

## Abstract class — lớp trừu tượng

**Abstract class** (lớp trừu tượng — lớp không thể tạo đối tượng trực tiếp, dùng làm khuôn mẫu) được khai báo với từ khóa `abstract`.

```java
// abstract: đây là lớp trừu tượng
public abstract class PhuongTien {
    String ten;

    void moTa() {
        System.out.println("Day la phuong tien: " + ten);
    }
}
```

Điểm đặc biệt: bạn **không thể** tạo đối tượng từ lớp trừu tượng.

```java
public class Main {
    public static void main(String[] args) {
        // LỖI: không thể tạo đối tượng từ lớp abstract
        // PhuongTien pt = new PhuongTien(); // SAI!

        // ĐÚNG: tạo từ lớp con cụ thể (sẽ khai báo bên dưới)
        PhuongTien xe = new XeMay();
    }
}
```

---

## Abstract method — phương thức trừu tượng

**Abstract method** (phương thức trừu tượng — phương thức chỉ có tên, không có phần thân) khai báo "việc cần làm" mà chưa nói "làm thế nào". Lớp con bắt buộc phải viết phần thân.

```java
public abstract class PhuongTien {
    String ten;

    // Phương thức trừu tượng: KHÔNG có thân, kết thúc bằng dấu ;
    abstract void diChuyen();

    // Phương thức thường: CÓ thân
    void khoiDong() {
        System.out.println(ten + " khoi dong");
    }
}

public class XeMay extends PhuongTien {
    XeMay() {
        this.ten = "Xe may";
    }

    // BẮT BUỘC viết thân cho phương thức trừu tượng
    @Override
    void diChuyen() {
        System.out.println("Xe may chay tren 2 banh");
    }
}

public class MayBay extends PhuongTien {
    MayBay() {
        this.ten = "May bay";
    }

    @Override
    void diChuyen() {
        System.out.println("May bay bay tren troi");
    }
}
```

Mỗi lớp con triển khai `diChuyen()` theo cách riêng. Đây chính là sức mạnh của trừu tượng.

---

## Vì sao cần trừu tượng?

Trừu tượng giúp:

1. **Đặt ra "hợp đồng"**: lớp cha quy định lớp con PHẢI có phương thức nào.
2. **Tránh tạo đối tượng vô nghĩa**: bạn không nên tạo "một phương tiện chung chung".
3. **Viết code linh hoạt**: dùng kiểu lớp cha để xử lý nhiều loại lớp con.

```java
public class Main {
    public static void main(String[] args) {
        // Dùng kiểu lớp cha PhuongTien để chứa nhiều loại
        PhuongTien[] danhSach = {
            new XeMay(),
            new MayBay()
        };

        // Mỗi đối tượng tự gọi diChuyen() của riêng nó
        for (PhuongTien pt : danhSach) {
            pt.diChuyen();
        }
        // Kết quả:
        // Xe may chay tren 2 banh
        // May bay bay tren troi
    }
}
```

---

## Khác gì với class thường?

| Đặc điểm | Class thường | Abstract class |
|----------|-------------|----------------|
| Tạo đối tượng bằng `new` | Được | KHÔNG được |
| Có abstract method | Không | Có thể có |
| Có method thường | Có | Có |
| Có thuộc tính | Có | Có |
| Có constructor | Có | Có (gọi qua `super`) |
| Mục đích | Tạo đối tượng cụ thể | Làm khuôn mẫu cho lớp con |

Tóm lại: class thường để **dùng trực tiếp**; abstract class để **làm nền tảng** cho các lớp con kế thừa.

---

## Kết hợp method thường và abstract

Một abstract class có thể trộn cả hai loại phương thức:

```java
public abstract class NhanVien {
    String ten;
    double luongCoBan;

    // Phương thức trừu tượng: mỗi loại nhân viên tính thưởng khác nhau
    abstract double tinhThuong();

    // Phương thức thường: dùng chung cho mọi nhân viên
    double tinhTongLuong() {
        return luongCoBan + tinhThuong(); // gọi method abstract bên trong
    }
}

public class NhanVienBanHang extends NhanVien {
    double doanhSo;

    @Override
    double tinhThuong() {
        return doanhSo * 0.1; // thưởng 10% doanh số
    }
}
```

Phương thức thường `tinhTongLuong()` có thể gọi phương thức trừu tượng `tinhThuong()` — đến lúc chạy, Java sẽ dùng phần thân của lớp con cụ thể.

---

## Lỗi thường gặp

- **Tạo đối tượng từ abstract class**: `new PhuongTien()` gây lỗi biên dịch.
- **Quên viết thân cho abstract method ở lớp con**: lớp con sẽ bị lỗi, trừ khi nó cũng là abstract.
- **Viết thân cho abstract method**: abstract method chỉ có tên và dấu `;`, không có `{ }`.
- **Nhầm abstract class với interface**: abstract class có thể có thuộc tính và constructor; interface thì khác (học ở bài Interfaces).
- **Quên từ khóa `abstract`** trên lớp khi nó chứa abstract method → lỗi.

---

## Tóm tắt

- **Trừu tượng** tập trung vào "làm gì", giấu đi "làm thế nào".
- **Abstract class** không thể tạo đối tượng trực tiếp, chỉ làm khuôn mẫu.
- **Abstract method** chỉ có tên, không có thân; lớp con **bắt buộc** viết phần thân.
- Trừu tượng giúp đặt "hợp đồng" và viết code linh hoạt với nhiều loại lớp con.
- Abstract class có thể trộn cả phương thức thường lẫn phương thức trừu tượng.
