---
sidebar_position: 7
title: "7. Tính đa hình (Polymorphism)"
---

# Tính đa hình (Polymorphism)

## Ví dụ thực tế để hiểu đa hình

Hãy nghĩ về hành động **"đi"**. Cùng là "đi" nhưng mỗi người thực hiện khác nhau:
- Một em bé thì **bò**.
- Một người lớn thì **đi bộ**.
- Một tài xế thì **lái xe**.
- Một phi công thì **bay**.

Cùng một hành động, nhưng **cách thực hiện khác nhau** tùy thuộc vào đối tượng. Đó chính là **đa hình (Polymorphism)** -- từ gốc Hy Lạp: "poly" (nhiều) + "morph" (hình dạng) = nhiều hình dạng.

Một ví dụ khác: nút **"Play"** trên điện thoại. Bạn nhấn Play trong ứng dụng nhạc thì nó phát nhạc, nhấn Play trong ứng dụng video thì nó phát video, nhấn Play trong game thì bắt đầu trò chơi. Cùng một hành động "Play" nhưng kết quả hoàn toàn khác nhau tùy vào ngữ cảnh.

---

## Đa hình là gì?

**Đa hình (Polymorphism)** là khả năng một đối tượng có thể **thực hiện cùng một hành vi theo nhiều cách khác nhau**. Đây là một trong bốn tính chất cơ bản của OOP.

Trong Java, đa hình được chia thành **hai loại**:

| Loại | Tên gọi | Cơ chế | Thời điểm xác định |
|---|---|---|---|
| Compile-time Polymorphism | Đa hình tĩnh | Method Overloading | Lúc biên dịch |
| Runtime Polymorphism | Đa hình động | Method Overriding | Lúc chạy chương trình |

---

## Đa hình tại compile-time: Method Overloading

**Method Overloading** (nạp chồng phương thức) xảy ra khi trong cùng một class có **nhiều method cùng tên** nhưng khác nhau về:
- Số lượng tham số
- Kiểu dữ liệu tham số
- Thứ tự kiểu dữ liệu tham số

Compiler sẽ quyết định gọi method nào **tại thời điểm biên dịch** dựa trên tham số truyền vào.

### Overloading theo số lượng tham số

```java
class MayTinh {
    // Cộng 2 số
    public int cong(int a, int b) {
        return a + b;
    }

    // Cộng 3 số -- cùng tên nhưng khác số tham số
    public int cong(int a, int b, int c) {
        return a + b + c;
    }

    // Cộng mảng số
    public int cong(int[] mangSo) {
        int tong = 0;
        for (int so : mangSo) {
            tong += so;
        }
        return tong;
    }
}

public class Main {
    public static void main(String[] args) {
        MayTinh mt = new MayTinh();

        System.out.println(mt.cong(5, 3));            // 8
        System.out.println(mt.cong(5, 3, 2));          // 10
        System.out.println(mt.cong(new int[]{1,2,3,4})); // 10
    }
}
```

### Overloading theo kiểu dữ liệu tham số

```java
class InAn {
    public void in(String vanBan) {
        System.out.println("Chuỗi: " + vanBan);
    }

    public void in(int soNguyen) {
        System.out.println("Số nguyên: " + soNguyen);
    }

    public void in(double soThuc) {
        System.out.println("Số thực: " + soThuc);
    }

    public void in(String vanBan, int soLan) {
        for (int i = 0; i < soLan; i++) {
            System.out.println(vanBan);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        InAn printer = new InAn();

        printer.in("Hello");     // Chuỗi: Hello
        printer.in(42);          // Số nguyên: 42
        printer.in(3.14);        // Số thực: 3.14
        printer.in("Java", 3);   // In "Java" 3 lần
    }
}
```

### Lưu ý quan trọng: Overloading KHÔNG dựa trên kiểu trả về

```java
// SAI -- Không thể overload chỉ bằng kiểu trả về
class VongLap {
    public int tinh(int a) {
        return a * 2;
    }

    // LOI BIEN DICH! Cùng tên, cùng tham số, chỉ khác kiểu trả về
    public double tinh(int a) {
        return a * 2.0;
    }
}
```

