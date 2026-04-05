---
sidebar_position: 8
title: "Tính trừu tượng (Abstraction)"
---

# Tính trừu tượng (Abstraction)

## Ví dụ thực tế để hiểu trừu tượng

Hãy nghĩ về việc **lái xe**. Khi bạn ngồi lên xe hơi:
- Bạn nhấn **chân ga** thì xe chạy nhanh hơn.
- Bạn đạp **phanh** thì xe dừng lại.
- Bạn xoay **vô lăng** thì xe rẽ trái/phải.

Bạn **không cần biết** bên trong động cơ có bao nhiêu xi-lanh, hệ thống phanh ABS hoạt động như thế nào, hay bộ trợ lực lái dùng thuỷ lực hay điện. Bạn chỉ cần biết: nhấn ga = nhanh, đạp phanh = dừng. Đó là **trừu tượng** -- ẩn đi chi tiết phức tạp, chỉ để lộ giao diện đơn giản.

Một ví dụ khác: **máy ATM**. Bạn nhét thẻ, nhập PIN, chọn số tiền, lấy tiền. Đơn giản vậy thôi. Bạn không cần biết máy ATM kết nối đến server ngân hàng như thế nào, xác thực PIN bằng thuật toán gì, hay tiền được đẩy ra bằng cơ chế nào.

---

## Trừu tượng là gì?

**Trừu tượng (Abstraction)** là quá trình **ẩn đi chi tiết triển khai** và **chỉ hiển thị các chức năng cần thiết** cho người sử dụng. Đây là một trong bốn tính chất cơ bản của OOP.

Nói cách khác:
- **Người dùng** chỉ cần biết đối tượng **LÀM GÌ** (What).
- **Chi tiết bên trong** về việc **LÀM NHƯ THẾ NÀO** (How) được ẩn đi.

Trong Java, trừu tượng đạt được thông qua hai cơ chế:
1. **Abstract Class** (lớp trừu tượng)
2. **Interface** (giao diện)

---

## Abstract Class

### Khái niệm

**Abstract class** là lớp được khai báo với từ khóa `abstract`. Nó có thể chứa cả phương thức trừu tượng (không có thân) lẫn phương thức cụ thể (có thân).

Đặc điểm quan trọng:
- **Không thể tạo object** từ abstract class bằng `new`.
- Có thể có constructor (dùng cho lớp con gọi `super()`).
- Có thể có fields (biến instance) với mọi access modifier.
- Có thể có phương thức `static`, `final`, phương thức thường.
- Lớp con kế thừa abstract class **phải implement tất cả** abstract methods, nếu không thì lớp con cũng phải là abstract.

### Cú pháp

```java
abstract class TenLopTruuTuong {
    // Thuộc tính bình thường
    protected String ten;

    // Constructor
    public TenLopTruuTuong(String ten) {
        this.ten = ten;
    }

    // Phương thức trừu tượng -- không có thân
    abstract void phuongThucTruuTuong();

    // Phương thức cụ thể -- có thân
    public void phuongThucCuThe() {
        System.out.println("Đây là phương thức cụ thể");
    }
}
```

### Ví dụ chi tiết

Hãy xây dựng hệ thống quản lý nhân viên:

```java
abstract class NhanVien {
    protected String hoTen;
    protected double luongCoBan;

    public NhanVien(String hoTen, double luongCoBan) {
        this.hoTen = hoTen;
        this.luongCoBan = luongCoBan;
    }

    // Mỗi loại nhân viên tính lương khác nhau --> abstract
    abstract double tinhLuong();

    // Mọi nhân viên đều hiển thị thông tin giống nhau --> cụ thể
    public void hienThiThongTin() {
        System.out.println("Nhân viên: " + hoTen);
        System.out.println("Lương: " + tinhLuong() + "đ");
    }
}

class NhanVienFullTime extends NhanVien {
    private double thuong;

    public NhanVienFullTime(String hoTen, double luongCoBan, double thuong) {
        super(hoTen, luongCoBan);
        this.thuong = thuong;
    }

    @Override
    double tinhLuong() {
        return luongCoBan + thuong;
    }
}

class NhanVienPartTime extends NhanVien {
    private int soGioLam;
    private double luongTheoGio;

    public NhanVienPartTime(String hoTen, int soGio, double luongGio) {
        super(hoTen, 0);
        this.soGioLam = soGio;
        this.luongTheoGio = luongGio;
    }

    @Override
    double tinhLuong() {
        return soGioLam * luongTheoGio;
    }
}

class NhanVienThucTap extends NhanVien {
    private double phuCap;

    public NhanVienThucTap(String hoTen, double phuCap) {
        super(hoTen, 0);
        this.phuCap = phuCap;
    }

    @Override
    double tinhLuong() {
        return phuCap;  // Thực tập chỉ có phụ cấp
    }
}

public class Main {
    public static void main(String[] args) {
        NhanVien[] danhSach = {
            new NhanVienFullTime("Nguyễn Văn A", 15000000, 3000000),
            new NhanVienPartTime("Trần Thị B", 80, 100000),
            new NhanVienThucTap("Lê Văn C", 3000000)
        };

        for (NhanVien nv : danhSach) {
            nv.hienThiThongTin();
            System.out.println("---");
        }
    }
}
```

