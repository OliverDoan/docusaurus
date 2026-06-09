---
sidebar_position: 3
title: "3. Phạm vi truy cập (Access Specifiers)"
---

# Phạm vi truy cập (Access Specifiers)

Phạm vi truy cập quyết định "ai" được phép nhìn thấy và dùng một thuộc tính hay phương thức trong Java. Đây là công cụ chính để thực hiện tính đóng gói, giúp bạn che giấu chi tiết bên trong và chỉ mở ra những gì cần thiết, từ đó code an toàn và dễ bảo trì hơn. Bài này giới thiệu bốn mức truy cập `public`, `private`, `protected`, `default` cùng cách chọn mức phù hợp.

---

## Mục lục

- [Access Specifier là gì?](#access-specifier-là-gì)
- [public — Công khai](#public--công-khai)
- [private — Riêng tư](#private--riêng-tư)
- [protected — Bảo vệ](#protected--bảo-vệ)
- [default — Mặc định (package-private)](#default--mặc-định-package-private)
- [Bảng so sánh phạm vi](#bảng-so-sánh-phạm-vi)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Access Specifier là gì?

**Access specifier** (từ khóa quy định phạm vi truy cập — quyết định ai được phép nhìn
thấy và dùng một thuộc tính/phương thức) giống như các **mức độ riêng tư** trong một ngôi nhà:

- Sân trước: ai cũng vào được.
- Phòng khách: chỉ người trong nhà và họ hàng.
- Phòng ngủ: chỉ chủ nhân.

Trong Java có 4 mức: `public`, `protected`, `default`, `private`. Chúng giúp ta che giấu
chi tiết bên trong và chỉ "mở cửa" những gì cần thiết — đây chính là tinh thần của
**encapsulation** (đóng gói).

Để hiểu các mức này, cần biết hai khái niệm:

- **Package** (gói — một thư mục nhóm nhiều class liên quan, sẽ học ở bài sau).
- **Subclass** (lớp con — class kế thừa từ một class khác).

---

## public — Công khai

**`public`** (công khai — bất kỳ nơi nào cũng truy cập được). Đây là mức mở nhất.

```java
public class Car {
    public String brand; // ai cũng đọc/ghi được

    public void honk() {  // ai cũng gọi được
        System.out.println("Bíp bíp!");
    }
}
```

```java
Car c = new Car();
c.brand = "Honda"; // OK ở bất kỳ đâu vì là public
c.honk();          // OK
```

---

## private — Riêng tư

**`private`** (riêng tư — CHỈ truy cập được bên trong chính class đó). Đây là mức kín nhất
và là lựa chọn được khuyên dùng cho hầu hết các thuộc tính.

```java
public class BankAccount {
    private double balance; // chỉ class BankAccount mới đụng tới được

    public double getBalance() {
        return balance; // truy cập private từ BÊN TRONG class -> OK
    }
}
```

```java
BankAccount acc = new BankAccount();
// acc.balance = 100; // LỖI biên dịch: balance là private
System.out.println(acc.getBalance()); // phải dùng phương thức public
```

---

## protected — Bảo vệ

**`protected`** (bảo vệ — truy cập được trong cùng package VÀ trong các lớp con kế thừa,
kể cả lớp con ở package khác). Mức này chủ yếu dành cho kế thừa.

```java
public class Animal {
    protected String name; // lớp con dùng lại được
}

// Lớp con kế thừa Animal
public class Dog extends Animal {
    public void introduce() {
        // truy cập name (protected) từ lớp con -> OK
        System.out.println("Tôi tên " + name);
    }
}
```

---

## default — Mặc định (package-private)

Nếu KHÔNG viết từ khóa nào, mặc định là **default** (còn gọi là **package-private** —
chỉ truy cập được trong CÙNG package, không có lớp con ở package khác nào dùng được).

```java
class Helper {        // không có public -> class này là default
    int value = 10;   // không có từ khóa -> thuộc tính default
}
```

Các class trong cùng thư mục/package có thể dùng `Helper` và `value`, nhưng class ở
package khác thì không.

---

## Bảng so sánh phạm vi

Dấu ✅ = truy cập được, ❌ = không truy cập được.

| Vị trí truy cập | `private` | `default` | `protected` | `public` |
|-----------------|:---------:|:---------:|:-----------:|:--------:|
| Trong cùng class | ✅ | ✅ | ✅ | ✅ |
| Cùng package | ❌ | ✅ | ✅ | ✅ |
| Lớp con (package khác) | ❌ | ❌ | ✅ | ✅ |
| Mọi nơi khác | ❌ | ❌ | ❌ | ✅ |

Thứ tự từ kín nhất tới mở nhất: `private` → `default` → `protected` → `public`.

---

## Khi nào dùng cái nào?

- **`private`**: dùng cho HẦU HẾT thuộc tính. Che giấu dữ liệu, chỉ mở qua getter/setter.
  Đây là mặc định nên theo để code an toàn.
- **`public`**: dùng cho các phương thức là "giao diện" để bên ngoài gọi (như `deposit`,
  `getBalance`), và cho class mà bạn muốn người khác dùng.
- **`protected`**: dùng khi bạn thiết kế class để cho người khác kế thừa và lớp con cần
  truy cập thành viên đó.
- **`default`**: dùng cho các class/phương thức "nội bộ" của một package, không muốn lộ
  ra ngoài.

:::tip Nguyên tắc vàng
Hãy luôn chọn mức **kín nhất có thể**. Bắt đầu với `private`, chỉ mở rộng (lên `public`)
khi thực sự cần. Điều này giúp giảm rủi ro code khác vô tình phá hỏng dữ liệu của bạn.
:::

---

## Lỗi thường gặp

1. **Để mọi thuộc tính là `public`**: dữ liệu dễ bị code khác sửa bừa, mất kiểm soát.
   Hãy ưu tiên `private`.
2. **Nhầm `protected` chỉ là cho lớp con**: thực ra `protected` cũng cho phép truy cập
   trong cùng package.
3. **Quên rằng "không viết gì" là `default`, không phải `public`**: nhiều người mới tưởng
   bỏ trống là công khai.
4. **Cố truy cập thành viên `private` từ ngoài**: gây lỗi biên dịch; phải dùng phương thức
   public trung gian.

---

## Tóm tắt

- 4 mức truy cập (từ kín tới mở): `private` → `default` → `protected` → `public`.
- **`private`**: chỉ trong class đó. **`public`**: mọi nơi.
- **`protected`**: cùng package và các lớp con. **`default`** (không viết gì): chỉ cùng package.
- Nguyên tắc: chọn mức **kín nhất có thể**, ưu tiên `private` cho thuộc tính.
- Phạm vi truy cập là công cụ chính để thực hiện **đóng gói (encapsulation)**.
