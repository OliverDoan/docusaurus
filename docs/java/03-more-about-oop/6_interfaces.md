---
sidebar_position: 6
title: "6. Interfaces"
---

# Interfaces

Interface là một "hợp đồng" liệt kê các phương thức mà một lớp cam kết sẽ có, mô tả "lớp làm được những gì" mà không nói "làm thế nào". Một lớp dùng `implements` để triển khai interface và có thể triển khai nhiều interface cùng lúc, đạt được đa kế thừa hành vi. Bài này giới thiệu `implements`, default method, static method và sự khác nhau giữa interface với abstract class; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có interface?](#vì-sao-có-interface)
- [Interface là gì?](#interface-là-gì)
- [implements — triển khai interface](#implements--triển-khai-interface)
- [Interface như một hợp đồng](#interface-như-một-hợp-đồng)
- [Default method — phương thức mặc định](#default-method--phương-thức-mặc-định)
- [Static method trong interface](#static-method-trong-interface)
- [Đa kế thừa hành vi](#đa-kế-thừa-hành-vi)
- [Interface khác abstract class thế nào?](#interface-khác-abstract-class-thế-nào)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có interface?

**Vấn đề:** Java **không** cho một lớp kế thừa nhiều lớp (đa kế thừa class) để tránh nhập nhằng khi hai lớp cha có cùng phương thức. Nhưng nhiều lớp **không liên quan** lại cần **cùng một khả năng** (so sánh được, vẽ được, chạy được). Nếu code nghiệp vụ phụ thuộc trực tiếp vào lớp cụ thể, việc đổi cài đặt hay viết test sẽ rất khó (coupling chặt).

```java
// MySqlRepository và MongoRepository không họ hàng, nhưng đều cần "lưu được"
public class MySqlRepository {
    public void luu(String data) { System.out.println("Luu vao MySQL"); }
}

public class DichVuDonHang {
    // Phụ thuộc CỨNG vào lớp cụ thể → muốn đổi sang Mongo phải sửa code
    private MySqlRepository repo = new MySqlRepository();

    public void xuLy(String data) { repo.luu(data); }
}
```

**Giải pháp:** **Interface** định nghĩa một **hợp đồng** (contract) — "làm được gì" mà không nói "làm thế nào". Một lớp có thể `implements` nhiều interface (đa kế thừa **hành vi**), và code nghiệp vụ lập trình theo abstraction nên dễ thay cài đặt, dễ mock khi test (nền tảng của Dependency Injection).

```java
// Hợp đồng "lưu được", không quan tâm lưu ở đâu
public interface Repository {
    void luu(String data);
}

public class MySqlRepository implements Repository {
    @Override
    public void luu(String data) { System.out.println("Luu vao MySQL"); }
}

public class MongoRepository implements Repository {
    @Override
    public void luu(String data) { System.out.println("Luu vao Mongo"); }
}

public class DichVuDonHang {
    // Phụ thuộc vào abstraction → truyền cài đặt nào cũng được
    private final Repository repo;

    public DichVuDonHang(Repository repo) { this.repo = repo; }

    public void xuLy(String data) { repo.luu(data); }
}
```

:::tip[Dùng thực tế]

- **`Comparable` / `Runnable`**: lớp bất kỳ `implements Comparable` là sắp xếp được; `implements Runnable` là chạy được trên thread — dùng chung cơ chế sẵn có của Java.
- **Đổi cài đặt repository**: chuyển từ MySQL sang Mongo chỉ cần truyền cài đặt khác, không sửa code nghiệp vụ.
- **Mock service khi test**: tạo cài đặt giả của interface để test nhanh, không cần database hay mạng thật.
- **Plugin / Strategy**: định nghĩa hành vi qua interface rồi cắm thuật toán/plugin khác nhau vào lúc chạy.

:::

---

## Interface là gì?

**Interface** (giao diện / hợp đồng — bản danh sách các phương thức mà một lớp cam kết sẽ có) định nghĩa "lớp phải làm được những gì" mà không nói "làm thế nào".

Ví dụ đời thường: ổ cắm điện. Bất kỳ thiết bị nào có phích cắm đúng chuẩn đều cắm vào được — quạt, đèn, sạc điện thoại. Ổ cắm là một "interface": nó quy định hình dạng phích, còn thiết bị bên trong làm gì là việc của thiết bị.

```java
// Khai báo interface với từ khóa interface
public interface CoTheBay {
    // Phương thức trong interface mặc định không có thân
    void bay();
}
```

---

## implements — triển khai interface

Một lớp dùng từ khóa `implements` (triển khai) để cam kết thực hiện interface. Lớp đó **bắt buộc** phải viết thân cho mọi phương thức của interface.

```java
public interface CoTheBay {
    void bay();
}

// Chim "ký hợp đồng" CoTheBay
public class Chim implements CoTheBay {
    @Override
    public void bay() {
        System.out.println("Chim bay bang canh");
    }
}

// MayBay cũng "ký hợp đồng" CoTheBay, nhưng làm khác
public class MayBay implements CoTheBay {
    @Override
    public void bay() {
        System.out.println("May bay bay bang dong co");
    }
}
```

Sử dụng:

```java
public class Main {
    public static void main(String[] args) {
        // Dùng kiểu interface để chứa mọi thứ "biết bay"
        CoTheBay[] danhSach = { new Chim(), new MayBay() };

        for (CoTheBay vat : danhSach) {
            vat.bay();
        }
        // Chim bay bang canh
        // May bay bay bang dong co
    }
}
```

---

## Interface như một hợp đồng

Hãy nghĩ interface là một **hợp đồng** (contract): "Nếu bạn implements tôi, bạn cam kết có đủ các phương thức tôi liệt kê." Java sẽ kiểm tra và báo lỗi nếu lớp thiếu phương thức.

```java
public interface ThietBiDien {
    void bat();
    void tat();
}

// Lớp này PHẢI có cả bat() và tat(), nếu thiếu sẽ lỗi
public class Quat implements ThietBiDien {
    @Override
    public void bat() { System.out.println("Quat chay"); }

    @Override
    public void tat() { System.out.println("Quat dung"); }
}
```

---

## Default method — phương thức mặc định

Từ Java 8, interface có thể chứa **default method** (phương thức mặc định — phương thức có sẵn phần thân trong interface). Lớp triển khai không bắt buộc viết lại.

```java
public interface ThietBiDien {
    void bat();
    void tat();

    // default: có sẵn thân, lớp con dùng luôn nếu muốn
    default void khoiDongLai() {
        tat();
        bat();
        System.out.println("Da khoi dong lai");
    }
}

public class Quat implements ThietBiDien {
    @Override
    public void bat() { System.out.println("Quat chay"); }

    @Override
    public void tat() { System.out.println("Quat dung"); }
    // Không cần viết khoiDongLai(), dùng default có sẵn
}
```

Default method giúp thêm tính năng mới vào interface mà không làm hỏng các lớp đã triển khai từ trước.

---

## Static method trong interface

Interface cũng có thể chứa **static method** (phương thức tĩnh — gọi qua tên interface, không cần đối tượng).

```java
public interface MayTinh {
    int tinh(int a, int b);

    // static method: tiện ích chung, gọi qua tên interface
    static MayTinh tao() {
        return (a, b) -> a + b; // trả về một phép cộng
    }
}

public class Main {
    public static void main(String[] args) {
        // Gọi static method qua tên interface
        MayTinh cong = MayTinh.tao();
        System.out.println(cong.tinh(3, 4)); // 7
    }
}
```

---

## Đa kế thừa hành vi

Khác với kế thừa lớp (chỉ một lớp cha), một lớp có thể implements **nhiều interface** cùng lúc. Đây gọi là **đa kế thừa hành vi** (multiple inheritance of behavior).

```java
public interface CoTheBay {
    void bay();
}

public interface CoTheBoi {
    void boi();
}

// Vịt vừa biết bay vừa biết bơi
public class Vit implements CoTheBay, CoTheBoi {
    @Override
    public void bay() { System.out.println("Vit bay"); }

    @Override
    public void boi() { System.out.println("Vit boi"); }
}
```

Nhờ vậy, một đối tượng có thể đóng nhiều "vai trò" khác nhau.

---

## Interface khác abstract class thế nào?

| Đặc điểm | Interface | Abstract class |
|----------|-----------|----------------|
| Từ khóa dùng | `implements` | `extends` |
| Số lượng được kế thừa/triển khai | Nhiều interface | Chỉ một lớp cha |
| Thuộc tính (biến thường) | Không (chỉ hằng số) | Có |
| Constructor | Không | Có |
| Phương thức có thân | default / static | Có method thường |
| Mục đích | Định nghĩa hành vi (làm được gì) | Khuôn mẫu chung kèm dữ liệu |

Quy tắc chọn nhanh:

- Cần mô tả **"có thể làm gì"** và muốn nhiều lớp không liên quan cùng dùng → **interface**.
- Cần chia sẻ **dữ liệu và code chung** giữa các lớp có quan hệ "is-a" → **abstract class**.

---

## Lỗi thường gặp

- **Quên viết thân cho phương thức của interface** trong lớp triển khai → lỗi biên dịch.
- **Quên `public`** trên phương thức triển khai: phương thức interface mặc định là `public`.
- **Tưởng interface có thuộc tính thường**: biến trong interface luôn là hằng số `public static final`.
- **Nhầm `extends` với `implements`**: lớp `implements` interface, `extends` lớp khác.
- **Tạo đối tượng từ interface bằng `new`**: không được, interface không phải lớp cụ thể.

---

## Tóm tắt

- **Interface** là "hợp đồng" liệt kê các phương thức lớp phải có.
- Dùng `implements` để triển khai; lớp bắt buộc viết thân cho các phương thức.
- **Default method** có sẵn thân; **static method** gọi qua tên interface.
- Một lớp có thể implements **nhiều interface** → đa kế thừa hành vi.
- Interface khác abstract class: không có thuộc tính thường/constructor, nhưng cho phép triển khai nhiều cùng lúc.