Kết quả:
```text
Nhân viên: Nguyễn Văn A
Lương: 1.8E7đ
---
Nhân viên: Trần Thị B
Lương: 8000000.0đ
---
Nhân viên: Lê Văn C
Lương: 3000000.0đ
---
```

### Khi nào class BẮT BUỘC phải là abstract?

1. Khi class có **ít nhất một abstract method**.
2. Khi class **kế thừa abstract class** nhưng **chưa implement hết** abstract methods.
3. Khi bạn muốn **ngăn không cho tạo object trực tiếp** từ class đó.

```java
// Trường hợp 2: Con chưa implement hết -> cũng phải abstract
abstract class DongVat {
    abstract void an();
    abstract void keu();
}

// ChưaHoanThien chỉ implement an(), chưa implement keu()
// --> phải là abstract
abstract class DongVatNuoiTrong extends DongVat {
    @Override
    void an() {
        System.out.println("Ăn thức ăn chăn nuôi");
    }
    // keu() chưa implement -> lớp này vẫn abstract
}

// Cho implement keu() -> đã hoàn thiện -> không cần abstract
class Cho extends DongVatNuoiTrong {
    @Override
    void keu() {
        System.out.println("Gâu gâu!");
    }
}
```

---

## Abstract Class vs Concrete Class

| Tiêu chí | Abstract Class | Concrete Class |
|---|---|---|
| Từ khóa | `abstract class` | `class` |
| Tạo object | Khong duoc | Duoc |
| Abstract method | Co the co | Khong duoc co |
| Constructor | Co (cho lop con dung) | Co (dung truc tiep) |
| Mục đích | Làm "khuôn mẫu" cho lớp con | Tạo object sử dụng trực tiếp |

---

## Interface

### Khái niệm

**Interface** là một "hợp đồng" (contract) quy định lớp nào `implements` nó phải cung cấp những method nào. Interface giống như bản thiết kế kiến trúc -- chỉ nói "nhà phải có cửa, có mái" nhưng không nói cụ thể làm bằng gỗ hay kính.

### Đặc điểm cơ bản

- Tất cả method trong interface mặc định là `public abstract` (trước Java 8).
- Tất cả field mặc định là `public static final` (hằng số).
- Một class có thể `implements` **nhiều** interface.
- Không có constructor, không tạo object trực tiếp.

### Ví dụ cơ bản

```java
interface Bay {
    void catCanh();
    void haChanh();
}

interface Boi {
    void lanXuong();
    void noiLen();
}

// Máy bay chỉ bay
class MayBay implements Bay {
    @Override
    public void catCanh() {
        System.out.println("Máy bay cất cánh");
    }

    @Override
    public void haChanh() {
        System.out.println("Máy bay hạ cánh");
    }
}

// Tàu ngầm chỉ bơi
class TauNgam implements Boi {
    @Override
    public void lanXuong() {
        System.out.println("Tàu ngầm lặn xuống");
    }

    @Override
    public void noiLen() {
        System.out.println("Tàu ngầm nổi lên");
    }
}

// Vịt vừa bay vừa bơi -- implements nhiều interface
class Vit implements Bay, Boi {
    @Override
    public void catCanh() {
        System.out.println("Vịt vỗ cánh bay");
    }

    @Override
    public void haChanh() {
        System.out.println("Vịt đáp xuống mặt nước");
    }

    @Override
    public void lanXuong() {
        System.out.println("Vịt lặn xuống nước");
    }

    @Override
    public void noiLen() {
        System.out.println("Vịt nổi lên mặt nước");
    }
}
```

