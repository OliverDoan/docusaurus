---
sidebar_position: 3
title: "Tạo instance của một class mà không gọi từ khoá new"
---

# Tạo instance của một class mà không gọi từ khoá new

## Tại sao cần tạo instance mà không dùng `new`?

Trong Java, cách thông thường để tạo đối tượng là dùng từ khoá `new`. Nhưng có nhiều tình huống **bạn không thể hoặc không muốn** gọi `new` trực tiếp:

- **Framework** (khung làm việc) cần tạo đối tượng từ tên class dưới dạng chuỗi ký tự
- **Deserialization** (giải tuần tự hoá — khôi phục object từ byte/JSON) cần tái tạo object mà không chạy constructor
- **Cloning** (sao chép) cần tạo bản sao nhanh không qua constructor
- **Dependency Injection** (tiêm phụ thuộc) tự động tạo các dependency lúc runtime

Java cung cấp nhiều cơ chế để làm điều này.

---

## 1. `Class.newInstance()` — Cách cũ (Deprecated từ Java 9)

```java
public class CachCu {

    static class MayIn {
        public MayIn() {
            System.out.println("Constructor MayIn được gọi!");
        }
        public void in() {
            System.out.println("Đang in tài liệu...");
        }
    }

    public static void main(String[] args) throws Exception {
        // Class.forName() — nạp class từ tên đầy đủ dưới dạng String
        Class<?> clazz = Class.forName("CachCu$MayIn");

        // newInstance() — gọi constructor không tham số (no-arg constructor)
        // Đã bị @Deprecated vì không xử lý checked exception đúng cách
        @SuppressWarnings("deprecation")
        Object obj = clazz.newInstance();

        ((MayIn) obj).in();
    }
}
```

**Nhược điểm của `Class.newInstance()`:**
- Chỉ hoạt động khi class có **no-arg constructor** (constructor không tham số) là `public`
- Nếu constructor ném **checked exception** (ngoại lệ được kiểm tra — exception khai báo trong `throws`), nó bị bọc lại thành `IllegalAccessException` gây khó debug
- Đã bị đánh dấu `@Deprecated` (không còn được khuyến dùng) từ Java 9

---

## 2. `Constructor.newInstance()` — Cách chuẩn với Reflection

Đây là cách được khuyến nghị thay thế `Class.newInstance()`:

```java
import java.lang.reflect.Constructor;

public class DungConstructorNewInstance {

    static class KhachHang {
        private String ten;
        private int tuoi;

        // Constructor có tham số
        public KhachHang(String ten, int tuoi) {
            this.ten = ten;
            this.tuoi = tuoi;
            System.out.println("Constructor KhachHang: " + ten + ", " + tuoi);
        }

        // Constructor private — thường thấy trong Singleton pattern
        private KhachHang() {
            System.out.println("Constructor private được gọi!");
        }

        @Override
        public String toString() {
            return "KhachHang{ten=" + ten + ", tuoi=" + tuoi + "}";
        }
    }

    public static void main(String[] args) throws Exception {
        Class<?> clazz = KhachHang.class;

        // Cách 2a: Constructor có tham số
        // getConstructor() — lấy constructor public theo kiểu tham số
        Constructor<?> conCoThamSo = clazz.getConstructor(String.class, int.class);
        Object kh1 = conCoThamSo.newInstance("Nguyễn Thị B", 30);
        System.out.println(kh1);

        // Cách 2b: Constructor private (ví dụ phá vỡ Singleton)
        // getDeclaredConstructor() — lấy constructor bất kể access modifier
        Constructor<?> conPrivate = clazz.getDeclaredConstructor();
        // setAccessible(true) — bỏ qua kiểm soát truy cập (access control)
        conPrivate.setAccessible(true);
        Object kh2 = conPrivate.newInstance();
        System.out.println(kh2); // ten=null, tuoi=0 vì constructor private không gán

        // Cách 2c: Tạo object từ tên class dạng String — hay dùng trong framework
        String tenClass = "DungConstructorNewInstance$KhachHang";
        Constructor<?> con = Class.forName(tenClass)
                                   .getConstructor(String.class, int.class);
        Object kh3 = con.newInstance("Trần Văn C", 25);
        System.out.println(kh3);
    }
}
```

**Ưu điểm so với `Class.newInstance()`:**
- Hoạt động với constructor có **bất kỳ số tham số nào**
- Ném `InvocationTargetException` (ngoại lệ bọc — wraps exception gốc từ constructor) thay vì che giấu lỗi
- Không bị deprecated

---

