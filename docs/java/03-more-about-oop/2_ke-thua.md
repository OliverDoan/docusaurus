---
sidebar_position: 2
title: "2. Kế thừa (Inheritance)"
---

# Kế thừa (Inheritance)

Kế thừa là một trụ cột của lập trình hướng đối tượng, cho phép một lớp con nhận lại thuộc tính và phương thức của lớp cha. Nhờ vậy bạn viết code chung một lần ở lớp cha rồi tái sử dụng ở nhiều lớp con, tránh lặp lại và dễ bảo trì. Bài này giới thiệu từ khóa `extends`, `super`, kế thừa đơn và lớp gốc `Object`; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có kế thừa?](#vì-sao-có-kế-thừa)
- [Kế thừa là gì?](#kế-thừa-là-gì)
- [Từ khóa extends](#từ-khóa-extends)
- [Lớp cha và lớp con](#lớp-cha-và-lớp-con)
- [Từ khóa super](#từ-khóa-super)
- [Tái sử dụng code](#tái-sử-dụng-code)
- [Kế thừa đơn](#kế-thừa-đơn)
- [Object là lớp gốc của mọi lớp](#object-là-lớp-gốc-của-mọi-lớp)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có kế thừa?

**Vấn đề:** Nhiều lớp thường có phần CHUNG giống nhau. `Cho`, `Meo`, `Chim` đều có `ten`, `an()`, `ngu()`. Nếu copy-paste code chung vào từng lớp thì trùng lặp, và khi cần sửa một chỗ phải sửa ở nhiều nơi (dễ sót, dễ sai).

```java
// Trùng lặp: viết lại an() và ngu() ở MỌI lớp
public class Cho {
    String ten;
    void an() { System.out.println(ten + " dang an"); }
    void ngu() { System.out.println(ten + " dang ngu"); }
}

public class Meo {
    String ten;
    void an() { System.out.println(ten + " dang an"); }  // lặp lại
    void ngu() { System.out.println(ten + " dang ngu"); } // lặp lại
}
```

**Giải pháp:** **Kế thừa** (`extends`) — lớp con thừa hưởng field và method của lớp cha (quan hệ "is-a"). Viết phần chung MỘT LẦN ở lớp cha; lớp con chỉ thêm hoặc ghi đè phần riêng. Đây cũng là nền tảng cho đa hình.

```java
// Phần chung viết MỘT LẦN ở lớp cha
public class DongVat {
    String ten;
    void an() { System.out.println(ten + " dang an"); }
    void ngu() { System.out.println(ten + " dang ngu"); }
}

// Lớp con tự có an(), ngu(); chỉ thêm phần riêng
public class Cho extends DongVat {
    void sua() { System.out.println(ten + " sua: Gau gau!"); }
}
```

:::tip[Dùng thực tế]

- Lớp `Animal` làm cha cho `Dog`, `Cat`: dùng lại logic chung `eat()`, `sleep()`, không lặp code.
- Sửa logic ở lớp cha một lần, mọi lớp con tự cập nhật theo.
- Đa hình: xử lý cả danh sách `List<Animal>` mà mỗi phần tử tự kêu theo kiểu riêng.
- Dùng `super(...)` để tái dùng cài đặt của lớp cha rồi bổ sung phần riêng cho lớp con.

Lưu ý: chỉ dùng kế thừa khi thực sự là quan hệ "is-a". Nếu không, ưu tiên **composition** (chứa đối tượng khác) để tránh lạm dụng kế thừa quá sâu.

:::

---

## Kế thừa là gì?

**Kế thừa** (inheritance — cơ chế cho phép một lớp nhận lại thuộc tính và phương thức của lớp khác) giống như con cái thừa hưởng đặc điểm từ cha mẹ.

Ví dụ đời thường: mọi loài "Chó", "Mèo", "Chim" đều là "Động vật". Chúng đều biết ăn và ngủ (đặc điểm chung), nhưng mỗi loài kêu một kiểu riêng. Thay vì viết lại "ăn", "ngủ" cho từng loài, ta viết một lần ở lớp "Động vật" rồi cho các loài kế thừa.

---

## Từ khóa extends

Trong Java, ta dùng từ khóa `extends` (mở rộng) để một lớp kế thừa lớp khác.

```java
// Lớp cha (superclass): chứa đặc điểm chung
public class DongVat {
    String ten;

    void an() {
        System.out.println(ten + " dang an");
    }

    void ngu() {
        System.out.println(ten + " dang ngu");
    }
}

// Lớp con (subclass): kế thừa từ DongVat
public class Cho extends DongVat {
    // Cho TỰ ĐỘNG có an() và ngu() từ DongVat
    // Đồng thời thêm phương thức riêng
    void sua() {
        System.out.println(ten + " sua: Gau gau!");
    }
}
```

Sử dụng:

```java
public class Main {
    public static void main(String[] args) {
        Cho cho = new Cho();
        cho.ten = "Milu";
        cho.an();   // Phương thức kế thừa từ DongVat
        cho.ngu();  // Phương thức kế thừa từ DongVat
        cho.sua();  // Phương thức riêng của Cho
    }
}
```

---

## Lớp cha và lớp con

- **Lớp cha** (superclass / parent class — lớp được kế thừa): ví dụ `DongVat`.
- **Lớp con** (subclass / child class — lớp kế thừa từ lớp khác): ví dụ `Cho`.

Lớp con có **tất cả** thành viên `public`/`protected` của lớp cha, cộng thêm những thứ riêng của nó. Quan hệ này gọi là **"is-a"** (là một): "Chó **là một** Động vật".

```java
public class Meo extends DongVat {
    void keu() {
        System.out.println(ten + " keu: Meo meo!");
    }
}
```

---

## Từ khóa super

**super** (từ khóa trỏ tới lớp cha) dùng để gọi constructor hoặc phương thức của lớp cha.

```java
public class DongVat {
    String ten;

    DongVat(String ten) {
        this.ten = ten;
        System.out.println("Constructor DongVat chay");
    }

    void gioiThieu() {
        System.out.println("Toi la dong vat ten " + ten);
    }
}

public class Cho extends DongVat {
    String giong;

    Cho(String ten, String giong) {
        super(ten); // Gọi constructor lớp cha, PHẢI là dòng đầu tiên
        this.giong = giong;
    }

    @Override
    void gioiThieu() {
        super.gioiThieu(); // Gọi phương thức lớp cha trước
        System.out.println("Toi la cho giong " + giong);
    }
}
```

Hai cách dùng `super`:

- `super(...)` — gọi constructor lớp cha (phải đặt ở dòng đầu của constructor lớp con).
- `super.tenPhuongThuc()` — gọi phương thức của lớp cha.

---

## Tái sử dụng code

Lợi ích lớn nhất của kế thừa là **tái sử dụng code** (code reuse — viết một lần, dùng nhiều nơi). Không phải lặp lại logic chung.

```java
// Viết "an" và "ngu" MỘT LẦN ở lớp cha
public class DongVat {
    void an() { System.out.println("Dang an"); }
    void ngu() { System.out.println("Dang ngu"); }
}

// Tất cả các lớp con đều dùng lại được, không cần viết lại
public class Cho extends DongVat { /* tự có an, ngu */ }
public class Meo extends DongVat { /* tự có an, ngu */ }
public class Chim extends DongVat { /* tự có an, ngu */ }
```

Nếu sau này cần sửa logic "ăn", bạn chỉ sửa ở một chỗ (lớp cha) là tất cả lớp con tự cập nhật.

---

## Kế thừa đơn

Java chỉ hỗ trợ **kế thừa đơn** (single inheritance — một lớp chỉ được kế thừa trực tiếp từ MỘT lớp cha). Bạn không thể viết `class A extends B, C`.

```java
// HỢP LỆ: kế thừa từ một lớp
public class Cho extends DongVat { }

// LỖI: không thể kế thừa nhiều lớp cùng lúc
// public class Sieu extends DongVat, ThucVat { } // SAI!
```

Lý do hạn chế này là để tránh nhập nhằng (nếu hai lớp cha có cùng phương thức, không rõ chọn cái nào). Để có "đa kế thừa hành vi", Java dùng **interface** (sẽ học ở bài sau). Tuy nhiên, kế thừa có thể nhiều **tầng**:

```java
public class DongVat { }
public class ThuCung extends DongVat { }   // ThuCung là con của DongVat
public class Cho extends ThuCung { }        // Cho là con của ThuCung
// Cho gián tiếp kế thừa cả DongVat
```

---

## Object là lớp gốc của mọi lớp

Mọi lớp trong Java đều ngầm kế thừa từ lớp `Object` (lớp gốc — tổ tiên của tất cả các lớp). Dù bạn không viết `extends Object`, Java tự thêm vào.

```java
// Hai khai báo này tương đương nhau
public class XeOto { }
public class XeOto extends Object { } // Java tự ngầm hiểu như vậy
```

Vì vậy, mọi đối tượng đều có sẵn các phương thức từ `Object`, ví dụ:

```java
public class Main {
    public static void main(String[] args) {
        XeOto xe = new XeOto();

        // toString(): chuyển đối tượng thành chuỗi (kế thừa từ Object)
        System.out.println(xe.toString());

        // equals(): so sánh hai đối tượng (kế thừa từ Object)
        XeOto xe2 = new XeOto();
        System.out.println(xe.equals(xe2));
    }
}
```

---

## Lỗi thường gặp

- **Quên gọi `super(...)`** khi lớp cha không có constructor mặc định → lỗi biên dịch.
- **Đặt `super(...)` không phải dòng đầu** trong constructor → lỗi.
- **Cố kế thừa nhiều lớp** với `extends A, B` → Java không cho phép.
- **Nhầm `super` với `this`**: `super` trỏ lớp cha, `this` trỏ chính đối tượng hiện tại.
- **Truy cập thành viên `private` của lớp cha**: lớp con không thấy được thành viên `private`; dùng `protected` nếu muốn lớp con truy cập.

---

## Tóm tắt

- **Kế thừa** cho phép lớp con nhận lại thuộc tính và phương thức của lớp cha (quan hệ "is-a").
- Dùng từ khóa `extends` để kế thừa.
- `super(...)` gọi constructor lớp cha; `super.method()` gọi phương thức lớp cha.
- Kế thừa giúp **tái sử dụng code**, sửa một nơi áp dụng mọi nơi.
- Java chỉ cho **kế thừa đơn** (một lớp cha trực tiếp), nhưng có thể nhiều tầng.
- Mọi lớp đều ngầm kế thừa lớp `Object` — lớp gốc của tất cả.