### Default Methods (Java 8+)

Từ Java 8, interface có thể chứa method có thân (body) bằng từ khóa `default`. Điều này giúp thêm method mới vào interface mà không làm hỏng các class đã implement nó.

```java
interface Logger {
    void log(String message);

    // Default method -- có sẵn implementation
    default void logInfo(String message) {
        log("[INFO] " + message);
    }

    default void logError(String message) {
        log("[ERROR] " + message);
    }
}

class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(message);
    }
    // logInfo() và logError() đã có sẵn nhờ default method
}

class FileLogger implements Logger {
    @Override
    public void log(String message) {
        // Ghi vào file (giả lập)
        System.out.println("Ghi vào file: " + message);
    }

    @Override
    public void logError(String message) {
        // Override default method cho logic riêng
        log("[CRITICAL ERROR] " + message);
    }
}

public class Main {
    public static void main(String[] args) {
        Logger console = new ConsoleLogger();
        console.logInfo("Ứng dụng khởi động");     // [INFO] Ứng dụng khởi động
        console.logError("Mất kết nối");            // [ERROR] Mất kết nối

        Logger file = new FileLogger();
        file.logInfo("Đang xử lý");                // Ghi vào file: [INFO] Đang xử lý
        file.logError("Lỗi database");              // Ghi vào file: [CRITICAL ERROR] Lỗi database
    }
}
```

### Static Methods trong Interface (Java 8+)

Interface cũng có thể chứa `static` methods -- hữu ích cho utility functions liên quan đến interface.

```java
interface SoSanh {
    int soSanhVoi(Object other);

    // Static method trong interface
    static int timMax(SoSanh a, SoSanh b) {
        return a.soSanhVoi(b) >= 0 ? 0 : 1;
    }
}
```

### Private Methods trong Interface (Java 9+)

Từ Java 9, interface có thể có `private` methods để tái sử dụng code giữa các default methods.

```java
interface Validator {
    default boolean validateEmail(String email) {
        return isNotEmpty(email) && email.contains("@");
    }

    default boolean validatePhone(String phone) {
        return isNotEmpty(phone) && phone.length() >= 10;
    }

    // Private helper method -- tránh trùng lặp code
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
```

---

## Abstract Class vs Interface: Bảng so sánh chi tiết

| Tiêu chí | Abstract Class | Interface |
|---|---|---|
| Từ khóa | `abstract class` | `interface` |
| Kế thừa | `extends` (1 class) | `implements` (nhiều interface) |
| Constructor | Co | Khong |
| Fields | Moi loai (private, protected...) | Chi `public static final` |
| Abstract methods | Co the co hoac khong | Tất cả method (trước Java 8) |
| Concrete methods | Co | `default` methods (Java 8+) |
| Static methods | Co | Co (Java 8+) |
| Private methods | Co | Co (Java 9+) |
| Đa kế thừa | Khong | Co |
| Access modifiers | Moi loai | Methods mac dinh `public` |
| Tốc độ | Nhanh hon | Cham hon (do phai tra cuu vtable) |

---

## Khi nào dùng Abstract Class? Khi nào dùng Interface?

### Dùng Abstract Class khi:

1. **Có code chung** cần chia sẻ giữa các lớp con liên quan.
2. Các lớp con có **nhiều thuộc tính/method chung**.
3. Cần khai báo fields **non-static, non-final**.
4. Cần access modifier **khác public** (protected, private).

```java
// Abstract class phù hợp -- chia sẻ logic chung
abstract class DatabaseConnection {
    protected String connectionString;
    protected boolean isConnected = false;

    // Code chung
    public void connect() {
        System.out.println("Đang kết nối đến: " + connectionString);
        isConnected = true;
        afterConnect(); // Template Method Pattern
    }

    public void disconnect() {
        isConnected = false;
        System.out.println("Đã ngắt kết nối");
    }

    // Lớp con tùy chỉnh
    protected abstract void afterConnect();
    public abstract String query(String sql);
}
```

### Dùng Interface khi:

1. Muốn định nghĩa **hành vi** (contract) mà nhiều class **không liên quan** đều có.
2. Cần **đa kế thừa** hành vi.
3. Muốn tách biệt "làm gì" khỏi "làm thế nào" (abstraction thuần túy).