## 3. `clone()` — Sao chép bề mặt (Shallow Copy)

**`clone()`** tạo một bản sao của object mà **không gọi constructor**. JVM tự cấp phát bộ nhớ và sao chép bit-by-bit:

```java
// Phải implement Cloneable (marker interface — interface đánh dấu, không có method)
public class DungClone {

    static class DiemThi implements Cloneable {
        private String monHoc;
        private int[] diemThanhPhan; // mảng — tham chiếu đến heap

        public DiemThi(String monHoc, int[] diemThanhPhan) {
            this.monHoc = monHoc;
            this.diemThanhPhan = diemThanhPhan;
        }

        // Override clone() từ Object
        @Override
        public DiemThi clone() {
            try {
                // super.clone() — shallow copy (sao chép bề mặt):
                // - Kiểu nguyên thủy (int, double,...) được sao chép giá trị
                // - Kiểu tham chiếu (Object, mảng,...) sao chép ĐỊA CHỈ — dùng chung!
                return (DiemThi) super.clone();
            } catch (CloneNotSupportedException e) {
                throw new AssertionError("Không thể xảy ra vì đã implement Cloneable", e);
            }
        }

        // Deep clone (sao chép sâu) — tạo mảng mới, không dùng chung
        public DiemThi deepClone() {
            try {
                DiemThi copy = (DiemThi) super.clone();
                // Sao chép mảng riêng để tránh chia sẻ tham chiếu
                copy.diemThanhPhan = this.diemThanhPhan.clone();
                return copy;
            } catch (CloneNotSupportedException e) {
                throw new AssertionError(e);
            }
        }

        @Override
        public String toString() {
            return "DiemThi{mon=" + monHoc + ", diem=" + java.util.Arrays.toString(diemThanhPhan) + "}";
        }
    }

    public static void main(String[] args) {
        DiemThi d1 = new DiemThi("Toán", new int[]{8, 7, 9});

        // Shallow clone — mảng diemThanhPhan DÙNG CHUNG
        DiemThi d2 = d1.clone();
        d2.diemThanhPhan[0] = 99; // thay đổi d2 làm ảnh hưởng d1!
        System.out.println("d1 sau shallow clone: " + d1); // diem=[99, 7, 9] — bị ảnh hưởng!

        DiemThi d3 = new DiemThi("Lý", new int[]{6, 8, 7});

        // Deep clone — mảng được sao chép riêng
        DiemThi d4 = d3.deepClone();
        d4.diemThanhPhan[0] = 99; // chỉ ảnh hưởng d4
        System.out.println("d3 sau deep clone:  " + d3); // diem=[6, 8, 7] — không bị ảnh hưởng
        System.out.println("d4 sau deep clone:  " + d4); // diem=[99, 8, 7]
    }
}
```

**Giải thích:**
- **Shallow copy** (sao chép bề mặt) — sao chép địa chỉ của đối tượng con, không tạo mới
- **Deep copy** (sao chép sâu) — tạo bản sao hoàn toàn độc lập của tất cả đối tượng con

---

## 4. Deserialization (Giải tuần tự hoá)

**Serialization** (tuần tự hoá) biến object thành luồng byte. **Deserialization** khôi phục lại object từ byte — **hoàn toàn bỏ qua constructor**:

```java
import java.io.*;

public class DungDeserialization {

    // Phải implement Serializable (marker interface) để cho phép serialize
    static class NguoiDung implements Serializable {
        // serialVersionUID — phiên bản class, dùng để kiểm tra tương thích khi deserialize
        private static final long serialVersionUID = 1L;

        private String ten;
        private int tuoi;
        // transient — trường này KHÔNG được serialize (thường dùng cho password, token)
        private transient String matKhauTamThoi;

        public NguoiDung(String ten, int tuoi) {
            this.ten = ten;
            this.tuoi = tuoi;
            System.out.println("Constructor NguoiDung được gọi: " + ten);
        }

        @Override
        public String toString() {
            return "NguoiDung{ten=" + ten + ", tuoi=" + tuoi
                    + ", matKhau=" + matKhauTamThoi + "}";
        }
    }

    public static void main(String[] args) throws Exception {
        NguoiDung original = new NguoiDung("Lê Thị D", 28);
        original.matKhauTamThoi = "secret123";
        System.out.println("Gốc:  " + original);

        // Ghi object ra file (serialize)
        File file = new File("nguoidung.ser");
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(file))) {
            oos.writeObject(original);
            System.out.println("Đã serialize ra file.");
        }

        // Đọc lại object từ file (deserialize)
        // CHÚ Ý: Constructor KHÔNG được gọi trong bước này!
        NguoiDung restored;
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
            restored = (NguoiDung) ois.readObject();
        }
        System.out.println("Phục hồi: " + restored);
        // matKhauTamThoi = null vì được đánh dấu transient

        // Dọn dẹp file tạm
        file.delete();
    }
}
```

