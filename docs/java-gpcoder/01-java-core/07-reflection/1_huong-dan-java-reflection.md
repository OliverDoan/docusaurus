---
sidebar_position: 1
title: "Hướng dẫn sử dụng Java Reflection"
---

# Hướng dẫn sử dụng Java Reflection

Reflection là khả năng cho phép chương trình tự "soi" và thao tác cấu trúc class của chính nó ngay lúc đang chạy, mà không cần biết trước tên class hay method khi viết code. Bài này hướng dẫn cách lấy đối tượng `Class`, đọc field, method, constructor và gọi method động qua `invoke()`. Đây là nền tảng để hiểu cách các framework như Spring hay Hibernate hoạt động bên dưới.

## Reflection là gì?

**Reflection** (phản chiếu — khả năng kiểm tra và thao tác cấu trúc của class lúc chạy chương trình) là một tính năng mạnh mẽ trong Java, cho phép chương trình **tự kiểm tra chính mình** trong lúc đang chạy (runtime). Thay vì phải biết tên class, method hay field ngay khi viết code, Reflection cho phép bạn khám phá và gọi chúng một cách **động (dynamically)** — tức là chỉ cần biết tên dưới dạng chuỗi ký tự.

Tính năng này nằm trong gói `java.lang.reflect` và xoay quanh đối tượng trung tâm là **`Class<T>`** — đối tượng đại diện cho siêu thông tin (metadata) của một class Java.

---

## 1. Lấy đối tượng Class

Có ba cách để lấy **`Class` object** (đối tượng đại diện cho một class):

```java
public class LayClassObject {
    public static void main(String[] args) throws ClassNotFoundException {
        // Cách 1: Dùng .class literal (literal — giá trị trực tiếp viết trong code)
        Class<String> c1 = String.class;

        // Cách 2: Gọi getClass() từ một instance (instance — đối tượng đã khởi tạo)
        String s = "Hello";
        Class<?> c2 = s.getClass();

        // Cách 3: Dùng Class.forName() với tên đầy đủ (fully qualified name — tên bao gồm cả package)
        Class<?> c3 = Class.forName("java.lang.String");

        System.out.println(c1.getName()); // java.lang.String
        System.out.println(c2.getName()); // java.lang.String
        System.out.println(c3.getName()); // java.lang.String
        System.out.println(c1 == c2);     // true — cùng một Class object
    }
}
```

> **Lưu ý:** Ba cách đều trỏ về cùng một `Class` object vì JVM chỉ nạp mỗi class một lần.

---

## 2. Lấy thông tin Field

**Field** (trường — biến thành viên của class) có thể được lấy ra qua Reflection:

```java
import java.lang.reflect.Field;

public class DocField {

    // Lớp mẫu để thử nghiệm
    static class NhanVien {
        public String ten;
        private int tuoi;
        protected double luong;
    }

    public static void main(String[] args) {
        Class<?> clazz = NhanVien.class; // clazz — quy ước đặt tên tránh trùng từ khoá 'class'

        System.out.println("=== Các field public (kể cả kế thừa) ===");
        // getFields() trả về tất cả field public, gồm cả field kế thừa
        for (Field f : clazz.getFields()) {
            System.out.println(f.getName() + " : " + f.getType().getSimpleName());
        }

        System.out.println("\n=== Tất cả field được khai báo trong class (kể cả private) ===");
        // getDeclaredFields() trả về field khai báo trong class này, mọi access modifier
        for (Field f : clazz.getDeclaredFields()) {
            System.out.println(f.getName() + " : " + f.getType().getSimpleName()
                    + " | modifier: " + f.getModifiers());
        }
    }
}
```

**Giải thích thuật ngữ:**
- **`getFields()`** — trả về các field có **access modifier** (từ khoá truy cập) là `public`, bao gồm cả field kế thừa từ lớp cha.
- **`getDeclaredFields()`** — trả về **tất cả** field được khai báo trực tiếp trong class, bất kể `private`, `protected` hay `public`, nhưng **không** bao gồm field kế thừa.
- **`getModifiers()`** — trả về số nguyên biểu diễn các modifier; dùng `java.lang.reflect.Modifier` để giải mã.

---

## 3. Lấy thông tin Method

**Method** (phương thức) cũng có thể được liệt kê và gọi động:

```java
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

public class DocMethod {

    static class MayTinh {
        public int cong(int a, int b) { return a + b; }
        private double chia(double a, double b) { return a / b; }
        public String toString() { return "MayTinh"; }
    }

    public static void main(String[] args) {
        Class<?> clazz = MayTinh.class;

        System.out.println("=== getDeclaredMethods() — chỉ method trong class này ===");
        for (Method m : clazz.getDeclaredMethods()) {
            System.out.print(m.getName() + "(");
            // Parameter (tham số) của method
            for (Parameter p : m.getParameters()) {
                System.out.print(p.getType().getSimpleName() + " ");
            }
            System.out.println(") -> " + m.getReturnType().getSimpleName());
        }
    }
}
```