```java
// Interface phù hợp -- nhiều class không liên quan đều có thể Serializable
interface Serializable {
    byte[] serialize();
    void deserialize(byte[] data);
}

// User và Config không liên quan, nhưng đều cần serialize
class User implements Serializable { /* ... */ }
class Config implements Serializable { /* ... */ }
class LogEntry implements Serializable { /* ... */ }
```

---

## Triển khai nhiều Interface

Đây là cách Java hỗ trợ "đa kế thừa" an toàn:

```java
interface Drawable {
    void draw();
}

interface Resizable {
    void resize(double factor);
}

interface Clickable {
    void onClick();
    default void onDoubleClick() {
        onClick();
        onClick();
    }
}

// Một class implement nhiều interface
class Button implements Drawable, Resizable, Clickable {
    private int width;
    private int height;
    private String label;

    public Button(String label, int width, int height) {
        this.label = label;
        this.width = width;
        this.height = height;
    }

    @Override
    public void draw() {
        System.out.println("Vẽ nút [" + label + "] ("
            + width + "x" + height + ")");
    }

    @Override
    public void resize(double factor) {
        this.width = (int)(width * factor);
        this.height = (int)(height * factor);
        System.out.println("Đã resize thành " + width + "x" + height);
    }

    @Override
    public void onClick() {
        System.out.println("Nút [" + label + "] được click!");
    }
}

public class Main {
    public static void main(String[] args) {
        Button btn = new Button("Submit", 100, 40);
        btn.draw();           // Vẽ nút [Submit] (100x40)
        btn.resize(1.5);      // Đã resize thành 150x60
        btn.onClick();         // Nút [Submit] được click!
        btn.onDoubleClick();   // Click 2 lần (default method)
    }
}
```

### Xử lý xung đột default method

Khi hai interface có default method cùng tên, class implement **bắt buộc** phải override:

```java
interface A {
    default void chao() {
        System.out.println("Chào từ A");
    }
}

interface B {
    default void chao() {
        System.out.println("Chào từ B");
    }
}

class C implements A, B {
    @Override
    public void chao() {
        // Bắt buộc override -- chọn một trong hai hoặc viết logic mới
        A.super.chao();  // Có thể gọi version cụ thể
        B.super.chao();  // Hoặc gọi cả hai
    }
}
```

---

## Lỗi thường gặp

### Lỗi 1: Cố tạo object từ abstract class

```java
// SAI
abstract class HinhHoc {
    abstract double tinhDienTich();
}

HinhHoc hinh = new HinhHoc(); // LOI BIEN DICH! Cannot instantiate abstract class

// DUNG -- Tạo object từ lớp con cụ thể
class HinhTron extends HinhHoc {
    private double banKinh;
    public HinhTron(double r) { this.banKinh = r; }

    @Override
    double tinhDienTich() { return Math.PI * banKinh * banKinh; }
}

HinhHoc hinh = new HinhTron(5.0); // OK -- polymorphism
```

### Lỗi 2: Quên implement abstract method

```java
// SAI
abstract class DongVat {
    abstract void an();
    abstract void keu();
}

// LOI! Chua implement keu() ma khong khai bao abstract
class Meo extends DongVat {
    @Override
    void an() {
        System.out.println("Mèo ăn cá");
    }
    // Quên implement keu() --> LOI BIEN DICH
}

// DUNG -- implement tất cả
class Meo extends DongVat {
    @Override
    void an() { System.out.println("Mèo ăn cá"); }

    @Override
    void keu() { System.out.println("Meo meo!"); }
}
```

### Lỗi 3: Khai báo field trong interface mà nghĩ là biến thông thường

```java
// SAI -- Field trong interface luôn là public static final
interface Config {
    String URL = "http://example.com"; // Thực chất là: public static final

    // Không thể thay đổi giá trị!
}

class MyApp implements Config {
    public void thayDoi() {
        // URL = "http://newurl.com"; // LOI BIEN DICH! final variable
    }
}
```

### Lỗi 4: Nhầm lẫn khi nào dùng abstract class vs interface

```java
// SAI -- Dùng abstract class chỉ để định nghĩa hành vi (nên dùng interface)
abstract class Printable {
    abstract void print();  // Không có state, không có code chung
}

// DUNG -- Dùng interface cho pure contract
interface Printable {
    void print();
}

// SAI -- Dùng interface khi cần chia sẻ code chung (nên dùng abstract class)
interface DatabaseHelper {
    default void connect(String url) {
        // Rất nhiều logic chung ở đây...
        // Interface không nên chứa business logic phức tạp
    }
}

// DUNG -- Dùng abstract class cho shared implementation
abstract class DatabaseHelper {
    protected String url;

    public void connect() {
        // Logic chung phức tạp
        System.out.println("Connecting to " + url);
        validate();
        openConnection();
    }

    protected abstract void validate();
    protected abstract void openConnection();
}
```

