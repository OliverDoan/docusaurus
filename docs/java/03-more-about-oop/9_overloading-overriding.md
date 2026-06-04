---
sidebar_position: 9
title: "9. Nạp chồng và Ghi đè (Overloading / Overriding)"
---

# Nạp chồng và Ghi đè (Overloading / Overriding)

---

## Mục lục

- [Hai khái niệm dễ nhầm](#hai-khái-niệm-dễ-nhầm)
- [Overloading — nạp chồng](#overloading--nạp-chồng)
- [Quy tắc của overloading](#quy-tắc-của-overloading)
- [Overriding — ghi đè](#overriding--ghi-đè)
- [Annotation @Override](#annotation-override)
- [Quy tắc của overriding](#quy-tắc-của-overriding)
- [Bảng so sánh nhanh](#bảng-so-sánh-nhanh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Hai khái niệm dễ nhầm

Hai từ này nghe rất giống nhau nhưng hoàn toàn khác:

- **Overloading** (nạp chồng — nhiều phương thức **cùng tên** nhưng **khác tham số** trong cùng một lớp).
- **Overriding** (ghi đè — lớp con **viết lại** phương thức đã có ở lớp cha).

Mẹo nhớ: "load" (nạp) → thêm nhiều phiên bản cùng tên; "ride" (cưỡi đè) → lớp con đè lên phương thức của lớp cha.

---

## Overloading — nạp chồng

**Overloading** cho phép có nhiều phương thức cùng tên, miễn là danh sách tham số khác nhau (khác số lượng hoặc khác kiểu). Java tự chọn phiên bản đúng dựa vào tham số bạn truyền.

```java
public class MayTinh {
    // Phiên bản 1: cộng hai số nguyên
    int cong(int a, int b) {
        return a + b;
    }

    // Phiên bản 2: cộng ba số nguyên (KHÁC số lượng tham số)
    int cong(int a, int b, int c) {
        return a + b + c;
    }

    // Phiên bản 3: cộng hai số thực (KHÁC kiểu tham số)
    double cong(double a, double b) {
        return a + b;
    }
}
```

Java tự chọn đúng phiên bản:

```java
public class Main {
    public static void main(String[] args) {
        MayTinh mt = new MayTinh();

        System.out.println(mt.cong(2, 3));        // gọi phiên bản 1 -> 5
        System.out.println(mt.cong(2, 3, 4));     // gọi phiên bản 2 -> 9
        System.out.println(mt.cong(2.5, 3.5));    // gọi phiên bản 3 -> 6.0
    }
}
```

Ví dụ quen thuộc: `System.out.println()` có rất nhiều phiên bản overload (in số, in chuỗi, in boolean...).

---

## Quy tắc của overloading

Để được coi là overloading, các phương thức cùng tên phải **khác nhau ở danh sách tham số**:

- Khác **số lượng** tham số, HOẶC
- Khác **kiểu** tham số, HOẶC
- Khác **thứ tự** kiểu tham số.

```java
public class ViDu {
    void in(int a, String b) { } // hợp lệ
    void in(String a, int b) { } // hợp lệ: khác THỨ TỰ kiểu

    // KHÔNG hợp lệ: chỉ khác kiểu TRẢ VỀ không tính là overload
    // int in(int a, String b) { return 0; } // LỖI: trùng tham số với phương thức trên
}
```

Lưu ý quan trọng: **kiểu trả về và tên tham số KHÔNG** dùng để phân biệt overload — chỉ danh sách kiểu tham số mới tính.

---

## Overriding — ghi đè

**Overriding** xảy ra khi lớp con viết lại một phương thức đã có ở lớp cha, với **cùng tên và cùng danh sách tham số**. Mục đích: thay đổi hành vi cho phù hợp với lớp con.

```java
public class DongVat {
    void keu() {
        System.out.println("Dong vat keu...");
    }
}

public class Cho extends DongVat {
    // GHI ĐÈ phương thức keu() của lớp cha
    @Override
    void keu() {
        System.out.println("Gau gau!");
    }
}

public class Meo extends DongVat {
    @Override
    void keu() {
        System.out.println("Meo meo!");
    }
}
```

Khi chạy, Java dùng phiên bản của lớp con (đây là **đa hình** — polymorphism):

```java
public class Main {
    public static void main(String[] args) {
        DongVat dv1 = new Cho();
        DongVat dv2 = new Meo();

        dv1.keu(); // Gau gau!  (dùng phiên bản của Cho)
        dv2.keu(); // Meo meo!  (dùng phiên bản của Meo)
    }
}
```

---

## Annotation @Override

`@Override` (chú thích báo cho Java biết đây là phương thức ghi đè) không bắt buộc, nhưng **rất nên dùng**. Nó giúp Java kiểm tra: nếu bạn ghi đè sai (gõ nhầm tên, sai tham số), Java sẽ báo lỗi ngay.

```java
public class Cho extends DongVat {
    // Có @Override: nếu gõ nhầm "kue" Java sẽ báo lỗi vì lớp cha không có "kue"
    @Override
    void keu() {
        System.out.println("Gau gau!");
    }
}
```

Không có `@Override`, lỗi gõ nhầm sẽ tạo ra một phương thức MỚI thay vì ghi đè, và bạn rất khó phát hiện.

---

## Quy tắc của overriding

Phương thức ghi đè phải tuân thủ:

- **Cùng tên** và **cùng danh sách tham số** với phương thức lớp cha.
- Kiểu trả về giống nhau (hoặc là lớp con của kiểu trả về gốc — gọi là covariant return).
- **Không được thu hẹp** phạm vi truy cập (ví dụ lớp cha `public` thì lớp con không được để `private`).
- Chỉ ghi đè được phương thức không phải `private`, `static`, hay `final`.

```java
public class DongVat {
    public void keu() { System.out.println("..."); }
}

public class Cho extends DongVat {
    // ĐÚNG: cùng tên, cùng tham số, giữ public
    @Override
    public void keu() { System.out.println("Gau"); }

    // SAI: không được hạ xuống private
    // @Override private void keu() { } // LỖI
}
```

---

## Bảng so sánh nhanh

| Tiêu chí | Overloading (nạp chồng) | Overriding (ghi đè) |
|----------|------------------------|---------------------|
| Vị trí | Cùng một lớp | Lớp con vs lớp cha |
| Tên phương thức | Giống nhau | Giống nhau |
| Tham số | Phải KHÁC | Phải GIỐNG |
| Kiểu trả về | Có thể khác | Giống (hoặc covariant) |
| Liên kết | Lúc biên dịch (static) | Lúc chạy (dynamic) |
| Mục đích | Nhiều cách gọi cùng tên | Thay đổi hành vi cho lớp con |

---

## Lỗi thường gặp

- **Tưởng đổi kiểu trả về là overload**: chỉ đổi kiểu trả về (cùng tham số) gây lỗi trùng phương thức.
- **Quên `@Override`**: gõ nhầm tên tạo phương thức mới thay vì ghi đè, khó phát hiện.
- **Thu hẹp phạm vi truy cập khi override**: lớp cha `public` mà lớp con để `private` → lỗi.
- **Cố ghi đè phương thức `final`**: không được phép.
- **Nhầm overload với override**: overload trong cùng lớp (khác tham số), override giữa cha-con (cùng tham số).

---

## Tóm tắt

- **Overloading** (nạp chồng): nhiều phương thức cùng tên, khác tham số, trong cùng lớp. Java chọn lúc biên dịch.
- **Overriding** (ghi đè): lớp con viết lại phương thức lớp cha, cùng tên cùng tham số. Java chọn lúc chạy (đa hình).
- Luôn dùng `@Override` khi ghi đè để Java kiểm tra giúp.
- Overload phân biệt bằng danh sách tham số (không phải kiểu trả về).
- Override không được thu hẹp phạm vi truy cập và không áp dụng cho `final`/`static`/`private`.