Compiler không biết bạn muốn gọi method nào khi viết `obj.tinh(5)` vì cả hai đều nhận `int`.

---

## Đa hình tại runtime: Method Overriding

**Method Overriding** (ghi đè phương thức) xảy ra khi lớp con **cài đặt lại** phương thức đã có trong lớp cha. JVM quyết định gọi method nào **tại thời điểm chạy** dựa trên kiểu thực tế của object.

### Ví dụ cơ bản

```java
class DongVat {
    public void keu() {
        System.out.println("Động vật kêu...");
    }
}

class Cho extends DongVat {
    @Override
    public void keu() {
        System.out.println("Gâu gâu!");
    }
}

class Meo extends DongVat {
    @Override
    public void keu() {
        System.out.println("Meo meo!");
    }
}

class Ga extends DongVat {
    @Override
    public void keu() {
        System.out.println("Cục tác!");
    }
}

public class Main {
    public static void main(String[] args) {
        // Biến kiểu DongVat, nhưng object thực tế khác nhau
        DongVat dv1 = new Cho();
        DongVat dv2 = new Meo();
        DongVat dv3 = new Ga();

        dv1.keu();  // Gâu gâu!      -- gọi method của Cho
        dv2.keu();  // Meo meo!       -- gọi method của Meo
        dv3.keu();  // Cục tác!       -- gọi method của Ga
    }
}
```

Mặc dù cả ba biến đều khai báo kiểu `DongVat`, nhưng JVM gọi method theo **kiểu thực tế** của object (`Cho`, `Meo`, `Ga`). Đây chính là sức mạnh của đa hình runtime.

### Quy tắc overriding

| Quy tắc | Mô tả |
|---|---|
| Cùng tên | Method con phải cùng tên với method cha |
| Cùng tham số | Danh sách tham số phải giống hệt |
| Access modifier | Phải bằng hoặc rộng hơn (vd: `protected` -> `public` được, ngược lại không) |
| Kiểu trả về | Cùng kiểu hoặc kiểu con (covariant return) |
| `final` method | Không thể override |
| `static` method | Không phải overriding, mà là method hiding |
| `private` method | Không thể override (lớp con không thấy) |

---

## Dynamic Method Dispatch

**Dynamic Method Dispatch** là cơ chế JVM dùng để xác định method nào được gọi tại runtime. Khi bạn gọi method qua biến tham chiếu kiểu lớp cha, JVM sẽ kiểm tra **kiểu thực tế** của object để quyết định.

```java
class HinhHoc {
    public void ve() {
        System.out.println("Vẽ hình...");
    }

    public double tinhDienTich() {
        return 0;
    }
}

class HinhTron extends HinhHoc {
    private double banKinh;

    public HinhTron(double banKinh) {
        this.banKinh = banKinh;
    }

    @Override
    public void ve() {
        System.out.println("Vẽ hình tròn bán kính " + banKinh);
    }

    @Override
    public double tinhDienTich() {
        return Math.PI * banKinh * banKinh;
    }
}

class HinhVuong extends HinhHoc {
    private double canh;

    public HinhVuong(double canh) {
        this.canh = canh;
    }

    @Override
    public void ve() {
        System.out.println("Vẽ hình vuông cạnh " + canh);
    }

    @Override
    public double tinhDienTich() {
        return canh * canh;
    }
}

public class Main {
    public static void main(String[] args) {
        // Mảng chứa nhiều loại hình -- đa hình trong thực hành
        HinhHoc[] cacHinh = {
            new HinhTron(5),
            new HinhVuong(4),
            new HinhTron(3),
            new HinhVuong(7)
        };

        // Duyệt mảng -- JVM tự biết gọi method nào
        for (HinhHoc hinh : cacHinh) {
            hinh.ve();
            System.out.println("Diện tích: " + hinh.tinhDienTich());
            System.out.println("---");
        }
    }
}
```

Kết quả:
```text
Vẽ hình tròn bán kính 5.0
Diện tích: 78.53981633974483
---
Vẽ hình vuông cạnh 4.0
Diện tích: 16.0
---
Vẽ hình tròn bán kính 3.0
Diện tích: 28.274333882308138
---
Vẽ hình vuông cạnh 7.0
Diện tích: 49.0
---
```