---

## Tổng kết

| Khái niệm | Mô tả |
|---|---|
| Abstraction | An chi tiet, chi lo hanh vi can thiet |
| Abstract class | Lop co abstract method, khong tao object truc tiep |
| Interface | Hop dong hanh vi, ho tro da ke thua |
| `default` method | Method co than trong interface (Java 8+) |
| `static` method | Static method trong interface (Java 8+) |
| `private` method | Private helper trong interface (Java 9+) |

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt chính giữa Abstract Class và Interface?

**Trả lời:**

- **Abstract class** dùng để chia sẻ code chung giữa các lớp **liên quan**. Có constructor, có field mọi loại, hỗ trợ mọi access modifier. Chỉ kế thừa được 1 abstract class.
- **Interface** dùng để định nghĩa "hợp đồng" hành vi cho các lớp **không nhất thiết liên quan**. Không có constructor, field chỉ `public static final`. Có thể implement nhiều interface.
- Từ Java 8+, ranh giới mờ hơn vì interface có default methods, nhưng abstract class vẫn phù hợp hơn khi cần state (fields) và logic chung phức tạp.

### Câu 2: Có thể khai báo abstract class không có abstract method không?

**Trả lời:**

**Có.** Abstract class có thể không chứa abstract method nào. Mục đích là ngăn không cho tạo object trực tiếp. Ví dụ: `java.awt.Component` là abstract class nhưng không có abstract method.

```java
abstract class Base {
    public void doSomething() {
        System.out.println("Doing something");
    }
    // Không có abstract method -- vẫn hợp lệ
}

// Base obj = new Base(); // LOI -- vẫn không tạo được object
class Child extends Base { } // OK
```

### Câu 3: Default method trong interface giải quyết vấn đề gì?

**Trả lời:**

Giải quyết **backward compatibility**. Trước Java 8, khi thêm method mới vào interface, tất cả class đang implement phải sửa code để implement method mới -- rất tốn công. Với default method, bạn thêm method có sẵn implementation, các class cũ không bị ảnh hưởng.

```java
// Trước Java 8: thêm logWarning() -> mọi class phải implement
// Sau Java 8: dùng default -> không ảnh hưởng class cũ
interface Logger {
    void log(String msg);
    default void logWarning(String msg) {  // Class cũ không cần sửa
        log("[WARNING] " + msg);
    }
}
```

### Câu 4: Interface có thể extend interface khác không?

**Trả lời:**

**Có.** Interface có thể `extends` một hoặc **nhiều** interface khác (đây là đa kế thừa ở level interface).

```java
interface Readable {
    void read();
}

interface Writable {
    void write();
}

// Interface kế thừa nhiều interface
interface ReadWritable extends Readable, Writable {
    void seek(int position);
}

// Class implement ReadWritable phải implement cả read(), write(), seek()
class FileStream implements ReadWritable {
    @Override
    public void read() { System.out.println("Reading..."); }
    @Override
    public void write() { System.out.println("Writing..."); }
    @Override
    public void seek(int pos) { System.out.println("Seeking to " + pos); }
}
```

### Câu 5: Tại sao abstract class có constructor nếu không tạo được object?

**Trả lời:**

Constructor trong abstract class dùng để **khởi tạo state** (fields) khi lớp con gọi `super()`. Mặc dù không tạo object trực tiếp, abstract class vẫn cần khởi tạo thuộc tính chung cho tất cả lớp con.

```java
abstract class NhanVien {
    protected String hoTen;
    protected double luongCoBan;

    // Constructor dùng cho lớp con
    public NhanVien(String hoTen, double luong) {
        this.hoTen = hoTen;
        this.luongCoBan = luong;
    }

    abstract double tinhLuong();
}

class NhanVienIT extends NhanVien {
    public NhanVienIT(String hoTen, double luong) {
        super(hoTen, luong); // Gọi constructor abstract class
    }

    @Override
    double tinhLuong() { return luongCoBan * 1.5; }
}
```

Nếu abstract class không có constructor, mỗi lớp con phải tự khởi tạo `hoTen` và `luongCoBan`, dẫn đến code trùng lặp.
