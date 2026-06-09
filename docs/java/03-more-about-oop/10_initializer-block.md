---
sidebar_position: 10
title: "10. Khối khởi tạo (Initializer Block)"
---

# Khối khởi tạo (Initializer Block)

Khối khởi tạo là một khối lệnh `{ }` chạy tự động để chuẩn bị dữ liệu cho đối tượng hoặc cho lớp, mà không cần đặt trong constructor. Nó hữu ích khi nhiều constructor cần dùng chung một đoạn khởi tạo, hoặc khi cần khởi tạo dữ liệu static phức tạp một lần duy nhất. Bài này giới thiệu instance block, static block và thứ tự thực thi khi tạo đối tượng.

---

## Mục lục

- [Khối khởi tạo là gì?](#khối-khởi-tạo-là-gì)
- [Instance initializer block](#instance-initializer-block)
- [Static initializer block](#static-initializer-block)
- [Thứ tự thực thi khi tạo đối tượng](#thứ-tự-thực-thi-khi-tạo-đối-tượng)
- [Ví dụ minh họa thứ tự đầy đủ](#ví-dụ-minh-họa-thứ-tự-đầy-đủ)
- [Khi nào nên dùng?](#khi-nào-nên-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Khối khởi tạo là gì?

**Khối khởi tạo** (initializer block — một khối lệnh `{ }` chạy tự động để chuẩn bị dữ liệu) là đoạn code chạy khi đối tượng được tạo hoặc khi lớp được nạp, mà không cần đặt trong constructor.

Có hai loại:

- **Instance initializer block** (khối khởi tạo cấp đối tượng): chạy mỗi lần tạo một đối tượng.
- **Static initializer block** (khối khởi tạo tĩnh): chạy MỘT lần duy nhất khi lớp được nạp.

---

## Instance initializer block

**Instance initializer block** là một khối `{ }` đặt trực tiếp trong lớp (không thuộc phương thức nào). Nó chạy mỗi khi tạo đối tượng, **trước** phần thân constructor.

```java
public class SanPham {
    String ten;
    int soLuong;

    // Instance initializer block: chạy mỗi lần new đối tượng
    {
        System.out.println("Khoi tao cap doi tuong dang chay");
        soLuong = 1; // gán giá trị mặc định
    }

    SanPham(String ten) {
        this.ten = ten;
        System.out.println("Constructor dang chay");
    }
}
```

Sử dụng:

```java
public class Main {
    public static void main(String[] args) {
        SanPham sp = new SanPham("Sach");
        // Kết quả in:
        // Khoi tao cap doi tuong dang chay  (block chạy trước)
        // Constructor dang chay              (constructor chạy sau)
        System.out.println(sp.soLuong); // 1
    }
}
```

Instance block hữu ích khi nhiều constructor cần dùng chung một đoạn khởi tạo — viết một lần trong block thay vì lặp lại.

---

## Static initializer block

**Static initializer block** thêm từ khóa `static` trước khối. Nó chạy **một lần duy nhất** khi lớp được nạp vào bộ nhớ (trước khi tạo đối tượng đầu tiên).

```java
public class CauHinh {
    static String phienBan;

    // Static block: chạy MỘT LẦN khi lớp được nạp
    static {
        System.out.println("Static block chay (chi 1 lan)");
        phienBan = "1.0.0";
    }

    CauHinh() {
        System.out.println("Constructor chay");
    }
}
```

Sử dụng:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Bat dau");
        CauHinh c1 = new CauHinh(); // static block chạy lần đầu tiên ở đây
        CauHinh c2 = new CauHinh(); // static block KHÔNG chạy lại

        // Kết quả:
        // Bat dau
        // Static block chay (chi 1 lan)
        // Constructor chay
        // Constructor chay
    }
}
```

Static block dùng để khởi tạo các thuộc tính `static` (dữ liệu dùng chung cho cả lớp) cần tính toán phức tạp.

---

## Thứ tự thực thi khi tạo đối tượng

Đây là phần quan trọng nhất. Khi bạn `new` một đối tượng, Java chạy theo thứ tự:

1. **Static block và static field** — chỉ chạy lần đầu lớp được nạp (theo thứ tự xuất hiện trong code).
2. **Instance initializer block và instance field** — chạy mỗi lần tạo đối tượng (theo thứ tự xuất hiện).
3. **Constructor** — chạy sau cùng.

Nếu có kế thừa, thứ tự đầy đủ phức tạp hơn: phần static của lớp cha trước lớp con, rồi đến instance của cha trước con.

---

## Ví dụ minh họa thứ tự đầy đủ

```java
public class ViDuThuTu {
    // (2) Static field
    static int demStatic = khoiTaoStatic();

    // (3) Static block
    static {
        System.out.println("3. Static block");
    }

    // (5) Instance field
    int demInstance = khoiTaoInstance();

    // (6) Instance block
    {
        System.out.println("6. Instance block");
    }

    // (7) Constructor
    ViDuThuTu() {
        System.out.println("7. Constructor");
    }

    static int khoiTaoStatic() {
        System.out.println("1. Static field khoi tao");
        return 0;
    }

    int khoiTaoInstance() {
        System.out.println("5. Instance field khoi tao");
        return 0;
    }

    public static void main(String[] args) {
        System.out.println("4. Bat dau main, sap tao doi tuong");
        new ViDuThuTu();
    }
}
```

Kết quả in ra theo thứ tự:

```
1. Static field khoi tao
3. Static block
4. Bat dau main, sap tao doi tuong
5. Instance field khoi tao
6. Instance block
7. Constructor
```

Lưu ý: static (mục 1, 3) chạy khi lớp được nạp, trước cả khi `main` bắt đầu chạy phần thân. Instance (5, 6) và constructor (7) chạy khi `new`.

---

## Khi nào nên dùng?

- **Static block**: khởi tạo dữ liệu `static` phức tạp (đọc cấu hình, dựng bảng tra cứu) một lần duy nhất.
- **Instance block**: chia sẻ code khởi tạo chung giữa nhiều constructor.

Trên thực tế, phần lớn trường hợp bạn vẫn nên dùng **constructor** cho dễ đọc. Initializer block chỉ dùng khi thật sự cần, vì nó dễ gây khó hiểu cho người đọc code.

---

## Lỗi thường gặp

- **Nhầm thứ tự chạy**: tưởng constructor chạy trước instance block — thực ra block chạy trước.
- **Tưởng static block chạy mỗi lần new**: nó chỉ chạy MỘT lần khi lớp được nạp.
- **Lạm dụng initializer block**: làm code khó hiểu; ưu tiên constructor khi có thể.
- **Truy cập biến instance trong static block**: static block chạy trước khi có đối tượng, không thấy biến instance.
- **Quên `static`**: viết block thường khi định viết static block → chạy sai thời điểm.

---

## Tóm tắt

- **Initializer block** là khối `{ }` chạy tự động để khởi tạo dữ liệu.
- **Instance block** chạy mỗi lần tạo đối tượng, trước constructor.
- **Static block** chạy MỘT lần khi lớp được nạp, trước cả `main`.
- Thứ tự: static field/block → instance field/block → constructor.
- Ưu tiên constructor cho dễ đọc; chỉ dùng block khi thật cần.