Đây là lý do đa hình quan trọng: bạn viết code xử lý chung cho `HinhHoc`, nhưng khi chạy, mỗi loại hình tự biết cách `ve()` và `tinhDienTich()` riêng.

---

## Đa hình với Interface

Interface là nơi đa hình thể hiện rõ nhất. Bạn định nghĩa "hợp đồng" chung, và mỗi class triển khai theo cách riêng.

```java
interface ThanhToan {
    void thucHienThanhToan(double soTien);
    String layTenPhuongThuc();
}

class ThanhToanTienMat implements ThanhToan {
    @Override
    public void thucHienThanhToan(double soTien) {
        System.out.println("Thanh toán " + soTien + "đ bằng tiền mặt");
    }

    @Override
    public String layTenPhuongThuc() {
        return "Tiền mặt";
    }
}

class ThanhToanThe implements ThanhToan {
    private String soThe;

    public ThanhToanThe(String soThe) {
        this.soThe = soThe;
    }

    @Override
    public void thucHienThanhToan(double soTien) {
        System.out.println("Thanh toán " + soTien + "đ bằng thẻ " + soThe);
    }

    @Override
    public String layTenPhuongThuc() {
        return "Thẻ ngân hàng";
    }
}

class ThanhToanViDienTu implements ThanhToan {
    private String tenVi;

    public ThanhToanViDienTu(String tenVi) {
        this.tenVi = tenVi;
    }

    @Override
    public void thucHienThanhToan(double soTien) {
        System.out.println("Thanh toán " + soTien + "đ qua ví " + tenVi);
    }

    @Override
    public String layTenPhuongThuc() {
        return "Ví " + tenVi;
    }
}

public class CuaHang {
    // Method nhận interface -- không quan tâm cách thanh toán cụ thể
    public static void xuLyDonHang(ThanhToan phuongThuc, double soTien) {
        System.out.println("Phương thức: " + phuongThuc.layTenPhuongThuc());
        phuongThuc.thucHienThanhToan(soTien);
        System.out.println("Thanh toán thành công!");
        System.out.println("---");
    }

    public static void main(String[] args) {
        xuLyDonHang(new ThanhToanTienMat(), 100000);
        xuLyDonHang(new ThanhToanThe("1234-5678"), 250000);
        xuLyDonHang(new ThanhToanViDienTu("MoMo"), 50000);
    }
}
```

Khi cần thêm phương thức thanh toán mới (vd: QR Code), bạn chỉ cần tạo class mới `implements ThanhToan` mà **không cần sửa** `CuaHang` hay bất kỳ code nào đang có. Đây là nguyên tắc **Open/Closed Principle** -- mở cho mở rộng, đóng cho sửa đổi.

---

## Covariant Return Types

Từ Java 5 trở đi, method override có thể trả về **kiểu con** của kiểu trả về trong method cha. Đây gọi là **covariant return type**.

```java
class DongVat {
    public DongVat taoMoi() {
        System.out.println("Tạo động vật mới");
        return new DongVat();
    }
}

class Cho extends DongVat {
    @Override
    public Cho taoMoi() {  // Trả về Cho (kiểu con của DongVat) -- hợp lệ!
        System.out.println("Tạo chó mới");
        return new Cho();
    }
}

public class Main {
    public static void main(String[] args) {
        Cho cho = new Cho();
        Cho choMoi = cho.taoMoi(); // Không cần ép kiểu!
    }
}
```

Nếu không có covariant return, bạn phải viết:

```java
// Không covariant -- phải ép kiểu
DongVat dv = cho.taoMoi();
Cho choMoi = (Cho) dv; // Ép kiểu thủ công, dễ lỗi
```

---

## Đa hình KHÔNG áp dụng cho fields (thuộc tính)

Đây là điểm nhiều người nhầm lẫn. Đa hình runtime **chỉ áp dụng cho methods**, không áp dụng cho fields.

