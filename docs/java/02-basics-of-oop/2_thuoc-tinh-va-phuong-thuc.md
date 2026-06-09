---
sidebar_position: 2
title: "2. Thuộc tính và Phương thức"
---

# Thuộc tính và Phương thức

Mỗi lớp trong Java được tạo nên từ hai thành phần chính: thuộc tính (dữ liệu mà đối tượng lưu giữ) và phương thức (hành vi mà đối tượng thực hiện). Nắm vững cách khai báo thuộc tính, viết phương thức, truyền tham số và trả về kết quả sẽ giúp bạn xây dựng được các lớp hữu ích, an toàn. Bài này giới thiệu thuộc tính, phương thức, tham số, giá trị trả về và cặp getter/setter.

---

## Mục lục

- [Tổng quan: dữ liệu và hành vi](#tổng-quan-dữ-liệu-và-hành-vi)
- [Thuộc tính (Fields)](#thuộc-tính-fields)
- [Phương thức (Methods)](#phương-thức-methods)
- [Tham số (Parameters)](#tham-số-parameters)
- [Giá trị trả về (Return value)](#giá-trị-trả-về-return-value)
- [Getter và Setter](#getter-và-setter)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Tổng quan: dữ liệu và hành vi

Một class trong Java gồm hai thành phần chính:

- **Fields** (thuộc tính — dữ liệu mà object lưu giữ): mô tả object "là gì", "có gì".
- **Methods** (phương thức — hành vi mà object thực hiện): mô tả object "làm được gì".

Ví dụ đời thường với một **tài khoản ngân hàng**:

- Thuộc tính: số dư, tên chủ tài khoản.
- Phương thức: gửi tiền, rút tiền, xem số dư.

---

## Thuộc tính (Fields)

Thuộc tính là các biến được khai báo bên trong class (ngoài các phương thức). Mỗi object
sẽ có một bản sao riêng của các thuộc tính này.

```java
public class BankAccount {
    // Các thuộc tính của tài khoản
    String owner;     // tên chủ tài khoản
    double balance;   // số dư (double = số thực, lưu được phần thập phân)
}
```

Nếu không gán giá trị, thuộc tính có **giá trị mặc định**: số (`int`, `double`) là `0`,
boolean là `false`, còn đối tượng/`String` là `null` (rỗng).

---

## Phương thức (Methods)

**Method** (phương thức — một khối code có tên, thực hiện một việc cụ thể) cho phép object
"làm" điều gì đó. Cấu trúc một phương thức:

```
<kiểu trả về> <tên phương thức>(<danh sách tham số>) {
    // phần thân: các lệnh cần thực hiện
}
```

```java
public class BankAccount {
    String owner;
    double balance;

    // Phương thức không trả về gì (void), chỉ thực hiện hành động
    void showBalance() {
        System.out.println("Số dư của " + owner + ": " + balance);
    }
}
```

Từ khóa **`void`** (rỗng — phương thức không trả về giá trị nào) cho biết phương thức này
chỉ làm việc chứ không "đưa lại" kết quả gì.

---

## Tham số (Parameters)

**Parameter** (tham số — dữ liệu được truyền VÀO phương thức để nó dùng) giúp phương thức
làm việc linh hoạt với dữ liệu khác nhau mỗi lần gọi.

```java
public class BankAccount {
    double balance;

    // amount là tham số: số tiền muốn gửi
    void deposit(double amount) {
        balance = balance + amount; // cộng tiền gửi vào số dư
        System.out.println("Đã gửi: " + amount);
    }
}
```

Khi gọi, ta truyền **argument** (đối số — giá trị thực tế đưa vào cho tham số):

```java
BankAccount acc = new BankAccount();
acc.deposit(500000); // 500000 là argument cho tham số amount
```

Một phương thức có thể có nhiều tham số, ngăn cách bởi dấu phẩy:

```java
void transfer(String toName, double amount) {
    // ... chuyển amount tới tài khoản toName
}
```

---

## Giá trị trả về (Return value)

Khi phương thức cần "đưa lại" một kết quả, ta khai báo **kiểu trả về** (thay cho `void`)
và dùng từ khóa **`return`** (trả về — gửi kết quả ra ngoài và kết thúc phương thức).

```java
public class BankAccount {
    double balance;

    // Phương thức trả về một số double: số dư hiện tại
    double getBalance() {
        return balance; // trả giá trị balance ra ngoài
    }

    // Trả về true/false: kiểm tra đủ tiền để rút không
    boolean canWithdraw(double amount) {
        return balance >= amount; // biểu thức so sánh cho ra true hoặc false
    }
}
```

Cách dùng giá trị trả về:

```java
double current = acc.getBalance(); // lưu kết quả vào biến
if (acc.canWithdraw(100000)) {
    System.out.println("Đủ tiền để rút");
}
```

---

## Getter và Setter

Thông thường, ta không cho code bên ngoài truy cập thẳng vào thuộc tính, mà che giấu chúng
rồi cung cấp hai loại phương thức:

- **Getter** (phương thức "lấy" — trả về giá trị của một thuộc tính). Tên thường là `getX`.
- **Setter** (phương thức "đặt" — gán/thay đổi giá trị một thuộc tính). Tên thường là `setX`.

Lợi ích: ta có thể KIỂM TRA dữ liệu trước khi cho phép thay đổi, tránh dữ liệu sai.

```java
public class BankAccount {
    private double balance; // private = chỉ truy cập được bên trong class này

    // Getter: cho phép đọc số dư
    public double getBalance() {
        return balance;
    }

    // Setter: cho phép gán số dư, kèm kiểm tra hợp lệ
    public void setBalance(double balance) {
        if (balance < 0) {
            System.out.println("Số dư không được âm!");
            return; // không gán nếu dữ liệu sai
        }
        this.balance = balance;
    }
}
```

```java
BankAccount acc = new BankAccount();
acc.setBalance(1000000);              // gán hợp lệ
System.out.println(acc.getBalance()); // đọc ra: 1000000.0
acc.setBalance(-50);                  // bị từ chối, in cảnh báo
```

:::tip
Việc che giấu thuộc tính bằng `private` rồi dùng getter/setter chính là biểu hiện của
**encapsulation** (đóng gói — che giấu dữ liệu bên trong, chỉ cho truy cập qua phương thức).
Ta sẽ học kỹ về phạm vi truy cập ở bài tiếp theo.
:::

---

## Lỗi thường gặp

1. **Quên `return`**: phương thức khai báo trả về `int` nhưng không có `return` sẽ báo
   lỗi biên dịch "missing return statement".
2. **Sai kiểu trả về**: khai báo trả về `int` nhưng `return "abc";` (chuỗi) sẽ báo lỗi.
3. **Số lượng/kiểu argument sai**: gọi `deposit()` mà thiếu tham số, hoặc truyền chuỗi
   cho tham số `double`, đều gây lỗi biên dịch.
4. **Truy cập thẳng `private`**: dùng `acc.balance` từ bên ngoài khi `balance` là `private`
   sẽ báo lỗi — phải dùng getter/setter.

---

## Tóm tắt

- **Fields** (thuộc tính) lưu dữ liệu; **methods** (phương thức) thực hiện hành vi.
- **`void`** nghĩa là phương thức không trả về gì; ngược lại khai báo kiểu trả về và dùng
  **`return`**.
- **Tham số** là dữ liệu truyền vào phương thức; **đối số** là giá trị thực tế khi gọi.
- **Getter/Setter** là cặp phương thức để đọc/ghi thuộc tính một cách an toàn, có kiểm tra.
- Che giấu thuộc tính bằng `private` rồi truy cập qua getter/setter là kỹ thuật đóng gói.
