---
sidebar_position: 5
title: "Object cloning trong Java"
---

# Object cloning trong Java

**Object cloning** (nhân bản đối tượng) là cơ chế tạo ra một bản sao (copy) của một đối tượng hiện có. Java cung cấp cơ chế này thông qua phương thức `clone()` trong lớp `Object` và interface `Cloneable`.

---

## 1. Tại sao cần object cloning?

Trong Java, khi gán một đối tượng cho biến khác, bạn chỉ sao chép **tham chiếu** (reference), không phải dữ liệu thực. Cả hai biến cùng trỏ đến một đối tượng — thay đổi qua biến này sẽ ảnh hưởng biến kia.

```java
public class ViDuThamChieu {
    public static void main(String[] args) {
        int[] mang1 = {1, 2, 3};
        int[] mang2 = mang1;  // chỉ sao chép tham chiếu!

        mang2[0] = 99;
        System.out.println(mang1[0]); // 99 — mang1 cũng bị thay đổi!
    }
}
```

Cloning giải quyết vấn đề này bằng cách tạo đối tượng độc lập.

---

## 2. Shallow Clone — Sao chép nông

**Shallow clone** (sao chép nông) sao chép các giá trị nguyên thủy (primitive: `int`, `double`...) và sao chép **tham chiếu** (không phải dữ liệu) của các trường tham chiếu (reference fields).

### Cách thực hiện

1. Lớp phải `implements Cloneable` (triển khai interface Cloneable).
2. Override (ghi đè) phương thức `clone()` từ `Object`.
3. Gọi `super.clone()` bên trong.

```java
public class DiaChiLamViec implements Cloneable {
    public String thanhPho;

    public DiaChiLamViec(String thanhPho) {
        this.thanhPho = thanhPho;
    }
}

public class NhanVien implements Cloneable {
    private String ten;
    private int tuoi;
    private DiaChiLamViec diaChi; // trường tham chiếu (reference field)

    public NhanVien(String ten, int tuoi, DiaChiLamViec diaChi) {
        this.ten = ten;
        this.tuoi = tuoi;
        this.diaChi = diaChi;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone(); // shallow clone
    }

    public String getTen() { return ten; }
    public int getTuoi() { return tuoi; }
    public DiaChiLamViec getDiaChi() { return diaChi; }
}

public class TestShallowClone {
    public static void main(String[] args) throws CloneNotSupportedException {
        DiaChiLamViec diaChi = new DiaChiLamViec("Hà Nội");
        NhanVien nv1 = new NhanVien("Nguyễn An", 30, diaChi);
        NhanVien nv2 = (NhanVien) nv1.clone();

        // Thay đổi trường nguyên thủy — độc lập nhau
        System.out.println(nv1.getTen()); // Nguyễn An
        System.out.println(nv2.getTen()); // Nguyễn An (bản sao độc lập)

        // Thay đổi đối tượng lồng nhau — ảnh hưởng cả hai!
        nv2.getDiaChi().thanhPho = "TP.HCM";
        System.out.println(nv1.getDiaChi().thanhPho); // TP.HCM — bị ảnh hưởng!
    }
}
```

Vấn đề: `diaChi` trong `nv1` và `nv2` cùng trỏ đến **một đối tượng**.

---

## 3. Deep Clone — Sao chép sâu

**Deep clone** (sao chép sâu) tạo bản sao độc lập hoàn toàn — bao gồm cả các đối tượng được tham chiếu bên trong.

### Cách 1: Override `clone()` thủ công