```java
class Cha {
    int giaTri = 100;
}

class Con extends Cha {
    int giaTri = 200;
}

public class Main {
    public static void main(String[] args) {
        Cha obj = new Con();  // Upcasting

        // Field: lấy theo kiểu THAM CHIẾU (Cha), không phải kiểu thực tế
        System.out.println(obj.giaTri);   // 100 (của Cha!)

        // Method: gọi theo kiểu THỰC TẾ (Con)
        // (nếu có method override thì sẽ gọi của Con)
    }
}
```

Lý do: fields được resolve tại compile-time dựa trên kiểu tham chiếu, trong khi methods được resolve tại runtime dựa trên kiểu object thực tế.

---

## So sánh Overloading và Overriding

| Tiêu chí | Overloading (Nạp chồng) | Overriding (Ghi đè) |
|---|---|---|
| Vị trí | Trong **cùng** class | Giữa class **cha** và **con** |
| Thời điểm | **Compile-time** | **Runtime** |
| Tham số | Phải **khác** | Phải **giống hệt** |
| Kiểu trả về | Có thể khác | Phải giống hoặc kiểu con (covariant) |
| Access modifier | Không ràng buộc | Phải bằng hoặc rộng hơn |
| `static` method | Có thể overload | Không thể override (chỉ hiding) |
| `final` method | Có thể overload | Không thể override |
| `private` method | Có thể overload | Không thể override |
| Đa hình | Tĩnh (static binding) | Động (dynamic binding) |

---

## Tại sao đa hình quan trọng?

### 1. Code linh hoạt và mở rộng

```java
// KHONG dung da hinh -- phải sửa code mỗi khi thêm loại mới
public void xuLy(Object obj) {
    if (obj instanceof Cho) {
        ((Cho) obj).sua();
    } else if (obj instanceof Meo) {
        ((Meo) obj).keu();
    } else if (obj instanceof Ga) {
        ((Ga) obj).gay();
    }
    // Thêm loại mới = thêm else if = sửa method này
}

// DUNG da hinh -- không cần sửa khi thêm loại mới
public void xuLy(DongVat dv) {
    dv.keu();  // JVM tự biết gọi method đúng
    // Thêm loại mới = chỉ tạo class mới, KHÔNG sửa code ở đây
}
```

### 2. Thiết kế hệ thống dễ bảo trì

Đa hình cho phép bạn viết code phụ thuộc vào **abstraction** (lớp cha/interface) thay vì **implementation** (lớp con cụ thể). Khi yêu cầu thay đổi, bạn chỉ cần thêm/sửa class con mà không ảnh hưởng đến code đang chạy.

---

## Lỗi thường gặp

### Lỗi 1: Nhầm Overloading với Overriding

```java
// SAI -- Đây là OVERLOADING, không phải OVERRIDING!
class Cha {
    public void chao(String ten) {
        System.out.println("Xin chào " + ten);
    }
}

class Con extends Cha {
    // Khác tham số --> đây là OVERLOADING, không phải OVERRIDING
    public void chao() {
        System.out.println("Xin chào!");
    }
}

Con con = new Con();
con.chao("An");  // Gọi method của Cha (vẫn còn)
con.chao();      // Gọi method của Con (thêm mới)
```

```java
// DUNG -- Override đúng cách
class Con extends Cha {
    @Override  // @Override giúp compiler kiểm tra
    public void chao(String ten) {
        System.out.println("Hello " + ten + "!");
    }
}
```

### Lỗi 2: Cố gắng override method `static`

```java
// SAI -- Static method không tham gia đa hình
class Cha {
    public static void chao() {
        System.out.println("Chào từ Cha");
    }
}

class Con extends Cha {
    public static void chao() {
        System.out.println("Chào từ Con");
    }
}

Cha obj = new Con();
obj.chao();  // "Chào từ Cha" -- KHÔNG gọi version Con!
             // Static method gọi theo kiểu tham chiếu, không phải kiểu thực tế
```

### Lỗi 3: Quên rằng field không có đa hình

