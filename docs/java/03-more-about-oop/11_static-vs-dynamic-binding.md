---
sidebar_position: 11
title: "11. Static vs Dynamic Binding"
---

# Static vs Dynamic Binding

---

## Mục lục

- [Binding là gì?](#binding-là-gì)
- [Static binding — liên kết tĩnh](#static-binding--liên-kết-tĩnh)
- [Dynamic binding — liên kết động](#dynamic-binding--liên-kết-động)
- [Liên kết động và đa hình](#liên-kết-động-và-đa-hình)
- [Method nào được gọi?](#method-nào-được-gọi)
- [Trường hợp đặc biệt: static, final, private](#trường-hợp-đặc-biệt-static-final-private)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Binding là gì?

**Binding** (liên kết — việc quyết định lời gọi phương thức sẽ chạy phần code nào) là quá trình Java xác định "khi gọi `doiTuong.method()`, thực sự chạy phần thân nào".

Có hai thời điểm quyết định:

- **Static binding** (liên kết tĩnh — quyết định lúc **biên dịch**, trước khi chạy).
- **Dynamic binding** (liên kết động — quyết định lúc **chạy**, dựa trên đối tượng thực).

Ví dụ đời thường: gọi điện cho "trưởng phòng". Nếu danh bạ ghi cứng số (lúc lưu), đó là tĩnh. Nếu "trưởng phòng" là vai trò mà người đảm nhận thay đổi theo thời điểm, đó là động.

---

## Static binding — liên kết tĩnh

**Static binding** xảy ra khi Java biết chắc chắn phương thức nào sẽ chạy ngay lúc biên dịch. Áp dụng cho các phương thức `static`, `final`, `private`, và cả **overloading** (nạp chồng).

```java
public class MayTinh {
    // Hai phương thức overload -> chọn lúc biên dịch (static binding)
    int cong(int a, int b) {
        return a + b;
    }

    double cong(double a, double b) {
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        MayTinh mt = new MayTinh();

        // Java biết NGAY lúc biên dịch sẽ gọi phiên bản (int, int)
        mt.cong(2, 3);

        // Và phiên bản (double, double) ở đây
        mt.cong(2.5, 3.5);
    }
}
```

Vì kiểu của tham số đã rõ ràng lúc viết code, Java chọn được phiên bản đúng mà không cần đợi tới lúc chạy.

---

## Dynamic binding — liên kết động

**Dynamic binding** xảy ra với các phương thức bị **overriding** (ghi đè). Java chỉ biết phương thức nào chạy khi chương trình thực sự chạy, dựa vào **kiểu thực** của đối tượng.

```java
public class DongVat {
    void keu() {
        System.out.println("Dong vat keu");
    }
}

public class Cho extends DongVat {
    @Override
    void keu() {
        System.out.println("Gau gau");
    }
}

public class Meo extends DongVat {
    @Override
    void keu() {
        System.out.println("Meo meo");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        // Biến kiểu DongVat, nhưng đối tượng thực là Cho hoặc Meo
        DongVat dv;

        dv = new Cho();
        dv.keu(); // Lúc CHẠY mới biết là Cho -> "Gau gau"

        dv = new Meo();
        dv.keu(); // Lúc CHẠY mới biết là Meo -> "Meo meo"
    }
}
```

Dù biến `dv` có kiểu khai báo là `DongVat`, Java nhìn vào **đối tượng thực** (Cho hay Meo) để quyết định phương thức nào chạy.

---

## Liên kết động và đa hình

**Đa hình** (polymorphism — một lời gọi cho ra nhiều hành vi khác nhau tùy đối tượng) chính là nhờ dynamic binding. Đây là điều khiến OOP linh hoạt.

```java
public class Main {
    public static void main(String[] args) {
        // Một mảng chứa nhiều loại động vật khác nhau
        DongVat[] sở_thu = {
            new Cho(),
            new Meo(),
            new Cho()
        };

        // Cùng một lời gọi keu(), nhưng mỗi đối tượng kêu khác nhau
        for (DongVat dv : sở_thu) {
            dv.keu(); // dynamic binding quyết định phiên bản đúng
        }
        // Gau gau
        // Meo meo
        // Gau gau
    }
}
```

Nhờ đa hình, bạn viết code xử lý chung cho `DongVat` mà vẫn chạy đúng hành vi của từng loài cụ thể.

---

## Method nào được gọi?

Quy tắc tổng quát để biết phương thức nào chạy:

- **Overloading (cùng lớp, khác tham số)** → quyết định lúc **biên dịch** dựa vào **kiểu tham số** bạn truyền (static binding).
- **Overriding (cha-con, cùng tham số)** → quyết định lúc **chạy** dựa vào **kiểu thực của đối tượng** (dynamic binding).

```java
public class Main {
    public static void main(String[] args) {
        DongVat dv = new Cho();

        // Kiểu KHAI BÁO là DongVat, nhưng kiểu THỰC là Cho
        // -> dynamic binding chọn keu() của Cho
        dv.keu(); // Gau gau
    }
}
```

Câu thần chú: **"Kiểu khai báo quyết định gọi được method nào; kiểu thực quyết định chạy phần thân nào."**

---

## Trường hợp đặc biệt: static, final, private

Các phương thức sau **không** dùng dynamic binding (vì không thể bị ghi đè theo cách thông thường):

```java
public class Cha {
    static void chao() { System.out.println("Cha chao"); }
    final void diem() { System.out.println("Cha diem"); }
    private void rieng() { System.out.println("Cha rieng"); }
}

public class Con extends Cha {
    // static: đây là "che khuất" (hiding), không phải override
    static void chao() { System.out.println("Con chao"); }
    // final và private không thể ghi đè
}

public class Main {
    public static void main(String[] args) {
        Cha c = new Con();
        // Với static, Java dùng KIỂU KHAI BÁO (Cha) -> static binding
        // Cha.chao() được gọi, không phải Con.chao()
        Cha.chao(); // Cha chao
    }
}
```

Phương thức `static` dùng kiểu khai báo (static binding), khác hẳn phương thức instance bị ghi đè.

---

## Lỗi thường gặp

- **Tưởng static method cũng đa hình**: phương thức `static` dùng static binding theo kiểu khai báo, không theo đối tượng thực.
- **Nhầm kiểu khai báo với kiểu thực**: lời gọi method instance bị ghi đè luôn dùng kiểu THỰC của đối tượng.
- **Quên `@Override`**: nếu không thực sự ghi đè, bạn vô tình tạo phương thức mới và mất tính đa hình.
- **Lẫn lộn overloading và overriding**: overloading là static binding, overriding là dynamic binding.
- **Cố ghi đè `final`/`private`**: không được, các phương thức này luôn static binding.

---

## Tóm tắt

- **Binding** là việc quyết định lời gọi phương thức chạy phần code nào.
- **Static binding** quyết định lúc **biên dịch**: áp dụng cho overloading, `static`, `final`, `private`.
- **Dynamic binding** quyết định lúc **chạy** theo kiểu thực của đối tượng: áp dụng cho overriding.
- Dynamic binding là nền tảng của **đa hình** (polymorphism).
- Nhớ: "Kiểu khai báo quyết định gọi được gì; kiểu thực quyết định chạy phần thân nào."