```java
public class DiaChiLamViec implements Cloneable {
    public String thanhPho;

    public DiaChiLamViec(String thanhPho) {
        this.thanhPho = thanhPho;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone(); // DiaChiLamViec chỉ có trường nguyên thủy → ok
    }
}

public class NhanVien implements Cloneable {
    private String ten;
    private int tuoi;
    private DiaChiLamViec diaChi;

    public NhanVien(String ten, int tuoi, DiaChiLamViec diaChi) {
        this.ten = ten;
        this.tuoi = tuoi;
        this.diaChi = diaChi;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        NhanVien banSao = (NhanVien) super.clone();
        // Sao chép sâu trường tham chiếu
        banSao.diaChi = (DiaChiLamViec) diaChi.clone();
        return banSao;
    }

    public DiaChiLamViec getDiaChi() { return diaChi; }
    public String getTen() { return ten; }
}

public class TestDeepClone {
    public static void main(String[] args) throws CloneNotSupportedException {
        NhanVien nv1 = new NhanVien("Trần Bình", 25, new DiaChiLamViec("Đà Nẵng"));
        NhanVien nv2 = (NhanVien) nv1.clone();

        nv2.getDiaChi().thanhPho = "Cần Thơ";
        System.out.println(nv1.getDiaChi().thanhPho); // Đà Nẵng — không bị ảnh hưởng!
        System.out.println(nv2.getDiaChi().thanhPho); // Cần Thơ
    }
}
```

### Cách 2: Sao chép qua Constructor (Copy Constructor)

Cách tiếp cận rõ ràng hơn, không cần `Cloneable`:

```java
public class SanPham {
    private String ten;
    private double gia;
    private List<String> thuocTinh;

    public SanPham(String ten, double gia, List<String> thuocTinh) {
        this.ten = ten;
        this.gia = gia;
        this.thuocTinh = new ArrayList<>(thuocTinh); // sao chép list
    }

    // Copy constructor (hàm khởi tạo sao chép)
    public SanPham(SanPham khac) {
        this(khac.ten, khac.gia, khac.thuocTinh);
    }

    public List<String> getThuocTinh() { return thuocTinh; }
    public String getTen() { return ten; }
}

public class TestCopyConstructor {
    public static void main(String[] args) {
        List<String> thuocTinh = new ArrayList<>(List.of("Đỏ", "Nhẹ"));
        SanPham sp1 = new SanPham("Áo phông", 150000, thuocTinh);
        SanPham sp2 = new SanPham(sp1); // dùng copy constructor

        sp2.getThuocTinh().add("Size L");
        System.out.println(sp1.getThuocTinh()); // [Đỏ, Nhẹ] — không bị ảnh hưởng
        System.out.println(sp2.getThuocTinh()); // [Đỏ, Nhẹ, Size L]
    }
}
```

---

## 4. So sánh các cách clone

| Phương pháp | Ưu điểm | Nhược điểm |
|---|---|---|
| Shallow clone (`super.clone()`) | Nhanh, ít code | Các trường tham chiếu vẫn dùng chung |
| Deep clone (override thủ công) | Độc lập hoàn toàn | Phải clone từng trường tham chiếu |
| Copy constructor | Rõ ràng, không cần `Cloneable` | Phải viết thêm constructor |

---

## 5. Lưu ý quan trọng

- Nếu lớp không `implements Cloneable` mà gọi `clone()`, Java ném ra `CloneNotSupportedException` (ngoại lệ không hỗ trợ nhân bản).
- `clone()` trong `Object` có access modifier là `protected` — cần override và đổi thành `public` nếu muốn dùng từ bên ngoài.
- Nhiều chuyên gia Java khuyên dùng **copy constructor** hoặc **factory method** (phương thức khởi tạo tĩnh) thay cho `Cloneable` vì cơ chế `Cloneable` có nhiều điểm bất nhất.

---

## Tóm tắt

- **Shallow clone**: sao chép giá trị nguyên thủy + tham chiếu (các đối tượng lồng nhau vẫn dùng chung).
- **Deep clone**: sao chép toàn bộ, kể cả đối tượng lồng nhau — cần xử lý thủ công.
- **Copy constructor**: cách tiếp cận rõ ràng và linh hoạt hơn `Cloneable`.
- Luôn dùng deep clone hoặc copy constructor khi đối tượng chứa trường tham chiếu có thể thay đổi (mutable reference fields).
