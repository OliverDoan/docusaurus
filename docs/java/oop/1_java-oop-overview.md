---
sidebar_position: 1
title: "1. Tổng quan về OOP trong Java"
---

# Tổng quan về OOP trong Java

Lập trình hướng đối tượng (Object-Oriented Programming -- OOP) là nền tảng cốt lõi của Java. Nếu bạn muốn viết chương trình Java thực sự, bạn **bắt buộc** phải hiểu OOP. Hãy tưởng tượng OOP giống như cách chúng ta nhìn nhận thế giới thực -- mọi thứ xung quanh đều là **đối tượng** có đặc điểm và hành vi riêng. Bài này sẽ giúp bạn hiểu rõ Class, Object, Constructor, Package và Access Modifier từ gốc.

---


---

## Mục lục

- [1. OOP là gì?](#1-oop-là-gì)
- [2. Class (Lớp)](#2-class-lớp)
- [3. Object (Đối tượng)](#3-object-đối-tượng)
- [4. Fields (Thuộc tính) và Methods (Phương thức)](#4-fields-thuộc-tính-và-methods-phương-thức)
- [5. Constructor (Hàm tạo)](#5-constructor-hàm-tạo)
- [6. Package (Gói)](#6-package-gói)
- [7. Access Modifier (Phạm vi truy cập)](#7-access-modifier-phạm-vi-truy-cập)
- [8. Từ khóa `new` và mô hình bộ nhớ](#8-từ-khóa-new-và-mô-hình-bộ-nhớ)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Tổng kết](#10-tổng-kết)
- [11. Câu hỏi phỏng vấn](#11-câu-hỏi-phỏng-vấn)

---

## 1. OOP là gì?

**OOP (Object-Oriented Programming)** là phương pháp lập trình tổ chức code xoay quanh **đối tượng (object)** thay vì chỉ là các hàm và lệnh tuần tự.

### Ví dụ từ đời thực

Hãy nghĩ về một **ngôi nhà**:

```
Bản thiết kế (Blueprint)  --->  Class (Lớp)
Ngôi nhà thực tế          --->  Object (Đối tượng)
Màu sơn, số phòng         --->  Fields (Thuộc tính)
Mở cửa, bật đèn           --->  Methods (Hành vi)
```

Từ **một bản thiết kế** (class), bạn có thể xây **nhiều ngôi nhà** (object) khác nhau. Mỗi ngôi nhà có màu sơn, số phòng riêng, nhưng đều tuân theo cùng bản thiết kế.

### Bốn tính chất của OOP

| Tính chất | Tiếng Anh | Ý nghĩa | Ví dụ đời thực |
|-----------|-----------|----------|----------------|
| Đóng gói | Encapsulation | Ẩn dữ liệu bên trong, chỉ cho phép truy cập qua giao diện | Máy ATM: bạn bấm nút rút tiền, không cần biết bên trong xử lý thế nào |
| Kế thừa | Inheritance | Lớp con kế thừa đặc điểm của lớp cha | Con mèo kế thừa đặc điểm của động vật |
| Đa hình | Polymorphism | Cùng một hành vi nhưng ứng xử khác nhau | Cùng nói "chào", nhưng người Việt nói "Xin chào", người Anh nói "Hello" |
| Trừu tượng | Abstraction | Ẩn chi tiết phức tạp, chỉ hiển thị phần cần thiết | Remote TV: bạn bấm nút, không cần biết mạch điện bên trong |

---

## 2. Class (Lớp)

**Class** là bản thiết kế (blueprint/template) để tạo ra đối tượng. Class định nghĩa:
- **Thuộc tính (fields/attributes):** đặc điểm của đối tượng
- **Phương thức (methods):** hành vi của đối tượng

### Cú pháp cơ bản

```java
public class TenClass {
    // Thuoc tinh (fields)
    kieu_du_lieu tenThuocTinh;

    // Phuong thuc (methods)
    kieu_tra_ve tenPhuongThuc(tham_so) {
        // than phuong thuc
    }
}
```

### Ví dụ: Tạo class SinhVien

```java
public class SinhVien {
    // --- Thuoc tinh (fields) ---
    String hoTen;
    int tuoi;
    double diemTrungBinh;
    String nganh;

    // --- Phuong thuc (methods) ---
    void hocBai() {
        System.out.println(hoTen + " dang hoc bai.");
    }

    void thiCuoiKy() {
        System.out.println(hoTen + " dang thi cuoi ky.");
    }

    void xemDiem() {
        System.out.println("Diem TB cua " + hoTen + ": " + diemTrungBinh);
    }
}
```

**Giải thích:**
- `SinhVien` là tên class (viết hoa chữ cái đầu -- PascalCase)
- `hoTen`, `tuoi`, `diemTrungBinh`, `nganh` là các thuộc tính
- `hocBai()`, `thiCuoiKy()`, `xemDiem()` là các phương thức

---

## 3. Object (Đối tượng)

**Object** là thể hiện cụ thể (instance) của một class. Mỗi object có bộ dữ liệu riêng.

### Tạo object bằng từ khóa `new`

```java
public class Main {
    public static void main(String[] args) {
        // Tao doi tuong thu 1
        SinhVien sv1 = new SinhVien();
        sv1.hoTen = "Nguyen Van An";
        sv1.tuoi = 20;
        sv1.diemTrungBinh = 8.5;
        sv1.nganh = "Cong nghe thong tin";

        // Tao doi tuong thu 2
        SinhVien sv2 = new SinhVien();
        sv2.hoTen = "Tran Thi Binh";
        sv2.tuoi = 21;
        sv2.diemTrungBinh = 9.0;
        sv2.nganh = "Kinh te";

        // Goi phuong thuc
        sv1.hocBai();       // Nguyen Van An dang hoc bai.
        sv2.thiCuoiKy();    // Tran Thi Binh dang thi cuoi ky.
        sv1.xemDiem();      // Diem TB cua Nguyen Van An: 8.5
    }
}
```

### So sánh Class và Object

| Tiêu chí | Class | Object |
|----------|-------|--------|
| Định nghĩa | Bản thiết kế, khuôn mẫu | Thể hiện cụ thể của class |
| Bộ nhớ | Không cấp phát bộ nhớ khi khai báo | Được cấp phát bộ nhớ khi dùng `new` |
| Tạo bằng | Từ khóa `class` | Từ khóa `new` |
| Số lượng | Khai báo một lần | Tạo được nhiều object từ một class |
| Ví dụ | Bản vẽ ngôi nhà | Ngôi nhà thực tế |

---

## 4. Fields (Thuộc tính) và Methods (Phương thức)

### Fields -- Đặc điểm của đối tượng

Fields lưu trữ **trạng thái** (state) của đối tượng. Mỗi object có bản sao riêng của fields.

```java
public class XeHoi {
    // Fields (thuoc tinh)
    String hang;          // Toyota, Honda, BMW...
    String mauSac;        // Do, Xanh, Trang...
    int namSanXuat;       // 2020, 2023...
    double tocDoHienTai;  // 0, 60.5, 120.0...
}
```

### Methods -- Hành vi của đối tượng

Methods định nghĩa **hành vi** (behavior) mà đối tượng có thể thực hiện.

```java
public class XeHoi {
    String hang;
    String mauSac;
    int namSanXuat;
    double tocDoHienTai;

    // Phuong thuc khong tra ve gia tri
    void tangToc(double tocDo) {
        tocDoHienTai += tocDo;
        System.out.println(hang + " tang toc len " + tocDoHienTai + " km/h");
    }

    void giamToc(double tocDo) {
        tocDoHienTai -= tocDo;
        if (tocDoHienTai < 0) {
            tocDoHienTai = 0;
        }
        System.out.println(hang + " giam toc con " + tocDoHienTai + " km/h");
    }

    // Phuong thuc co tra ve gia tri
    String layThongTin() {
        return hang + " - " + mauSac + " - Nam " + namSanXuat;
    }

    boolean dangChay() {
        return tocDoHienTai > 0;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        XeHoi xe = new XeHoi();
        xe.hang = "Toyota";
        xe.mauSac = "Trang";
        xe.namSanXuat = 2023;
        xe.tocDoHienTai = 0;

        xe.tangToc(60);     // Toyota tang toc len 60.0 km/h
        xe.tangToc(40);     // Toyota tang toc len 100.0 km/h
        xe.giamToc(30);     // Toyota giam toc con 70.0 km/h

        System.out.println(xe.layThongTin());  // Toyota - Trang - Nam 2023
        System.out.println("Dang chay: " + xe.dangChay());  // Dang chay: true
    }
}
```

---

## 5. Constructor (Hàm tạo)

**Constructor** là phương thức đặc biệt được gọi **tự động** khi tạo object bằng `new`. Constructor dùng để **khởi tạo giá trị ban đầu** cho object.

### Đặc điểm của Constructor

- Tên constructor **trùng tên class**
- **Không có kiểu trả về** (kể cả `void`)
- Được gọi **tự động** khi dùng `new`
- Có thể có nhiều constructor (overloading)

### 5.1. Default Constructor (Hàm tạo mặc định)

Nếu bạn không viết constructor nào, Java sẽ tự tạo một default constructor rỗng.

```java
public class SinhVien {
    String hoTen;
    int tuoi;

    // Java tu tao constructor nay neu ban khong viet:
    // public SinhVien() { }
}

// Su dung
SinhVien sv = new SinhVien();  // goi default constructor
sv.hoTen = "An";               // gan gia tri sau khi tao
```

### 5.2. Parameterized Constructor (Hàm tạo có tham số)

Cho phép truyền giá trị ngay khi tạo object.

```java
public class SinhVien {
    String hoTen;
    int tuoi;
    double diemTB;

    // Constructor co tham so
    public SinhVien(String hoTen, int tuoi, double diemTB) {
        this.hoTen = hoTen;     // this.hoTen = field, hoTen = tham so
        this.tuoi = tuoi;
        this.diemTB = diemTB;
    }

    void xemThongTin() {
        System.out.println(hoTen + " - " + tuoi + " tuoi - Diem: " + diemTB);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        // Tao object voi constructor co tham so
        SinhVien sv1 = new SinhVien("Nguyen Van An", 20, 8.5);
        SinhVien sv2 = new SinhVien("Tran Thi Binh", 21, 9.0);

        sv1.xemThongTin();  // Nguyen Van An - 20 tuoi - Diem: 8.5
        sv2.xemThongTin();  // Tran Thi Binh - 21 tuoi - Diem: 9.0
    }
}
```

### 5.3. Copy Constructor (Hàm tạo sao chép)

Tạo object mới bằng cách sao chép từ object đã có.

```java
public class SinhVien {
    String hoTen;
    int tuoi;
    double diemTB;

    // Constructor co tham so
    public SinhVien(String hoTen, int tuoi, double diemTB) {
        this.hoTen = hoTen;
        this.tuoi = tuoi;
        this.diemTB = diemTB;
    }

    // Copy constructor
    public SinhVien(SinhVien other) {
        this.hoTen = other.hoTen;
        this.tuoi = other.tuoi;
        this.diemTB = other.diemTB;
    }

    void xemThongTin() {
        System.out.println(hoTen + " - " + tuoi + " tuoi - Diem: " + diemTB);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        SinhVien sv1 = new SinhVien("Nguyen Van An", 20, 8.5);
        SinhVien sv2 = new SinhVien(sv1);  // Copy tu sv1

        sv2.xemThongTin();  // Nguyen Van An - 20 tuoi - Diem: 8.5

        // sv1 va sv2 la 2 object doc lap trong bo nho
        sv2.hoTen = "Nguyen Van An (ban sao)";
        sv1.xemThongTin();  // Nguyen Van An - 20 tuoi - Diem: 8.5 (khong bi anh huong)
        sv2.xemThongTin();  // Nguyen Van An (ban sao) - 20 tuoi - Diem: 8.5
    }
}
```

### 5.4. Constructor Overloading

Một class có thể có **nhiều constructor** với số lượng/kiểu tham số khác nhau.

```java
public class HoaDon {
    String tenKhach;
    double tongTien;
    String ghiChu;

    // Constructor 1: khong tham so
    public HoaDon() {
        this.tenKhach = "Khach vang lai";
        this.tongTien = 0;
        this.ghiChu = "";
    }

    // Constructor 2: co ten khach va tong tien
    public HoaDon(String tenKhach, double tongTien) {
        this.tenKhach = tenKhach;
        this.tongTien = tongTien;
        this.ghiChu = "";
    }

    // Constructor 3: day du tham so
    public HoaDon(String tenKhach, double tongTien, String ghiChu) {
        this.tenKhach = tenKhach;
        this.tongTien = tongTien;
        this.ghiChu = ghiChu;
    }
}
```

---

## 6. Package (Gói)

**Package** là cách Java tổ chức và nhóm các class liên quan lại với nhau, giống như **thư mục (folder)** trên máy tính.

### Tại sao cần Package?

| Lý do | Giải thích |
|-------|-----------|
| Tổ chức code | Nhóm các class liên quan (ví dụ: tất cả class về thanh toán vào một package) |
| Tránh trùng tên | Hai class cùng tên `User` có thể tồn tại trong hai package khác nhau |
| Kiểm soát truy cập | Package ảnh hưởng đến phạm vi truy cập (access modifier) |
| Tái sử dụng | Dễ dàng import class từ package khác |

### Cách khai báo Package

```java
// File: com/myapp/model/SinhVien.java
package com.myapp.model;

public class SinhVien {
    String hoTen;
    int tuoi;
}
```

### Quy ước đặt tên Package

```
com.tendomainngược.tenproject.module
```

| Ví dụ | Giải thích |
|-------|-----------|
| `com.google.search` | Package thuộc Google, module search |
| `com.myapp.model` | Package chứa các class dữ liệu |
| `com.myapp.service` | Package chứa logic nghiệp vụ |
| `com.myapp.controller` | Package xử lý request |

### Import class từ Package khác

```java
// Import mot class cu the
import com.myapp.model.SinhVien;

// Import tat ca class trong package
import com.myapp.model.*;

// Su dung class sau khi import
public class Main {
    public static void main(String[] args) {
        SinhVien sv = new SinhVien();
    }
}
```

### Package có sẵn trong Java (Built-in)

| Package | Chứa gì |
|---------|---------|
| `java.lang` | Các class cơ bản: `String`, `Math`, `System`, `Object` (tự động import) |
| `java.util` | Collections, Date, Random, Scanner... |
| `java.io` | Đọc/ghi file |
| `java.net` | Lập trình mạng |
| `java.sql` | Kết nối database |

---

## 7. Access Modifier (Phạm vi truy cập)

Access Modifier quyết định **ai có thể truy cập** vào class, field hoặc method. Java có 4 mức truy cập:

### Bảng tổng hợp

| Modifier | Trong class | Cùng package | Subclass (khác package) | Mọi nơi |
|----------|:-----------:|:------------:|:----------------------:|:--------:|
| `private` | CO | KHONG | KHONG | KHONG |
| default (không viết gì) | CO | CO | KHONG | KHONG |
| `protected` | CO | CO | CO | KHONG |
| `public` | CO | CO | CO | CO |

### Ví dụ minh họa chi tiết

```java
package com.myapp.model;

public class NhanVien {
    public String hoTen;           // Truy cap duoc tu moi noi
    protected String phongBan;     // Truy cap trong package + subclass
    String chucVu;                 // default: chi trong cung package
    private double luong;          // Chi trong chinh class nay

    public NhanVien(String hoTen, String phongBan, String chucVu, double luong) {
        this.hoTen = hoTen;
        this.phongBan = phongBan;
        this.chucVu = chucVu;
        this.luong = luong;
    }

    // public method - truy cap tu moi noi
    public String layThongTin() {
        return hoTen + " - " + phongBan + " - " + chucVu;
    }

    // private method - chi dung noi bo
    private double tinhThue() {
        return luong * 0.1;
    }

    // public method goi private method
    public double layLuongThucNhan() {
        return luong - tinhThue();
    }
}
```

```java
package com.myapp.main;

import com.myapp.model.NhanVien;

public class Main {
    public static void main(String[] args) {
        NhanVien nv = new NhanVien("An", "IT", "Dev", 15000000);

        System.out.println(nv.hoTen);          // OK - public
        // System.out.println(nv.phongBan);     // LOI - protected (khac package, khong phai subclass)
        // System.out.println(nv.chucVu);       // LOI - default (khac package)
        // System.out.println(nv.luong);         // LOI - private

        System.out.println(nv.layThongTin());          // OK - public method
        System.out.println(nv.layLuongThucNhan());     // OK - public method
        // System.out.println(nv.tinhThue());            // LOI - private method
    }
}
```

### Nguyên tắc chọn Access Modifier

| Tình huống | Nên dùng | Lý do |
|-----------|----------|-------|
| Field (thuộc tính) | `private` | Bảo vệ dữ liệu, truy cập qua getter/setter |
| Getter/Setter | `public` | Cho phép bên ngoài đọc/ghi dữ liệu |
| Method nội bộ | `private` | Không cần cho bên ngoài biết |
| Method cho subclass | `protected` | Cho phép class con override |
| Method cho mọi người | `public` | API công khai |

---

## 8. Từ khóa `new` và mô hình bộ nhớ

### Từ khóa `new`

Từ khóa `new` thực hiện 3 bước:
1. **Cấp phát bộ nhớ** trên Heap cho object mới
2. **Gọi constructor** để khởi tạo object
3. **Trả về tham chiếu** (địa chỉ) đến object trên Heap

```java
SinhVien sv = new SinhVien("An", 20, 8.5);
//  |           |
//  |           +--- Object nam tren HEAP (du lieu thuc te)
//  +--- Bien tham chieu nam tren STACK (luu dia chi)
```

### Stack vs Heap (Đơn giản hóa)

```
STACK (Ngan xep)                 HEAP (Vung nho dong)
+------------------+             +---------------------------+
| sv  -> [0x100]   |----------->| Object SinhVien (0x100)   |
| sv2 -> [0x200]   |----+       | hoTen = "An"              |
| x = 10           |    |       | tuoi = 20                 |
| y = 3.14         |    |       | diemTB = 8.5              |
+------------------+    |       +---------------------------+
                        +------>| Object SinhVien (0x200)   |
                                | hoTen = "Binh"            |
                                | tuoi = 21                 |
                                | diemTB = 9.0              |
                                +---------------------------+
```

| Stack | Heap |
|-------|------|
| Luu bien local va tham chieu | Luu object duoc tao boi `new` |
| Tu dong giai phong khi ra khoi scope | Garbage Collector don dep |
| Truy cap nhanh | Truy cap cham hon Stack |
| Kich thuoc nho | Kich thuoc lon |

### Ví dụ: Hai biến cùng trỏ đến một object

```java
SinhVien sv1 = new SinhVien("An", 20, 8.5);
SinhVien sv2 = sv1;  // sv2 TRO DEN CUNG object voi sv1

sv2.hoTen = "Binh";
System.out.println(sv1.hoTen);  // "Binh" -- vi sv1 va sv2 cung tro den 1 object!
```

**Luu y:** Dau `=` voi object khong tao ban sao, ma chi **copy dia chi tham chieu**. Muon tao ban sao thuc su, phai dung copy constructor hoac `clone()`.

---

## 9. Lỗi thường gặp

### Loi 1: Quen khoi tao object

```java
// SAI
SinhVien sv;
sv.hoTen = "An";  // NullPointerException! sv chua duoc khoi tao

// DUNG
SinhVien sv = new SinhVien();
sv.hoTen = "An";
```

### Loi 2: Nhầm lẫn giữa class và object

```java
// SAI - khong the goi method tren class (tru static method)
SinhVien.hocBai();  // Loi bien dich

// DUNG - goi method tren object
SinhVien sv = new SinhVien();
sv.hocBai();
```

### Loi 3: Constructor trùng tên nhưng sai kiểu trả về

```java
// SAI - co kieu tra ve void -> day la method, KHONG phai constructor
public class SinhVien {
    void SinhVien() {  // Day la method binh thuong, khong phai constructor!
        System.out.println("Tao sinh vien");
    }
}

// DUNG - constructor KHONG co kieu tra ve
public class SinhVien {
    SinhVien() {  // Day moi la constructor
        System.out.println("Tao sinh vien");
    }
}
```

### Loi 4: Truy cập private field từ bên ngoài

```java
public class TaiKhoan {
    private double soDu;
}

// SAI
TaiKhoan tk = new TaiKhoan();
tk.soDu = 1000000;  // Loi bien dich! soDu la private

// DUNG - dung getter/setter
public class TaiKhoan {
    private double soDu;

    public double getSoDu() {
        return soDu;
    }

    public void setSoDu(double soDu) {
        if (soDu >= 0) {
            this.soDu = soDu;
        }
    }
}
```

---

## 10. Tổng kết

| Khái niệm | Mô tả | Ví dụ |
|-----------|-------|-------|
| Class | Bản thiết kế cho đối tượng | `class SinhVien { ... }` |
| Object | Thể hiện cụ thể của class | `new SinhVien()` |
| Field | Thuộc tính/dữ liệu của object | `String hoTen;` |
| Method | Hành vi/chức năng của object | `void hocBai() { ... }` |
| Constructor | Hàm tạo, khởi tạo object | `SinhVien(String hoTen)` |
| Package | Nhóm các class liên quan | `package com.myapp.model;` |
| Access Modifier | Phạm vi truy cập | `private`, `public`, `protected` |
| `new` | Tạo object trên Heap | `new SinhVien()` |

---

## 11. Câu hỏi phỏng vấn

### Cau 1: Sự khác nhau giữa Class và Object?

**Tra loi:**

Class là bản thiết kế (blueprint) định nghĩa thuộc tính và hành vi. Object là thể hiện cụ thể (instance) của class, được tạo bằng từ khóa `new` và được cấp phát bộ nhớ trên Heap.

```java
// Class: dinh nghia mot lan
public class Xe {
    String mau;
    void chay() { }
}

// Object: tao nhieu lan tu class
Xe xe1 = new Xe();  // Object 1
Xe xe2 = new Xe();  // Object 2
```

### Cau 2: Constructor và Method khác nhau thế nào?

**Tra loi:**

| Tiêu chí | Constructor | Method |
|----------|-------------|--------|
| Tên | Trùng tên class | Đặt tên tự do |
| Kiểu trả về | Không có | Có (`void`, `int`, `String`...) |
| Gọi khi nào | Tự động khi `new` | Gọi thủ công qua object |
| Mục đích | Khởi tạo object | Thực hiện hành vi |
| Kế thừa | Không bị kế thừa | Có thể bị kế thừa |

### Cau 3: Nếu không viết constructor, chuyện gì xảy ra?

**Tra loi:**

Java tự tạo **default constructor** (constructor không tham số, thân rỗng). Tuy nhiên, nếu bạn viết **bất kỳ constructor nào** có tham số, Java sẽ **không tạo default constructor** nữa. Khi đó nếu muốn dùng constructor không tham số, bạn phải tự viết.

```java
public class Xe {
    String mau;

    // Viet constructor co tham so
    public Xe(String mau) {
        this.mau = mau;
    }
}

// LOI: khong co default constructor nua!
Xe xe = new Xe();  // Loi bien dich

// Phai viet them:
// public Xe() { this.mau = "Trang"; }
```

### Cau 4: Giải thích 4 mức Access Modifier trong Java?

**Tra loi:**

- `private`: Chi truy cap trong cung class. Dung cho field de bao ve du lieu.
- default (khong ghi gi): Truy cap trong cung package. Tu dong ap dung khi khong ghi modifier.
- `protected`: Truy cap trong cung package + subclass o package khac. Dung cho method muon cho class con override.
- `public`: Truy cap tu moi noi. Dung cho API cong khai.

### Cau 5: Stack va Heap khac nhau the nao trong Java?

**Tra loi:**

Stack luu cac bien local, tham so method va dia chi tham chieu. Stack tu dong giai phong khi method ket thuc. Heap luu cac object duoc tao boi `new`. Heap duoc don dep boi Garbage Collector khi khong con tham chieu nao tro den object.

```java
void test() {
    int x = 10;                        // x nam tren Stack
    SinhVien sv = new SinhVien("An");   // sv (tham chieu) tren Stack
                                        // Object SinhVien tren Heap
}
// Khi test() ket thuc: x va sv bi xoa khoi Stack
// Object SinhVien tren Heap se duoc GC don dep khi khong con ai tro den
```
