---
sidebar_position: 5
title: "5. Từ khóa final"
---

# Từ khóa final

Từ khóa `final` dùng để "khóa" một thứ lại, ngăn không cho thay đổi sau khi đã thiết lập. Nó giúp code an toàn hơn bằng cách tạo ra hằng số bất biến, ngăn phương thức bị ghi đè hay ngăn một lớp bị kế thừa. Bài này giới thiệu cách dùng `final` với biến, phương thức, lớp và tham số.

[![Sơ đồ tóm tắt bài: Từ khóa final](/img/java/final-keyword.webp)](pathname:///img/java/final-keyword.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **`final` = khóa lại, không cho thay đổi** — áp dụng cho biến, phương thức và class.
- ⭐ **Với object, `final` chỉ khóa tham chiếu** — không gán lại được object khác nhưng dữ liệu bên trong object vẫn đổi được.
- **Biến `final` là hằng số, gán đúng một lần** — quy ước tên `UPPER_SNAKE_CASE`; kết hợp `static final` cho hằng dùng chung.
- **Phương thức `final` không bị override, class `final` không bị kế thừa** — ví dụ `String` là class `final`.

:::

---

## Mục lục

- [Vì sao có từ khóa final?](#vì-sao-có-từ-khóa-final)
- [final là gì?](#final-là-gì)
- [Biến final (hằng số)](#biến-final-hằng-số)
- [Quy ước đặt tên hằng](#quy-ước-đặt-tên-hằng)
- [Hằng số static final](#hằng-số-static-final)
- [Phương thức final](#phương-thức-final)
- [Lớp final](#lớp-final)
- [final với tham số](#final-với-tham-số)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao có từ khóa final?

**Vấn đề:** Có những thứ trong code **không nên thay đổi**, nhưng Java mặc định cho phép gán lại biến, override phương thức và kế thừa class. Không có cách "khóa", ta dễ vô tình làm sai hành vi quan trọng.

```java
class Account {
    double interestRate = 0.05; // lẽ ra là hằng số cố định
    void transfer() { /* logic chuyển tiền nhạy cảm */ }
}

class HackedAccount extends Account {
    // Lớp con override làm vỡ logic bảo mật
    void transfer() { /* bỏ qua kiểm tra, rút sạch tiền */ }
}

// Ở đâu đó trong code: hằng số bị gán lại nhầm
Account acc = new Account();
acc.interestRate = 99.0; // tai họa: không ai chặn được
```

**Giải pháp:** `final` đánh dấu một thứ là **BẤT BIẾN / KHÔNG ĐƯỢC THAY**: biến `final` chỉ gán một lần (hằng số), phương thức `final` không cho override, class `final` không cho kế thừa (ví dụ `String`). Nhờ đó code an toàn hơn, ý đồ rõ ràng hơn, hỗ trợ thiết kế immutable và cho phép JVM tối ưu.

```java
class Account {
    final double INTEREST_RATE = 0.05;      // hằng số: gán một lần
    public final void transfer() { /* ... */ } // không lớp con nào override được
}

final class Money { /* ... */ } // không class nào kế thừa được

// acc.INTEREST_RATE = 99.0; // LỖI biên dịch: chặn ngay từ đầu
```

:::tip[Dùng thực tế]

- **Hằng số cấu hình**: `public static final int MAX_USERS = 1000;` dùng chung, không đổi.
- **Class immutable**: đánh dấu các field `final` để object không thay đổi sau khi tạo (an toàn khi chia sẻ giữa nhiều luồng).
- **Khóa method nhạy cảm**: để `final` cho phương thức xác thực/giao dịch, tránh lớp con override làm sai hành vi.
- **Biến cho lambda / inner class**: biến địa phương dùng trong lambda phải là `final` (hoặc "effectively final").

:::

---

## final là gì?

**`final`** (cuối cùng — đánh dấu một thứ KHÔNG được thay đổi sau khi đã thiết lập) dùng để "khóa" lại một giá trị, một phương thức, hoặc cả một class.

Hãy hình dung `final` như **mực không xóa được**: một khi đã viết ra thì không sửa được nữa. Điều này giúp code an toàn hơn vì ngăn người khác (hoặc chính bạn) vô tình thay đổi những thứ vốn phải cố định.

`final` áp dụng được cho ba thứ: **biến**, **phương thức**, và **class**.

Sơ đồ minh hoạ ba đối tượng mà `final` có thể "khóa" lại:

```mermaid
flowchart TD
    F["final<br/>(khóa lại, bất biến)"]
    F --> V["Biến<br/>gán một lần (hằng số)"]
    F --> M["Phương thức<br/>không cho override"]
    F --> C["Class<br/>không cho kế thừa"]
```

---

## Biến final (hằng số)

Một biến `final` chỉ được gán giá trị **đúng một lần**. Sau đó mọi nỗ lực thay đổi đều bị báo lỗi biên dịch. Biến như vậy gọi là **hằng số** (constant — giá trị cố định không đổi).

```java
public class Circle {
    final double PI = 3.14159; // hằng số: không bao giờ đổi

    double area(double radius) {
        // PI = 3.14; // LỖI: không thể gán lại biến final
        return PI * radius * radius;
    }
}
```

Ví dụ đời thường: số ngày trong tuần luôn là 7, tốc độ ánh sáng là cố định — những giá trị này nên là `final`.

---

## Quy ước đặt tên hằng

Theo quy ước Java, tên hằng số (biến `final`, nhất là `static final`) được viết **VIẾT HOA TOÀN BỘ**, các từ ngăn cách bằng dấu gạch dưới `_` (kiểu **UPPER_SNAKE_CASE**).

```java
final int MAX_SPEED = 120;          // đúng quy ước
final String DEFAULT_NAME = "Khách"; // đúng quy ước
final double TAX_RATE = 0.1;         // đúng quy ước

// final int maxSpeed = 120;  // chạy được nhưng SAI quy ước đặt tên hằng
```

Quy ước này giúp người đọc nhận ra ngay đâu là hằng số chỉ bằng cách nhìn tên.

---

## Hằng số static final

Hằng số dùng chung cho cả chương trình thường kết hợp `static` và `final`:

- **`static`**: chỉ có một bản, dùng chung, không cần tạo object.
- **`final`**: không thể thay đổi.

```java
public class AppConstants {
    // Hằng số toàn cục: dùng chung và bất biến
    public static final int MAX_USERS = 1000;
    public static final String VERSION = "1.0.0";
}
```

```java
// Truy cập trực tiếp qua tên class, không cần tạo object
System.out.println(AppConstants.MAX_USERS); // 1000
```

Đây là cách chuẩn để định nghĩa các hằng số cấu hình trong một ứng dụng.

---

## Phương thức final

**Phương thức `final`** không thể bị **override** (ghi đè — lớp con viết lại phương thức cùng tên để thay đổi hành vi). Dùng khi bạn muốn đảm bảo một hành vi không bị lớp con thay đổi.

```java
public class Account {
    // Lớp con KHÔNG được viết lại phương thức này
    public final void showId() {
        System.out.println("ID tài khoản cố định");
    }
}

public class SavingAccount extends Account {
    // public void showId() { } // LỖI: không thể override phương thức final
}
```

---

## Lớp final

**Class `final`** không thể bị **kế thừa** — không lớp nào được `extends` từ nó. Dùng khi bạn muốn class hoàn chỉnh, không cho ai mở rộng (thường vì lý do an toàn).

```java
public final class Constants {
    // Không class nào được extends Constants
}

// public class MyConstants extends Constants { } // LỖI biên dịch
```

Một ví dụ nổi tiếng: class `String` trong Java là `final`, nên không ai thay đổi được hành vi cốt lõi của nó.

---

## final với tham số

`final` cũng dùng cho **tham số** để đảm bảo tham số đó không bị gán lại trong thân hàm.

```java
public void greet(final String name) {
    // name = "khác"; // LỖI: tham số final không gán lại được
    System.out.println("Xin chào " + name);
}
```

:::info Lưu ý quan trọng về object final
Với biến `final` trỏ tới một object, `final` chỉ ngăn **gán lại object khác**, chứ KHÔNG ngăn thay đổi dữ liệu BÊN TRONG object đó. Ví dụ: `final int[] arr = {1, 2};` thì không gán `arr = mảng khác` được, nhưng `arr[0] = 99;` vẫn hợp lệ.
:::

---

## Lỗi thường gặp

1. **Gán lại biến final**: gây lỗi biên dịch "cannot assign a value to final variable".
2. **Quên khởi tạo biến final**: biến `final` phải được gán giá trị (lúc khai báo hoặc trong constructor); nếu không sẽ báo lỗi.
3. **Đặt tên hằng sai quy ước**: viết thường như biến bình thường khiến code khó đọc; hãy dùng `UPPER_SNAKE_CASE`.
4. **Tưởng object final là bất biến hoàn toàn**: thực ra chỉ tham chiếu là cố định, dữ liệu bên trong object vẫn đổi được.

---

## Tóm tắt

- **`final`** khóa một thứ lại, không cho thay đổi.
- **Biến final** = hằng số, gán đúng một lần; quy ước tên là `UPPER_SNAKE_CASE`.
- **`static final`** dùng cho hằng số dùng chung toàn ứng dụng.
- **Phương thức final** không bị lớp con ghi đè; **class final** không bị kế thừa.
- Với biến `final` trỏ tới object, chỉ tham chiếu là cố định — nội dung object vẫn đổi được.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `final` áp dụng được cho những thành phần nào trong Java? Mỗi trường hợp có ý nghĩa gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`final` áp dụng cho ba thành phần:

- **Biến** (field, biến local, tham số): chỉ được gán giá trị **đúng một lần** — trở thành hằng số.
- **Phương thức**: không cho lớp con **override**.
- **Class**: không cho class nào khác **kế thừa** (`extends`).

Điểm chung: `final` đánh dấu một thứ là **bất biến / khóa lại**, không cho thay đổi sau khi đã thiết lập.

</details>

**2. Vì sao `final` một mình (biến thường) khác với `static final` (hằng số dùng chung)? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`final`** (field instance): mỗi object có **một bản riêng**, chỉ gán được đúng một lần cho object đó (thường trong constructor).
- **`static final`**: chỉ có **một bản duy nhất** dùng chung cho cả class, đúng nghĩa "hằng số toàn cục".

```java
class Product {
    final String id;              // riêng từng object, gán 1 lần trong constructor
    static final double VAT = 0.1; // dùng chung, không đổi

    Product(String id) { this.id = id; }
}
```

Dùng `final` khi mỗi object cần một giá trị cố định riêng (ví dụ ID sinh lúc tạo); dùng `static final` cho cấu hình/hằng số chung toàn ứng dụng.

</details>

**3. Phương thức `final` khác gì với phương thức bình thường khi lớp con cố override? Cho ví dụ lỗi biên dịch cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Phương thức `final` **không thể** bị lớp con viết lại (override) — trình biên dịch sẽ báo lỗi ngay nếu lớp con cố gắng.

```java
class Account {
    public final void showId() { System.out.println("ID cố định"); }
}

class SavingAccount extends Account {
    // public void showId() { } // LỖI biên dịch: cannot override final method
}
```

Dùng khi muốn đảm bảo một hành vi (thường là logic nhạy cảm như xác thực, tính toán cốt lõi) **không thể** bị lớp con thay đổi dù vô tình hay cố ý.

</details>

**4. Vì sao class `String` trong Java được thiết kế là `final`? Nêu ít nhất hai lý do.**

<details className="qa">
<summary>Xem đáp án</summary>

- **An toàn & bảo mật**: nếu ai đó tạo được lớp con của `String` và override hành vi, các đoạn code tin tưởng vào tính bất biến của `String` (ví dụ dùng làm key trong `HashMap`, hay truyền qua network) có thể bị phá vỡ.
- **Hỗ trợ String pool**: Java tái sử dụng các literal `String` giống nhau trong một vùng nhớ chung (string pool) để tiết kiệm bộ nhớ — điều này chỉ an toàn khi đảm bảo `String` **không đổi được** và không ai override được hành vi của nó.
- **Tối ưu hiệu năng**: JVM/JIT có thể tối ưu mạnh hơn cho các class `final` vì biết chắc không có lớp con nào thay đổi hành vi tại runtime.

</details>

**5. Đoạn code sau có hợp lệ không? Giải thích chính xác `final` đang khóa cái gì.**

```java
final int[] arr = {1, 2, 3};
arr[0] = 99;
arr = new int[]{4, 5, 6};
```

<details className="qa">
<summary>Xem đáp án</summary>

Dòng `arr[0] = 99;` **hợp lệ**. Dòng `arr = new int[]{4, 5, 6};` **LỖI biên dịch**.

`final` trên biến tham chiếu tới object (mảng, hay bất kỳ object nào) chỉ khóa **tham chiếu** — không cho gán `arr` trỏ sang một mảng khác. Nó **không** khóa dữ liệu bên trong object mà tham chiếu đang trỏ tới, nên sửa phần tử `arr[0]` vẫn hoàn toàn hợp lệ.

Đây là nguồn nhầm lẫn phổ biến: `final` ≠ immutable (bất biến hoàn toàn). Muốn object thực sự bất biến, phải tự thiết kế class đó không cho phép thay đổi nội dung (không có setter, field bên trong cũng `private final`, không lộ tham chiếu mutable ra ngoài).

</details>

**6. Biến local dùng trong lambda hoặc anonymous class phải thỏa điều kiện gì? Giải thích khái niệm "effectively final".**

<details className="qa">
<summary>Xem đáp án</summary>

Biến local được lambda/anonymous class "chụp lại" (capture) từ ngoài phải là `final` hoặc **effectively final** — nghĩa là dù không viết từ khóa `final`, nhưng biến đó **chỉ được gán giá trị đúng một lần**, không hề bị gán lại ở bất kỳ đâu sau đó.

```java
int threshold = 10; // không viết "final" nhưng không bị gán lại -> effectively final
List<Integer> filtered = list.stream()
    .filter(x -> x > threshold) // dùng được vì threshold effectively final
    .toList();

// threshold = 20; // nếu thêm dòng này thì threshold KHÔNG còn effectively final -> lỗi biên dịch ở lambda
```

Lý do kỹ thuật: lambda có thể chạy ở thời điểm khác (hoặc thread khác) so với lúc khai báo biến; Java đảm bảo an toàn bằng cách **copy giá trị** tại thời điểm capture, nên giá trị đó bắt buộc phải cố định để tránh sai lệch.

</details>

**7. So sánh ba từ dễ nhầm: `final`, `finally`, `finalize`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Từ khóa | Vai trò |
|---|---|
| `final` | Khóa biến/phương thức/class, không cho thay đổi/override/kế thừa |
| `finally` | Khối trong `try-catch-finally`, luôn chạy dù có exception hay không, dùng để dọn dẹp tài nguyên |
| `finalize()` | Phương thức của `Object`, JVM gọi trước khi garbage collector dọn object — đã **deprecated từ Java 9** và được đánh dấu **sẽ bị gỡ bỏ (deprecated for removal) từ Java 18** (JEP 421), không nên dùng nữa; thay thế bằng `try-with-resources` hoặc `Cleaner` (`java.lang.ref.Cleaner`). |

Ba từ này không liên quan gì nhau về mặt chức năng, chỉ trùng hình thức chữ — câu hỏi phân biệt chúng là câu hỏi kinh điển của phỏng vấn Java.

</details>

**8. `record` (Java 16+) liên hệ thế nào với `final`? Vì sao nói mọi field của `record` mặc định là bất biến?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi khai báo một `record`, trình biên dịch **tự động sinh** mỗi thành phần (component) thành một field `private final`, kèm constructor gán giá trị và các phương thức accessor (không có setter). Bản thân class `record` cũng ngầm định là `final` — không cho phép kế thừa thêm.

```java
public record Point(int x, int y) { }

Point p = new Point(1, 2);
// p.x = 5; // không tồn tại setter, và field là final -> không thể đổi
```

Vì tất cả field đều `final` và không có cách gán lại sau khi tạo, một `record` mặc định đã là một **object bất biến (immutable)** đúng nghĩa — không cần tự viết `final` thủ công cho từng field như class thường.

</details>