---

## 4. Lấy thông tin Constructor

**Constructor** (hàm khởi tạo) cũng có thể được kiểm tra:

```java
import java.lang.reflect.Constructor;

public class DocConstructor {

    static class SanPham {
        private String ten;
        private double gia;

        public SanPham() {}
        public SanPham(String ten) { this.ten = ten; }
        public SanPham(String ten, double gia) {
            this.ten = ten;
            this.gia = gia;
        }
    }

    public static void main(String[] args) {
        Class<?> clazz = SanPham.class;

        System.out.println("=== Danh sách Constructor ===");
        // getDeclaredConstructors() — mọi constructor kể cả private
        for (Constructor<?> con : clazz.getDeclaredConstructors()) {
            System.out.print(con.getName() + "(");
            Class<?>[] paramTypes = con.getParameterTypes(); // kiểu của từng tham số
            for (int i = 0; i < paramTypes.length; i++) {
                System.out.print(paramTypes[i].getSimpleName());
                if (i < paramTypes.length - 1) System.out.print(", ");
            }
            System.out.println(")");
        }
    }
}
```

---

## 5. Gọi Method động (invoke)

**`invoke()`** (gọi — thực thi một method qua Reflection) là trái tim của Reflection:

```java
import java.lang.reflect.Method;

public class GoiMethodDong {

    static class ChaoHoi {
        public String xinChao(String ten) {
            return "Xin chào, " + ten + "!";
        }

        private int nhanBi(int x) {
            return x * x;
        }
    }

    public static void main(String[] args) throws Exception {
        ChaoHoi obj = new ChaoHoi();
        Class<?> clazz = obj.getClass();

        // Lấy và gọi method public
        Method xinChao = clazz.getMethod("xinChao", String.class);
        // invoke(đối tượng, danh sách tham số) — trả về Object
        String ketQua = (String) xinChao.invoke(obj, "Tuấn");
        System.out.println(ketQua); // Xin chào, Tuấn!

        // Gọi method private — phải setAccessible(true) trước
        Method nhanBi = clazz.getDeclaredMethod("nhanBi", int.class);
        // setAccessible(true) — bỏ qua kiểm tra access modifier lúc runtime
        nhanBi.setAccessible(true);
        int sq = (int) nhanBi.invoke(obj, 7);
        System.out.println("7 * 7 = " + sq); // 7 * 7 = 49
    }
}
```

> **Cảnh báo:** `setAccessible(true)` phá vỡ tính **encapsulation** (đóng gói). Chỉ dùng khi thực sự cần thiết, ví dụ trong framework, testing hoặc serialization.

---

## 6. Đọc và ghi Field private

```java
import java.lang.reflect.Field;

public class DocGhiFieldPrivate {

    static class TaiKhoan {
        private String soDu = "1,000,000 VND";
        private boolean daKhoa = false;
    }

    public static void main(String[] args) throws Exception {
        TaiKhoan tk = new TaiKhoan();
        Class<?> clazz = tk.getClass();

        // Đọc field private
        Field soDu = clazz.getDeclaredField("soDu");
        soDu.setAccessible(true); // mở khoá truy cập
        System.out.println("Số dư: " + soDu.get(tk)); // Số dư: 1,000,000 VND

        // Ghi giá trị mới vào field private
        Field daKhoa = clazz.getDeclaredField("daKhoa");
        daKhoa.setAccessible(true);
        daKhoa.set(tk, true); // ghi giá trị true vào field daKhoa của đối tượng tk
        System.out.println("Đã khoá: " + daKhoa.get(tk)); // Đã khoá: true
    }
}
```

---

## Tổng kết

| Tác vụ | Method sử dụng |
|---|---|
| Lấy Class object | `.class`, `.getClass()`, `Class.forName()` |
| Liệt kê field | `getFields()`, `getDeclaredFields()` |
| Liệt kê method | `getMethods()`, `getDeclaredMethods()` |
| Liệt kê constructor | `getConstructors()`, `getDeclaredConstructors()` |
| Gọi method động | `method.invoke(obj, args...)` |
| Đọc/ghi field | `field.get(obj)`, `field.set(obj, value)` |
| Truy cập private | `setAccessible(true)` |

**Khi nào dùng Reflection:**
- Viết **framework** (khung làm việc) như Spring, Hibernate
- **Unit testing** (kiểm thử đơn vị) — kiểm tra trạng thái private
- **Serialization/Deserialization** (tuần tự hoá/giải tuần tự hoá) — chuyển object thành byte/JSON và ngược lại
- **Dependency Injection** (tiêm phụ thuộc) — tự động wiring các dependency

**Khi không nên dùng:**
- Code nghiệp vụ thông thường — làm giảm hiệu năng và khó đọc
- Khi có giải pháp khác tường minh hơn (interface, generics)