```java
// SAI -- Nghĩ rằng field cũng đa hình
class Cha {
    String thongBao = "Tôi là Cha";
}

class Con extends Cha {
    String thongBao = "Tôi là Con";
}

Cha obj = new Con();
System.out.println(obj.thongBao); // "Tôi là Cha" -- không phải "Tôi là Con"!

// DUNG -- Dùng method để đạt đa hình
class Cha {
    public String layThongBao() {
        return "Tôi là Cha";
    }
}

class Con extends Cha {
    @Override
    public String layThongBao() {
        return "Tôi là Con";
    }
}

Cha obj = new Con();
System.out.println(obj.layThongBao()); // "Tôi là Con" -- đa hình!
```

### Lỗi 4: Overloading chỉ khác kiểu trả về

```java
// SAI -- Compiler không phân biệt được
class MayTinh {
    public int tinh(int a) { return a * 2; }
    public double tinh(int a) { return a * 2.0; } // LOI BIEN DICH!
}

// DUNG -- Phải khác tham số
class MayTinh {
    public int tinh(int a) { return a * 2; }
    public double tinh(double a) { return a * 2.0; } // OK -- khác kiểu tham số
}
```

---

## Tổng kết

| Khái niệm | Mô tả |
|---|---|
| Compile-time Polymorphism | Method Overloading -- cung class, cung ten, khac tham so |
| Runtime Polymorphism | Method Overriding -- lop con ghi de method lop cha |
| Dynamic Method Dispatch | JVM quyet dinh method nao duoc goi luc runtime |
| Covariant Return | Override co the tra ve kieu con cua kieu tra ve goc |
| Field khong da hinh | Chi method moi tham gia da hinh runtime |

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa Method Overloading và Method Overriding?

**Trả lời:**

- **Overloading**: cùng class, cùng tên, **khác tham số**. Xảy ra lúc compile-time (static binding). Có thể overload method `static`, `final`, `private`.
- **Overriding**: giữa lớp cha và lớp con, **cùng tên, cùng tham số**. Xảy ra lúc runtime (dynamic binding). Không thể override `static`, `final`, `private`.

### Câu 2: Tại sao Java không cho phép đa hình runtime với fields?

**Trả lời:**

Fields được resolve tại compile-time dựa trên **kiểu khai báo** (reference type), không phải kiểu thực tế (object type). Đây là thiết kế có chủ đích để đảm bảo hiệu năng và tránh nhầm lẫn. Nếu muốn hành vi đa hình cho dữ liệu, hãy dùng getter method.

```java
class Cha { int x = 10; }
class Con extends Cha { int x = 20; }

Cha obj = new Con();
System.out.println(obj.x); // 10 -- lấy theo kiểu tham chiếu Cha
```

### Câu 3: Có thể override method `main()` không?

**Trả lời:**

**Không.** `main()` là `static`, và static method không thể override (chỉ có method hiding). Tuy nhiên, bạn có thể khai báo `main()` trong cả lớp cha và lớp con -- chúng là hai method độc lập, không có quan hệ override.

### Câu 4: Covariant return type là gì? Cho ví dụ.

**Trả lời:**

Là khả năng method override trả về **kiểu con** của kiểu trả về trong method cha. Có từ Java 5.

```java
class NhaMay {
    public SanPham sanXuat() { return new SanPham(); }
}

class NhaMayDienThoai extends NhaMay {
    @Override
    public DienThoai sanXuat() {  // DienThoai extends SanPham
        return new DienThoai();   // Covariant return type
    }
}
```

### Câu 5: Giải thích cơ chế Dynamic Method Dispatch.

**Trả lời:**

Dynamic Method Dispatch là cơ chế JVM dùng để xác định method nào được gọi khi sử dụng biến tham chiếu kiểu lớp cha trỏ đến object lớp con:

1. Compiler kiểm tra method có tồn tại trong lớp cha không (compile-time check).
2. Tại runtime, JVM kiểm tra **kiểu thực tế** của object.
3. JVM gọi method override trong lớp thực tế, không phải lớp khai báo.

```java
DongVat dv = new Meo();  // Khai báo DongVat, thực tế là Meo
dv.keu();                 // JVM gọi Meo.keu(), không phải DongVat.keu()
```

Đây là nền tảng của đa hình runtime và là lý do Java có thể viết code linh hoạt, mở rộng dễ dàng.