**Kết quả mẫu:**
```
Constructor NguoiDung được gọi: Lê Thị D
Gốc:  NguoiDung{ten=Lê Thị D, tuoi=28, matKhau=secret123}
Đã serialize ra file.
Phục hồi: NguoiDung{ten=Lê Thị D, tuoi=28, matKhau=null}
```

> Constructor không được gọi lần thứ hai khi deserialize — đây là bằng chứng rõ ràng rằng JVM tạo object mà không cần `new`.

---

## 5. `sun.misc.Unsafe` — Cách cực đoan (Không dùng trong production)

`Unsafe` là class nội bộ của JVM cho phép làm những việc "nguy hiểm" như cấp phát bộ nhớ thủ công:

```java
import sun.misc.Unsafe;
import java.lang.reflect.Field;

public class DungUnsafe {

    static class CauHinh {
        private final String moiTruong;
        private final int soLuongThread;

        // Constructor kiểm tra nghiêm ngặt
        public CauHinh(String moiTruong, int soLuongThread) {
            if (soLuongThread <= 0) {
                throw new IllegalArgumentException("Số thread phải > 0!");
            }
            this.moiTruong = moiTruong;
            this.soLuongThread = soLuongThread;
            System.out.println("Constructor được gọi, soLuongThread=" + soLuongThread);
        }

        @Override
        public String toString() {
            return "CauHinh{moiTruong=" + moiTruong + ", thread=" + soLuongThread + "}";
        }
    }

    public static void main(String[] args) throws Exception {
        // Lấy instance của Unsafe qua Reflection (constructor private)
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        Unsafe unsafe = (Unsafe) f.get(null); // null vì là static field

        // allocateInstance() — cấp phát bộ nhớ cho object mà KHÔNG gọi constructor
        // soLuongThread sẽ là 0 (giá trị mặc định của int) — không qua validation!
        CauHinh obj = (CauHinh) unsafe.allocateInstance(CauHinh.class);
        System.out.println("Tạo bằng Unsafe: " + obj);
        // Output: CauHinh{moiTruong=null, thread=0}
        // Constructor KHÔNG được gọi — không có dòng in trong constructor
    }
}
```

> **Cảnh báo nghiêm trọng:** `sun.misc.Unsafe` là **internal API** (API nội bộ của JVM, không thuộc Java standard). Dùng `Unsafe` có thể gây crash JVM, memory leak và vi phạm bảo mật. Chỉ dùng để học tập hoặc hiểu nguyên lý bên trong. Trong Java 9+, truy cập `Unsafe` bị giới hạn bởi **module system** (hệ thống module).

---

## So sánh các cách tạo instance

| Cách | Gọi Constructor? | Phù hợp khi |
|---|---|---|
| `new` | Có | Tạo object thông thường |
| `Class.newInstance()` | Có (no-arg) | Legacy code — đã deprecated |
| `Constructor.newInstance()` | Có (tuỳ chọn) | Framework DI, factory động |
| `clone()` | Không | Sao chép nhanh object có nhiều field |
| `Deserialization` | Không | Truyền/lưu object qua mạng/file |
| `Unsafe.allocateInstance()` | Không | Nghiên cứu, không dùng production |

---

## Lưu ý về bảo mật

Khả năng tạo instance mà không qua constructor **phá vỡ một số design pattern**:

```java
// Singleton bị phá vỡ bởi Deserialization
// Giải pháp: implement readResolve()
class ThanhPhanDonLe implements Serializable {
    private static final ThanhPhanDonLe INSTANCE = new ThanhPhanDonLe();

    private ThanhPhanDonLe() {}

    public static ThanhPhanDonLe getInstance() { return INSTANCE; }

    // readResolve() — JVM gọi method này sau khi deserialize,
    // trả về INSTANCE thay vì object mới vừa tạo
    protected Object readResolve() {
        return INSTANCE;
    }
}
```

- **`readResolve()`** — method đặc biệt mà `ObjectInputStream` gọi sau khi deserialize, cho phép kiểm soát object nào thực sự được trả về, giúp bảo vệ Singleton pattern.
- **`readObject()`** — method tuỳ chỉnh quá trình deserialization, dùng để validate dữ liệu sau khi khôi phục.
