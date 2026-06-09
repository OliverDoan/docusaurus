---
sidebar_position: 4
title: "4. Biến và phạm vi"
---

# Biến và phạm vi

Biến là một cái tên đại diện cho ô nhớ chứa dữ liệu, giống chiếc hộp có dán nhãn để bạn cất và lấy giá trị ra dùng. Hiểu cách khai báo biến và phạm vi sống của nó giúp bạn quản lý dữ liệu gọn gàng và tránh lỗi truy cập sai chỗ. Bài này giới thiệu cách khai báo, quy tắc đặt tên, ba loại biến, phạm vi (scope), từ khóa var và hằng số final; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Biến là gì?](#biến-là-gì)
- [Khai báo và gán giá trị](#khai-báo-và-gán-giá-trị)
- [Quy tắc đặt tên biến](#quy-tắc-đặt-tên-biến)
- [Ba loại biến trong Java](#ba-loại-biến-trong-java)
- [Phạm vi (scope) của biến](#phạm-vi-scope-của-biến)
- [Từ khóa var — suy luận kiểu](#từ-khóa-var--suy-luận-kiểu)
- [Hằng số với final](#hằng-số-với-final)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Biến là gì?

**Biến** (variable — một cái tên đại diện cho một ô nhớ chứa dữ liệu) giống như một chiếc hộp có dán nhãn. Nhãn là tên biến, bên trong hộp là giá trị. Bạn có thể lấy giá trị ra dùng hoặc thay giá trị mới vào.

Ví dụ: biến `tuoi` chứa số `25`. Khi bạn sinh nhật, bạn thay giá trị thành `26`.

---

## Khai báo và gán giá trị

**Khai báo** (declaration — tạo ra biến với một kiểu và tên) gồm hai phần: kiểu dữ liệu và tên biến. **Gán** (assignment — đặt giá trị vào biến) dùng dấu `=`.

```java
public class ViDuKhaiBao {
    public static void main(String[] args) {
        // Cách 1: khai báo rồi gán sau
        int diem;          // khai báo biến diem kiểu int
        diem = 90;         // gán giá trị 90

        // Cách 2: khai báo và gán cùng lúc (phổ biến)
        int tuoi = 25;
        String ten = "An";

        // Thay đổi giá trị biến
        tuoi = 26;         // gán giá trị mới

        System.out.println(ten + " - tuoi: " + tuoi + ", diem: " + diem);
    }
}
```

Dấu `=` trong lập trình KHÔNG có nghĩa "bằng nhau" như toán học, mà nghĩa là "gán giá trị bên phải vào biến bên trái".

---

## Quy tắc đặt tên biến

- Bắt đầu bằng chữ cái, dấu `_` hoặc `$` (không bắt đầu bằng số).
- Không chứa khoảng trắng, không trùng với từ khóa (`int`, `class`...).
- Phân biệt hoa/thường: `Tuoi` khác `tuoi`.
- Quy ước: tên biến viết kiểu **camelCase** — chữ đầu thường, các từ sau viết hoa chữ cái đầu, ví dụ `hoTenDayDu`.

```java
// Đúng
int soLuong = 10;
double giaTienSanPham = 99.5;

// Sai cú pháp
// int 2so = 5;        // không được bắt đầu bằng số
// int so luong = 5;   // không được có khoảng trắng
```

---

## Ba loại biến trong Java

```java
public class ViDuLoaiBien {
    // 1) Biến static (biến lớp): chung cho cả class, có từ khóa static
    static String tenTruong = "Dai hoc Bach Khoa";

    // 2) Biến instance (biến đối tượng): mỗi đối tượng có bản riêng
    int diemSinhVien;

    public static void main(String[] args) {
        // 3) Biến cục bộ (local): khai báo trong hàm, chỉ sống trong hàm
        int bienCucBo = 100;
        System.out.println(tenTruong + " - " + bienCucBo);
    }
}
```

- **Biến cục bộ** (local variable): khai báo bên trong một hàm hoặc khối, chỉ tồn tại trong đó. Phải gán giá trị trước khi dùng.
- **Biến instance** (instance variable): khai báo trong class nhưng ngoài hàm; mỗi đối tượng tạo ra có một bản sao riêng.
- **Biến static** (static variable / biến lớp): có từ khóa `static`; dùng chung cho mọi đối tượng của class.

(Biến instance và static sẽ rõ hơn khi bạn học OOP.)

---

## Phạm vi (scope) của biến

**Scope** (phạm vi — vùng code mà biến có thể được sử dụng) thường nằm trong cặp `{ }` nơi biến được khai báo. Ra khỏi cặp ngoặc đó, biến "biến mất".

```java
public class ViDuScope {
    public static void main(String[] args) {
        int x = 10;            // x sống trong toàn bộ hàm main

        if (x > 5) {
            int y = 20;        // y chỉ sống TRONG khối if này
            System.out.println(x + y); // dùng được cả x và y
        }
        // Ở đây không dùng được y nữa, vì đã ra khỏi khối if
        System.out.println(x); // x vẫn dùng được
        // System.out.println(y); // LỖI: y ngoài phạm vi
    }
}
```

Nguyên tắc: biến chỉ "sống" trong khối `{ }` chứa nó. Đây giúp tránh nhầm lẫn giữa các biến cùng tên ở những nơi khác nhau.

---

## Từ khóa var — suy luận kiểu

Từ Java 10 trở đi, bạn có thể dùng `var` để Java **tự suy luận kiểu** (type inference — máy tự đoán kiểu dựa trên giá trị gán). Chỉ dùng được cho **biến cục bộ** và phải gán giá trị ngay.

```java
public class ViDuVar {
    public static void main(String[] args) {
        var soLuong = 10;        // Java hiểu đây là int
        var giaTien = 99.5;      // Java hiểu đây là double
        var ten = "Java";        // Java hiểu đây là String

        // var KHÔNG có nghĩa là kiểu thay đổi được;
        // soLuong vẫn mãi là int.
        soLuong = 20;            // OK, vẫn là int
        // soLuong = "hai muoi"; // LỖI: không gán String cho int được

        System.out.println(ten + ": " + soLuong);
    }
}
```

Lưu ý: `var` không làm Java thành ngôn ngữ "lỏng kiểu". Kiểu được xác định cố định ngay lúc khai báo, chỉ là bạn không phải gõ tên kiểu ra.

---

## Hằng số với final

**Hằng số** (constant — giá trị không thay đổi sau khi gán) được tạo bằng từ khóa `final`. Theo quy ước, tên hằng viết HOA toàn bộ.

```java
public class ViDuHangSo {
    public static void main(String[] args) {
        final double THUE_VAT = 0.1;  // 10%, không đổi được
        // THUE_VAT = 0.2;            // LỖI: không gán lại final

        double giaGoc = 100;
        double giaSauThue = giaGoc + giaGoc * THUE_VAT;
        System.out.println("Gia sau thue: " + giaSauThue);
    }
}
```

---

## Lỗi thường gặp

- **Dùng biến cục bộ chưa gán giá trị** → lỗi "might not have been initialized".
- **Dùng biến ngoài phạm vi** của nó → lỗi "cannot find symbol".
- **Khai báo trùng tên biến** trong cùng một khối.
- **Gán lại biến `final`** → lỗi vì hằng số không đổi được.
- **Dùng `var` mà không gán giá trị ngay**: `var x;` sai, phải `var x = 5;`.

---

## Tóm tắt

- **Biến** là cái tên đại diện cho ô nhớ chứa giá trị; gán bằng dấu `=`.
- Có 3 loại: **cục bộ**, **instance**, **static**.
- **Scope** (phạm vi) của biến giới hạn trong cặp `{ }` chứa nó.
- `var` cho phép Java **tự suy luận kiểu** của biến cục bộ.
- `final` tạo **hằng số** không thể thay đổi.
