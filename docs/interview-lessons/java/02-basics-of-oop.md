---
sidebar_position: 2
title: "2. Cơ bản về OOP"
---

# 2. Cơ bản về OOP

## 1. Lớp và Đối tượng (Class & Object)

Bài học: [1. Lớp và Đối tượng (Class & Object)](../../java/02-basics-of-oop/1_lop-va-doi-tuong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `class` và `object`. Cho ví dụ để làm rõ mối quan hệ giữa chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`class`** là bản thiết kế/khuôn mẫu, chỉ mô tả một loại thực thể sẽ có dữ liệu gì và làm được gì. `class` không chiếm bộ nhớ cho dữ liệu thực tế.
- **`object`** (hay **instance**) là thực thể cụ thể được tạo ra từ class bằng từ khóa `new`, có dữ liệu riêng và tồn tại thật trong bộ nhớ (heap).

```java
class Car { String color; }     // khuôn mẫu, chưa có xe nào cả
Car c1 = new Car();             // object cụ thể thứ nhất
Car c2 = new Car();             // object cụ thể thứ hai, độc lập với c1
```

Một class có thể tạo ra vô số object, mỗi object giữ một bản sao dữ liệu riêng.

</details>

**2. Khi gọi `new Car()`, JVM thực hiện những bước nào theo thứ tự?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Cấp phát bộ nhớ** trên heap đủ chỗ cho các field của object.
2. **Gán giá trị mặc định** cho từng field (`0` cho số, `false` cho `boolean`, `null` cho tham chiếu).
3. **Chạy constructor** (bắt đầu từ constructor của lớp cha thông qua `super(...)` ngầm định, rồi tới thân constructor hiện tại) để gán dữ liệu ban đầu.
4. Trả về **tham chiếu (reference)** tới vùng nhớ vừa tạo, gán cho biến ở vế trái (`Car myCar = ...`).

Biến `myCar` không chứa object thật, mà chỉ chứa **địa chỉ tham chiếu** tới object nằm trên heap.

</details>

**3. Khi nào Java tự động cấp một constructor mặc định (default constructor)? Điều gì xảy ra nếu bạn tự viết một constructor có tham số?**

<details className="qa">
<summary>Xem đáp án</summary>

Java chỉ tự cấp **default constructor** (rỗng, không tham số, thân trống) khi class **hoàn toàn không khai báo constructor nào**.

Ngay khi bạn tự viết **bất kỳ** constructor nào (dù có tham số hay không), Java sẽ **không** còn tự cấp constructor mặc định nữa.

```java
public class Car {
    public Car(String color) { this.color = color; }
    String color;
}

// Car c = new Car(); // LỖI: không còn constructor không tham số
Car c = new Car("Đỏ"); // phải truyền đúng tham số
```

</details>

**4. Overload constructor (nạp chồng constructor) là gì? Viết ví dụ một class `Car` có 2 constructor overload nhau.**

<details className="qa">
<summary>Xem đáp án</summary>

**Overload constructor** là khai báo nhiều constructor cùng tên class nhưng khác nhau về **số lượng hoặc kiểu tham số**, giúp tạo object theo nhiều cách khác nhau.

```java
public class Car {
    String color;
    String brand;

    public Car(String brand) {
        this(brand, "Trắng"); // gọi constructor kia, tránh lặp code
    }

    public Car(String brand, String color) {
        this.brand = brand;
        this.color = color;
    }
}

Car c1 = new Car("Toyota");           // dùng màu mặc định
Car c2 = new Car("Honda", "Đỏ");      // chỉ định cả màu
```

</details>

**5. `this(...)` (gọi constructor khác trong cùng class) khác gì với `this.field` (truy cập thuộc tính)? Có quy tắc nào bắt buộc khi dùng `this(...)`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`this.field`**: tham chiếu tới thuộc tính của object hiện tại, dùng để phân biệt với tham số cùng tên.
- **`this(...)`**: gọi một constructor **khác** trong cùng class (constructor chaining), giúp tái sử dụng logic khởi tạo thay vì lặp lại.

Quy tắc bắt buộc: `this(...)` (cũng như `super(...)`) nếu có thì phải là **câu lệnh đầu tiên** trong thân constructor, và một constructor chỉ được gọi `this(...)` **hoặc** `super(...)`, không được cả hai.

```java
public Car(String brand) {
    this(brand, "Trắng"); // phải là dòng đầu tiên
    // System.out.println(...); // OK sau dòng this(...)
}
```

</details>

**6. Đoạn code sau in ra gì? Giải thích vì sao thay đổi qua `b` lại ảnh hưởng tới `a`.**

```java
Car a = new Car();
a.color = "Đỏ";
Car b = a;
b.color = "Trắng";
System.out.println(a.color);
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `Trắng`.

`a` và `b` không phải hai object khác nhau — cả hai biến chỉ là hai **tham chiếu (reference)** cùng trỏ tới **một** object duy nhất trên heap (`Car b = a;` chỉ copy địa chỉ tham chiếu, không tạo object mới). Vì vậy sửa `color` qua `b` cũng chính là sửa dữ liệu của object mà `a` đang trỏ tới.

Muốn có hai object độc lập, phải dùng `new` riêng: `Car b = new Car();`.

</details>

**7. So sánh `==` và `.equals()` khi dùng với object. Vì sao `new String("abc") == new String("abc")` cho kết quả `false`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`==`** so sánh **tham chiếu** — hai biến có trỏ tới cùng một object trên heap hay không.
- **`.equals()`** so sánh **nội dung logic** — hành vi cụ thể do class override quyết định (mặc định trong `Object` cũng chỉ so sánh `==`).

```java
String s1 = new String("abc");
String s2 = new String("abc");
System.out.println(s1 == s2);       // false: hai object khác nhau trên heap
System.out.println(s1.equals(s2));  // true: String đã override equals() để so nội dung
```

Với các class tự viết mà chưa override `equals()`, gọi `.equals()` cho kết quả y hệt `==` vì đang dùng cài đặt mặc định kế thừa từ `Object`.

</details>

**8. Vì sao nên override `toString()` cho các class tự viết? Điều gì xảy ra nếu không override?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu không override, `System.out.println(myCar)` sẽ gọi `toString()` mặc định của `Object`, in ra một chuỗi vô nghĩa dạng `Car@1b6d3586` (tên class + mã băm dạng hex) — không giúp ích khi debug hay log.

```java
public class Car {
    String color;
    String brand;

    @Override
    public String toString() {
        return "Car{brand=" + brand + ", color=" + color + "}";
    }
}

Car c = new Car(); c.brand = "Toyota"; c.color = "Đỏ";
System.out.println(c); // Car{brand=Toyota, color=Đỏ}
```

Override `toString()` giúp log, debug, và test dễ đọc hơn rất nhiều — gần như là quy ước bắt buộc cho mọi class có dữ liệu (Java 16+ có thể dùng `record` để tự động sinh `toString()` hợp lý).

</details>

**9. Khi nào nên overload nhiều constructor, khi nào nên chuyển sang dùng Builder pattern?**

<details className="qa">
<summary>Xem đáp án</summary>

**Overload constructor phù hợp khi:**

- Class có ít tham số (khoảng 2–4) và không có nhiều tổ hợp tham số tùy chọn.

**Nên chuyển sang Builder khi:**

- Class có **nhiều tham số**, đặc biệt nhiều tham số **tùy chọn** — overload constructor lúc này sinh ra "telescoping constructor" (hàng loạt constructor chồng chéo, dễ gọi nhầm thứ tự tham số cùng kiểu).
- Muốn code gọi rõ ràng, đọc như văn xuôi:

```java
Car car = Car.builder()
    .brand("Toyota")
    .color("Đỏ")
    .seats(4)
    .build();
```

Builder thường được cài đặt là một **static nested class** đi kèm class chính, và rất hợp với các object bất biến (immutable) nhiều trường tùy chọn.

</details>

**10. `NullPointerException` liên quan tới object thường xảy ra trong tình huống nào? Cho một ví dụ và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

Xảy ra khi gọi phương thức hoặc truy cập field trên một biến tham chiếu đang là `null` (chưa từng `new`, hoặc bị gán `null` có chủ đích).

```java
Car myCar; // chỉ khai báo, chưa new — giá trị mặc định là null
System.out.println(myCar.color); // NullPointerException
```

Cách phòng tránh phổ biến:

- Luôn khởi tạo (`new`) trước khi dùng, hoặc kiểm tra `!= null` trước khi truy cập.
- Dùng `Optional<Car>` cho giá trị có thể vắng mặt thay vì trả `null` từ phương thức.
- Từ Java 14+, thông báo lỗi NPE đã chi tiết hơn (Helpful NullPointerExceptions) — chỉ rõ chính xác biến/field nào là `null`, giúp debug nhanh hơn nhiều so với trước đây.

</details>

---

## 2. Thuộc tính và Phương thức

Bài học: [2. Thuộc tính và Phương thức](../../java/02-basics-of-oop/2_thuoc-tinh-va-phuong-thuc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt field (thuộc tính) và method (phương thức) trong một class.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Field**: biến khai báo trực tiếp bên trong class (ngoài các method), lưu **dữ liệu/trạng thái** của object. Mỗi object có bản sao riêng (trừ field `static`).
- **Method**: khối code có tên, mô tả **hành vi** object thực hiện được, có thể nhận tham số và trả về giá trị.

```java
public class BankAccount {
    private double balance; // field: dữ liệu
    public void deposit(double amount) { balance += amount; } // method: hành vi
}
```

Nói ngắn gọn: field trả lời "object có gì", method trả lời "object làm được gì".

</details>

**2. `void` nghĩa là gì? Nếu một phương thức khai báo trả về `int` nhưng thiếu `return` ở một nhánh code thì có lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`void` nghĩa là phương thức **không trả về giá trị nào**, chỉ thực hiện hành động.

Nếu khai báo kiểu trả về khác `void` (ví dụ `int`), trình biên dịch **bắt buộc** mọi đường đi trong thân phương thức phải có `return` giá trị đúng kiểu, nếu không sẽ báo lỗi biên dịch `missing return statement`.

```java
int kiemTra(int x) {
    if (x > 0) {
        return 1;
    }
    // LỖI: nhánh else không có return -> "missing return statement"
}
```

</details>

**3. Phân biệt "tham số" (parameter) và "đối số" (argument). Cho ví dụ trong cùng một đoạn code để chỉ rõ đâu là cái nào.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Tham số (parameter)**: biến được khai báo trong **định nghĩa** phương thức, chỉ là placeholder chưa có giá trị cụ thể.
- **Đối số (argument)**: giá trị **thực tế** được truyền vào khi **gọi** phương thức.

```java
void deposit(double amount) { // amount: tham số
    balance += amount;
}

acc.deposit(500000); // 500000: đối số (argument) truyền cho amount
```

</details>

**4. Overload method (nạp chồng phương thức) là gì? Đoạn code sau có hợp lệ không, vì sao?**

```java
void log(String msg) { }
void log(String msg, int level) { }
int log(String msg) { return 0; }
```

<details className="qa">
<summary>Xem đáp án</summary>

**Overload** là khai báo nhiều method **cùng tên** trong một class nhưng khác nhau về **danh sách tham số** (số lượng hoặc kiểu), cho phép gọi tên method đó theo nhiều cách.

Đoạn code trên **không hợp lệ**: hai method đầu hợp lệ (khác số lượng tham số), nhưng method thứ ba trùng hoàn toàn chữ ký (`signature`) với method đầu tiên — chỉ khác kiểu trả về (`int` thay vì `void`). Java xác định overload dựa trên **tên + danh sách tham số**, **không** tính kiểu trả về, nên đây là lỗi biên dịch "method đã được định nghĩa".

</details>

**5. Java truyền tham số theo giá trị (pass-by-value) hay theo tham chiếu (pass-by-reference)? Giải thích qua ví dụ với kiểu nguyên thủy (`int`).**

<details className="qa">
<summary>Xem đáp án</summary>

Java luôn truyền tham số theo **giá trị (pass-by-value)**, kể cả với object — thứ được copy là **giá trị của tham chiếu**, không phải bản thân object.

```java
void tang(int x) {
    x = x + 1; // chỉ đổi bản sao cục bộ
}

int a = 5;
tang(a);
System.out.println(a); // vẫn là 5, không đổi
```

Với kiểu nguyên thủy, thay đổi tham số bên trong method **không** ảnh hưởng biến gốc, vì `x` chỉ là bản sao độc lập của `a`.

</details>

**6. Với tham số kiểu object (ví dụ một `List`), thay đổi _nội dung_ bên trong method có ảnh hưởng ra ngoài không? Vì sao khác với ví dụ `int` ở câu trên?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có ảnh hưởng**, nếu method sửa **nội dung** của object mà tham chiếu đang trỏ tới (chứ không gán lại cả tham chiếu).

```java
void themItem(List<String> list) {
    list.add("mới"); // sửa nội dung object mà tham chiếu đang trỏ tới
}

List<String> ds = new ArrayList<>(List.of("a"));
themItem(ds);
System.out.println(ds); // [a, mới] -> đã đổi
```

Lý do: giá trị được copy là **địa chỉ tham chiếu**, nhưng cả bản gốc lẫn bản sao tham chiếu đều trỏ tới **cùng một object** trên heap, nên sửa nội dung qua bản sao vẫn thấy được từ bên ngoài. Ngược lại, nếu method gán lại `list = new ArrayList<>();` thì chỉ đổi bản sao tham chiếu cục bộ, biến `ds` bên ngoài không đổi.

</details>

**7. Getter trả về trực tiếp một field kiểu `List` có nguy cơ gì cho tính đóng gói? Cách khắc phục là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu getter trả về **trực tiếp** tham chiếu tới field bên trong (ví dụ `List`, `Map`, mảng), code bên ngoài có thể sửa thẳng nội dung đó mà không qua bất kỳ kiểm tra nào — phá vỡ tính đóng gói dù field đã để `private`.

```java
public class Order {
    private List<String> items = new ArrayList<>();
    public List<String> getItems() { return items; } // rò rỉ tham chiếu nội bộ!
}

order.getItems().clear(); // xóa sạch dữ liệu nội bộ, "qua mặt" mọi validate
```

Khắc phục bằng **defensive copy** (bản sao phòng vệ) hoặc trả về view chỉ đọc:

```java
public List<String> getItems() {
    return List.copyOf(items); // hoặc Collections.unmodifiableList(items)
}
```

</details>

**8. Vì sao nên validate dữ liệu trong setter thay vì tin tưởng dữ liệu đầu vào? Cho ví dụ với `setBalance`.**

<details className="qa">
<summary>Xem đáp án</summary>

Setter là "cửa vào" duy nhất để thay đổi field `private` từ bên ngoài. Nếu không validate, object có thể rơi vào trạng thái **không hợp lệ** (ví dụ số dư âm) mà không ai ngăn được, dẫn tới bug khó truy ở tầng xa hơn.

```java
public void setBalance(double balance) {
    if (balance < 0) {
        throw new IllegalArgumentException("Số dư không được âm");
    }
    this.balance = balance;
}
```

Validate ngay tại setter giúp lỗi bị chặn **sớm nhất có thể**, ngay tại nơi phát sinh, thay vì để nó lan ra và gây hậu quả khó lần ở chỗ khác. Trong dự án lớn, việc này thường được chuẩn hóa bằng Bean Validation (`jakarta.validation`, annotation như `@Min`, `@NotNull`) thay vì viết tay từng if.

</details>

---

## 3. Phạm vi truy cập (Access Specifiers)

Bài học: [3. Phạm vi truy cập (Access Specifiers)](../../java/02-basics-of-oop/3_access-specifiers.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Liệt kê 4 mức access specifier trong Java theo thứ tự từ kín nhất tới mở nhất.**

<details className="qa">
<summary>Xem đáp án</summary>

Từ kín nhất tới mở nhất: `private` → `default` (không viết gì) → `protected` → `public`.

| Mức | Phạm vi truy cập |
|---|---|
| `private` | Chỉ trong chính class đó |
| `default` | Cùng package |
| `protected` | Cùng package + lớp con (kể cả khác package) |
| `public` | Mọi nơi |

</details>

**2. `protected` và `default` khác nhau ở điểm nào? Nhiều người mới hay hiểu nhầm điều gì về `protected`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`default`**: chỉ truy cập được trong **cùng package**, không có ngoại lệ cho lớp con ở package khác.
- **`protected`**: truy cập được trong **cùng package**, cộng thêm cả **lớp con kế thừa dù ở package khác**.

Hiểu nhầm phổ biến: nhiều người tưởng `protected` chỉ dành riêng cho lớp con, nhưng thực ra nó **rộng hơn** `default` vì vẫn cho phép mọi class cùng package truy cập, không chỉ lớp con.

</details>

**3. Đoạn code sau lỗi ở dòng nào? Giải thích vì sao.**

```java
public class BankAccount {
    private double balance;
}

BankAccount acc = new BankAccount();
acc.balance = 500000;
```

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi biên dịch ở dòng `acc.balance = 500000;`.

`balance` là `private`, chỉ truy cập được từ **bên trong chính class `BankAccount`**. Đoạn code gọi từ bên ngoài (ví dụ trong `main` của class khác) nên trình biên dịch báo lỗi `balance has private access in BankAccount`. Phải cung cấp một phương thức `public` (setter, hoặc `deposit(...)` có validate) để thao tác gián tiếp.

</details>

**4. Vì sao top-level class (class khai báo trực tiếp trong file, không lồng) chỉ có thể là `public` hoặc `default`, không thể là `private` hay `protected`?**

<details className="qa">
<summary>Xem đáp án</summary>

`private` và `protected` có ý nghĩa gắn với **quan hệ chứa/kế thừa** (bên trong một class khác, hoặc giữa lớp cha - lớp con). Một top-level class không nằm bên trong class nào cả, nên khái niệm "chỉ class chứa nó mới thấy" hay "chỉ lớp con mới thấy" không áp dụng được ở cấp này.

```java
public class Car { }   // OK
class Helper { }       // OK: default (package-private)
// private class X { } // LỖI: không hợp lệ cho top-level class
```

Lưu ý: quy tắc này chỉ áp dụng cho top-level class. Với **nested class** (lớp lồng nhau), cả 4 mức đều hợp lệ vì lúc đó nó nằm "bên trong" một class khác.

</details>

**5. Vì sao khi override một method, lớp con không được phép thu hẹp phạm vi truy cập so với method gốc ở lớp cha?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì điều đó sẽ vi phạm nguyên tắc **Liskov Substitution** (mọi nơi dùng được lớp cha phải dùng được lớp con thay thế). Nếu code đang gọi method `public` qua tham chiếu kiểu lớp cha, mà lớp con lại override thành `private`/`protected`, lời gọi đó sẽ "biến mất" một cách vô lý ở runtime.

```java
class Animal {
    public void sound() { }
}

class Dog extends Animal {
    // protected void sound() { } // LỖI: thu hẹp từ public xuống protected
    public void sound() { } // OK: giữ nguyên hoặc mở rộng
}
```

Quy tắc: lớp con override chỉ được **giữ nguyên hoặc mở rộng** access modifier, không được thu hẹp.

</details>

**6. Nếu muốn viết một class helper chỉ dùng nội bộ trong package, không cho package khác thấy, nên khai báo thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không thêm từ khóa access modifier nào cho class (dùng mức **default/package-private**), và các thành viên bên trong cũng có thể để `default` nếu chỉ dùng trong cùng package.

```java
// Không có "public" -> chỉ package hiện tại thấy được class này
class ValidationHelper {
    static boolean isValidEmail(String email) {
        return email != null && email.contains("@");
    }
}
```

Cách này giấu chi tiết cài đặt nội bộ, chỉ để lộ ra ngoài đúng những gì thật sự là API công khai (thường đặt trong package `internal` hoặc `impl` theo quy ước một số dự án).

</details>

**7. Access modifier liên hệ thế nào với nguyên lý đóng gói (encapsulation)? Nêu một ví dụ cụ thể về lợi ích khi thay đổi cài đặt bên trong mà không ảnh hưởng code gọi.**

<details className="qa">
<summary>Xem đáp án</summary>

Access modifier là **công cụ kỹ thuật** để thực hiện encapsulation: field/method `private` bị giấu kín, chỉ để lộ ra API `public` ổn định. Nhờ vậy, thay đổi chi tiết cài đặt bên trong không làm "vỡ" code đang dùng class đó, miễn là chữ ký `public` giữ nguyên.

```java
public class BankAccount {
    private double balance; // trước lưu double

    public double getBalance() { return balance; }
}

// Sau này đổi sang lưu bằng BigDecimal nội bộ để tránh sai số thập phân,
// chỉ cần sửa bên trong getBalance(), code gọi acc.getBalance() không đổi gì.
```

Đây là lý do luôn nên ưu tiên `private` cho field và chỉ công khai hành vi (method) cần thiết.

</details>

**8. Tình huống thiết kế: bạn viết một thư viện (library) để nhóm khác dùng. Field nào nên `private`, method nào nên `public`, khi nào cần `protected`?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc chung: **bắt đầu kín nhất, chỉ mở khi thật cần**.

- **`private`**: tất cả field lưu trạng thái nội bộ, và các method phụ trợ (helper) chỉ phục vụ logic bên trong class.
- **`public`**: chỉ những method là **hợp đồng ổn định** với người dùng thư viện (API bạn cam kết không đổi tùy tiện) — đổi API `public` sẽ làm vỡ code của mọi người đang dùng thư viện.
- **`protected`**: dùng khi thiết kế class **cho phép kế thừa có chủ đích** — ví dụ một `AbstractRepository` để lộ vài method hoặc field cho lớp con tùy biến, nhưng vẫn giấu khỏi người dùng thông thường của thư viện.
- **`default`**: dùng cho class/method chỉ là chi tiết triển khai nội bộ của package, không thuộc API công khai.

Việc phân loại đúng ngay từ đầu giúp thư viện dễ tiến hóa về sau mà không phá vỡ tương thích ngược.

</details>

---

## 4. Từ khóa static

Bài học: [4. Từ khóa static](../../java/02-basics-of-oop/4_static-keyword.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `static` nghĩa là gì? Phân biệt thành viên `static` và thành viên instance.**

<details className="qa">
<summary>Xem đáp án</summary>

`static` đánh dấu một thành viên **thuộc về chính class**, chỉ có **một bản duy nhất** dùng chung cho mọi object, và tồn tại ngay cả khi chưa tạo object nào.

| | Instance | Static |
|---|---|---|
| Thuộc về | Từng object | Cả class |
| Số bản sao | Mỗi object một bản | Một bản chung |
| Truy cập | `object.thanhVien` | `Class.thanhVien` |
| Cần `new` trước? | Có | Không |

</details>

**2. Vì sao phương thức `static` không thể truy cập trực tiếp thành viên instance? Đây cũng là lý do cho quy tắc gì của phương thức `main`?**

<details className="qa">
<summary>Xem đáp án</summary>

Phương thức `static` có thể được gọi **trước khi có bất kỳ object nào tồn tại** (qua tên class). Nếu nó truy cập trực tiếp một field instance, Java sẽ không biết lấy dữ liệu từ object nào — vì vậy trình biên dịch cấm hẳn, báo lỗi "non-static variable cannot be referenced from a static context".

```java
static void inTen() {
    // System.out.println(name); // LỖI: name là instance field
}
```

Đây cũng chính là lý do `public static void main(String[] args)` phải là `static`: JVM gọi `main` để khởi động chương trình khi **chưa hề có object nào** được tạo ra.

</details>

**3. Đoạn code sau in ra gì? Giải thích.**

```java
class Counter {
    static int count = 0;
    Counter() { count++; }
}

Counter a = new Counter();
Counter b = new Counter();
Counter c = new Counter();
System.out.println(a.count + " " + b.count + " " + c.count);
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `3 3 3`.

`count` là biến `static` nên chỉ có **một bản duy nhất** dùng chung cho cả class `Counter`, không phải mỗi object một bản riêng. Mỗi lần constructor chạy, `count++` tăng đúng biến chung đó. Sau 3 lần `new`, `count` = 3, và dù truy cập qua `a.count`, `b.count` hay `c.count` (dùng object gọi chỉ để tiện, thực chất Java tự hiểu là `Counter.count`) đều trả về cùng một giá trị.

</details>

**4. Khối `static { }` chạy khi nào? Thứ tự chạy so với constructor như thế nào khi tạo nhiều object?**

<details className="qa">
<summary>Xem đáp án</summary>

Khối `static { }` chạy **đúng một lần**, ngay khi class được JVM **nạp (load)** vào bộ nhớ lần đầu tiên — trước cả `main` và trước constructor của bất kỳ object nào.

```java
class Config {
    static { System.out.println("Nạp Config"); } // chạy 1 lần duy nhất
    Config() { System.out.println("Tạo object"); } // chạy mỗi lần new
}

new Config();
new Config();
// In ra:
// Nạp Config
// Tạo object
// Tạo object
```

Dù bạn tạo bao nhiêu object, static block cũng không chạy lại lần thứ hai.

</details>

**5. Method `static` có thể bị override (ghi đè) bởi lớp con không? Giải thích khái niệm "method hiding" (ẩn phương thức) qua ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Method `static` **không tham gia cơ chế đa hình runtime (override)** — nó chỉ có thể bị **hide (ẩn)**, và việc gọi method nào được quyết định lúc **biên dịch** dựa theo **kiểu khai báo** của biến, không phải kiểu thực sự của object.

```java
class Animal {
    static void hello() { System.out.println("Animal"); }
}
class Dog extends Animal {
    static void hello() { System.out.println("Dog"); } // hide, không phải override
}

Animal a = new Dog();
a.hello(); // in "Animal" — quyết định theo kiểu KHAI BÁO (Animal), không phải Dog
```

Nếu là method instance thông thường (không static), kết quả sẽ là `"Dog"` nhờ đa hình runtime. Đây là câu hỏi phỏng vấn kinh điển để kiểm tra hiểu biết về sự khác nhau giữa override và hide.

</details>

**6. Việc dùng biến `static` để lưu trạng thái dùng chung có rủi ro gì trong ứng dụng đa luồng (multi-threaded)?**

<details className="qa">
<summary>Xem đáp án</summary>

Biến `static` được **chia sẻ giữa mọi thread** trong cùng một JVM. Nếu nhiều thread cùng đọc/ghi mà không đồng bộ hóa, sẽ xảy ra **race condition** (tranh chấp dữ liệu) — ví dụ bộ đếm bị tăng sai do hai thread cùng đọc giá trị cũ trước khi ghi lại.

```java
static int count = 0;
void increment() { count++; } // KHÔNG an toàn khi nhiều thread gọi đồng thời
```

Cách khắc phục phổ biến: dùng `synchronized`, hoặc các lớp nguyên tử trong `java.util.concurrent.atomic` như `AtomicInteger`, hoặc tránh hẳn trạng thái `static` mutable dùng chung — đặc biệt quan trọng trong môi trường web server xử lý nhiều request song song.

</details>

**7. `static import` và `static nested class` khác nhau thế nào? Cho ví dụ ngắn cho mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`static import`**: cho phép gọi thẳng tên method/field `static` của class khác mà không cần viết tên class phía trước.

```java
import static java.lang.Math.max;
int m = max(3, 7); // thay vì Math.max(3, 7)
```

- **`static nested class`**: một class được khai báo `static` bên trong class khác, không cần object của lớp bao ngoài để tạo (xem chi tiết ở bài "Lớp lồng nhau").

```java
class Outer {
    static class Helper { }
}
Outer.Helper h = new Outer.Helper();
```

Hai khái niệm này độc lập nhau: một cái liên quan tới cú pháp gọi method/field, một cái liên quan tới cách khai báo class lồng.

</details>

**8. Singleton pattern (đảm bảo một class chỉ có đúng một instance) thường dùng `static` như thế nào? Viết ví dụ đơn giản, thread-safe.**

<details className="qa">
<summary>Xem đáp án</summary>

Singleton dùng một field `static` để giữ **instance duy nhất**, và một method `static` để cấp phát/truy cập instance đó, đảm bảo không tạo thêm bản thứ hai.

```java
public class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig(); // khởi tạo ngay khi nạp class

    private AppConfig() { } // constructor private: chặn "new" từ bên ngoài

    public static AppConfig getInstance() {
        return INSTANCE;
    }
}

AppConfig cfg = AppConfig.getInstance(); // luôn nhận cùng một object
```

Cách khởi tạo `static final` ngay tại chỗ khai báo (như trên) tận dụng cơ chế nạp class của JVM để đảm bảo **thread-safe** mà không cần `synchronized` thủ công — JVM đảm bảo static initializer chỉ chạy đúng một lần, an toàn giữa các thread.

</details>

---

## 5. Từ khóa final

Bài học: [5. Từ khóa final](../../java/02-basics-of-oop/5_final-keyword.md)

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

---

## 6. Lớp lồng nhau (Nested Classes)

Bài học: [6. Lớp lồng nhau (Nested Classes)](../../java/02-basics-of-oop/6_nested-classes.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Nested class là gì? Kể tên 4 loại lớp lồng nhau trong Java.**

<details className="qa">
<summary>Xem đáp án</summary>

**Nested class** là một class được định nghĩa bên trong một class khác, giúp gom nhóm các class liên quan chặt chẽ và tăng tính đóng gói.

Bốn loại: **static nested class**, **inner class** (non-static), **local class** (trong một phương thức), **anonymous class** (không tên, tạo tại chỗ).

</details>

**2. Phân biệt static nested class và inner class. Sự khác biệt quan trọng nhất về khả năng truy cập là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Static nested class | Inner class |
|---|---|---|
| Cần object outer để tạo? | Không | Có (bắt buộc) |
| Truy cập thành viên outer | Chỉ thành viên `static` | Cả thành viên instance |
| Cú pháp tạo | `new Outer.Nested()` | `outer.new Inner()` |

Khác biệt cốt lõi: **inner class** giữ một tham chiếu ngầm tới object outer nên đọc được dữ liệu instance của nó; **static nested class** hoạt động gần như một class độc lập, không có tham chiếu đó.

</details>

**3. Viết đúng cú pháp tạo một instance của inner class `Screen` bên trong `Computer`.**

<details className="qa">
<summary>Xem đáp án</summary>

Phải tạo object của lớp bao ngoài trước, sau đó dùng cú pháp `outerObject.new InnerClass()`:

```java
Computer pc = new Computer();          // 1. tạo object outer trước
Computer.Screen s = pc.new Screen();   // 2. cú pháp đặc biệt: pc.new
```

Viết `new Screen()` hay `new Computer.Screen()` trực tiếp mà không qua một object `Computer` cụ thể sẽ báo lỗi biên dịch, vì inner class không tồn tại độc lập với object outer.

</details>

**4. Local class là gì? Nêu một tình huống thực tế (dù hiếm) mà bạn sẽ dùng nó.**

<details className="qa">
<summary>Xem đáp án</summary>

**Local class** là class định nghĩa bên trong một phương thức, chỉ tồn tại và dùng được trong phạm vi phương thức đó.

```java
void xuLy(List<Integer> nums) {
    class Bo {
        int tong(List<Integer> ns) {
            return ns.stream().mapToInt(Integer::intValue).sum();
        }
    }
    System.out.println(new Bo().tong(nums));
}
```

Rất hiếm gặp trong thực tế vì lambda hoặc method riêng thường gọn hơn; chỉ hợp lý khi cần một class có **nhiều method hoặc state phức tạp**, chỉ dùng trong đúng một phương thức, mà lambda (chỉ một abstract method) không diễn đạt đủ.

</details>

**5. Anonymous class là gì? Vì sao trong Java hiện đại nhiều trường hợp anonymous class được thay bằng lambda?**

<details className="qa">
<summary>Xem đáp án</summary>

**Anonymous class** là một class không có tên, được tạo và dùng ngay tại chỗ, thường để cài đặt nhanh một interface hoặc kế thừa nhanh một class.

```java
Runnable r = new Runnable() {
    @Override
    public void run() { System.out.println("Chạy"); }
};
```

Từ Java 8, nếu interface đó là **functional interface** (chỉ có đúng một abstract method, ví dụ `Runnable`, `Comparator`), có thể thay bằng **lambda** ngắn gọn hơn nhiều:

```java
Runnable r = () -> System.out.println("Chạy");
```

Lambda súc tích hơn, không tạo cú pháp rườm rà `new Interface() { ... }`, và không tự tạo tham chiếu `this` gây nhầm lẫn như anonymous class.

</details>

**6. Đoạn code sau lỗi ở đâu? Giải thích.**

```java
public class Computer {
    private String model = "Dell XPS";

    static class Keyboard {
        void show() {
            System.out.println(model); // ?
        }
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi ở dòng `System.out.println(model);` bên trong `Keyboard`.

`Keyboard` là **static nested class**, nó **không** giữ tham chiếu tới bất kỳ object `Computer` cụ thể nào, nên không thể truy cập trực tiếp thành viên **instance** (`model`) của outer class — báo lỗi tương tự "non-static variable cannot be referenced from a static context". Muốn dùng `model`, phải đổi `Keyboard` thành **inner class** (bỏ `static`), hoặc truyền một object `Computer` vào làm tham số.

</details>

**7. Vì sao inner class (non-static) có thể gây rủi ro rò rỉ bộ nhớ (memory leak)? Giải thích cơ chế đứng sau.**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi instance của inner class **giữ một tham chiếu ngầm định** tới object outer đã tạo ra nó (để có thể truy cập dữ liệu instance). Nếu instance của inner class **sống lâu hơn** object outer về mặt logic — ví dụ được lưu vào một collection tĩnh, đăng ký làm listener dài hạn, hay giữ trong cache — thì object outer **không bao giờ được garbage collector dọn**, dù logic chương trình không còn cần tới nó nữa, vì vẫn có tham chiếu ngầm trỏ tới.

Đây là lý do các framework như Android từng khuyến cáo mạnh mẽ dùng **static nested class** (không giữ tham chiếu outer) kèm `WeakReference` khi cần truy cập outer, thay vì inner class thông thường, đặc biệt cho các đối tượng có vòng đời dài như `Handler`, `AsyncTask`.

</details>

**8. Builder pattern thường cài đặt bằng static nested class. Vì sao chọn static nested class, không phải inner class, cho mục đích này?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Builder` **không cần** dữ liệu của một object outer đã tồn tại từ trước — ngược lại, nhiệm vụ của nó là **tạo ra** object đó. Nếu là inner class, người dùng sẽ buộc phải có sẵn một object `Product` mới gọi được `product.new Builder()`, hoàn toàn vô lý vì `Builder` sinh ra chính là để **thay thế** việc gọi constructor trực tiếp.

```java
public class Pizza {
    private final String size;
    private final boolean cheese;

    private Pizza(Builder b) {
        this.size = b.size;
        this.cheese = b.cheese;
    }

    public static class Builder {
        private String size;
        private boolean cheese;

        public Builder size(String size) { this.size = size; return this; }
        public Builder cheese(boolean cheese) { this.cheese = cheese; return this; }
        public Pizza build() { return new Pizza(this); }
    }
}

Pizza p = new Pizza.Builder().size("L").cheese(true).build();
```

`static` giúp `Builder` tạo được độc lập, ngay từ đầu, không cần object `Pizza` nào tồn tại trước.

</details>

---

## 7. Gói (Packages)

Bài học: [7. Gói (Packages)](../../java/02-basics-of-oop/7_packages.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Package là gì và giải quyết vấn đề gì trong một dự án lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Package** là cơ chế nhóm các class liên quan vào chung một "ngăn", giống thư mục sắp xếp tài liệu. Nó giải quyết ba vấn đề:

- **Tổ chức code**: dự án hàng trăm class vẫn dễ tìm, dễ quản lý.
- **Tránh trùng tên (namespace)**: hai class cùng tên `Order` vẫn tồn tại song song nếu ở hai package khác nhau, vì tên đầy đủ (package + tên class) là duy nhất.
- **Kiểm soát truy cập**: kết hợp với mức `default` (package-private) để giới hạn thành phần chỉ dùng được trong cùng package.

</details>

**2. Câu lệnh `package` phải đặt ở đâu trong file? Thứ tự với `import` như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`package` bắt buộc là **dòng code đầu tiên** của file (chỉ được đứng sau comment, nếu có). Sau đó mới tới các câu lệnh `import`, rồi mới tới định nghĩa class.

```java
package com.myapp.util;   // 1. package - bắt buộc đầu tiên

import java.util.List;    // 2. import - sau package

public class Calculator { // 3. định nghĩa class
}
```

Một file `.java` chỉ được có **đúng một** câu lệnh `package`. Đặt sai vị trí (ví dụ sau `import`) gây lỗi biên dịch.

</details>

**3. Phân biệt `import com.myapp.util.Calculator;` và `import com.myapp.util.*;`. Nên dùng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Import đơn lẻ | Import wildcard `*` |
|---|---|---|
| Cú pháp | `import com.myapp.util.Calculator;` | `import com.myapp.util.*;` |
| Phạm vi | Đúng một class | Mọi class `public` trong package đó |
| Rõ ràng | Biết ngay class nào được dùng | Không biết class nào thực sự cần |
| Xung đột tên | Ít rủi ro | Dễ đụng độ nếu 2 package có class trùng tên |

**Nên ưu tiên import đơn lẻ**: IDE hiện đại tự động thêm/xóa dòng import nên không tốn công gõ tay, đồng thời code rõ ràng và tránh xung đột tên khi nhiều package cùng có class trùng tên (lúc đó `*` không đủ, phải chỉ định tên đầy đủ — fully qualified name).

</details>

**4. Vì sao dùng `String` hay `System.out.println` mà không cần viết `import` cho chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `String` và `System` nằm trong package **`java.lang`**, package DUY NHẤT được Java **tự động import** vào mọi file `.java`, không cần khai báo `import` tường minh.

```java
public class Demo {
    public static void main(String[] args) {
        String s = "Hello"; // String thuộc java.lang, không cần import
        System.out.println(s); // System cũng thuộc java.lang
    }
}
```

Các package khác như `java.util`, `java.io`, `java.time` đều phải `import` tường minh khi dùng.

</details>

**5. Đọc code: khai báo `package com.myapp.util;` nhưng file `Calculator.java` lại đặt ở thư mục `src/com/app/util/`. Chuyện gì xảy ra khi biên dịch?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình biên dịch (`javac`) sẽ báo lỗi vì **tên package phải khớp chính xác với đường dẫn thư mục** chứa file, tính từ thư mục gốc (source root). Package `com.myapp.util` bắt buộc file phải nằm ở `.../com/myapp/util/Calculator.java`.

```
Lỗi ví dụ: package com.myapp.util is not consistent with class file location
```

Cách sửa: di chuyển file vào đúng thư mục `com/myapp/util/`, hoặc sửa lại khai báo `package` cho khớp thư mục hiện có.

</details>

**6. Hai class cùng tên `Order` ở hai package `com.sales.order` và `com.restaurant.order` — làm sao dùng CẢ HAI trong cùng một file mà không xung đột?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ `import` được **một trong hai** theo tên ngắn `Order`, vì `import` đưa tên ngắn vào cùng một namespace của file. Với class còn lại, phải dùng **fully qualified name** (tên đầy đủ gồm cả package) ngay tại nơi sử dụng, không `import` nó nữa:

```java
import com.sales.order.Order; // dùng tên ngắn Order cho class này

public class Invoice {
    Order salesOrder = new Order(); // tên ngắn, nhờ import
    com.restaurant.order.Order restaurantOrder = new com.restaurant.order.Order(); // tên đầy đủ
}
```

</details>

**7. Mức truy cập `default` (package-private, không viết access modifier) liên quan gì đến package? Cho ví dụ tình huống nên dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

`default` nghĩa là thành phần (class, field, method) chỉ truy cập được từ các class **cùng package**, class ở package khác — kể cả lớp con — đều không thấy được. Đây là cách package hỗ trợ đóng gói (encapsulation) ở cấp module nhỏ.

```java
// package com.myapp.service;
class InternalCache {      // default -> chỉ package com.myapp.service dùng được
    int get(String key) { ... }
}
```

Dùng khi muốn có các class/helper hỗ trợ nội bộ cho một nhóm chức năng (vd tầng `service`), nhưng không muốn lộ ra cho tầng `controller` hay package khác gọi trực tiếp.

</details>

**8. Từ Java 9, JPMS (Java Platform Module System, khai báo qua `module-info.java`) ra đời. Module khác gì với package? Chúng liên hệ với nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Package** là đơn vị tổ chức class ở mức mã nguồn (namespace, thư mục). **Module** (từ Java 9) là một lớp gói **lớn hơn**, đóng gói NHIỀU package lại và khai báo tường minh:

- Package nào được **export** ra ngoài cho module khác dùng (`exports com.myapp.api`).
- Module nào mình **cần** (`requires`).

```java
// module-info.java
module com.myapp {
    requires java.sql;
    exports com.myapp.api;   // chỉ package này lộ ra ngoài module
    // com.myapp.internal không export -> module khác không dùng được dù class là public
}
```

Điểm khác biệt cốt lõi: trước Java 9, `public` là public với **cả JVM**; có module, một class `public` trong package không `export` vẫn bị **chặn truy cập từ module khác** — đây là "đóng gói mạnh" (strong encapsulation) mà package đơn thuần không làm được.

</details>

**9. Khi tổ chức package cho một ứng dụng, nên chia theo TẦNG kỹ thuật (`controller`, `service`, `repository`) hay theo TÍNH NĂNG (feature/domain, ví dụ `order`, `user`)? Nêu tiêu chí chọn.**

<details className="qa">
<summary>Xem đáp án</summary>

**Chia theo tầng kỹ thuật** (`com.app.controller`, `com.app.service`, `com.app.repository`):

- Ưu điểm: quen thuộc, dễ áp dụng cho dự án nhỏ.
- Nhược điểm: khi sửa một tính năng phải nhảy qua nhiều package; package-private mất tác dụng bảo vệ vì các lớp của cùng một feature lại nằm ở các package khác nhau (buộc phải để `public`).

**Chia theo tính năng/domain** (`com.app.order.OrderController`, `com.app.order.OrderService`, `com.app.user.UserController`...):

- Ưu điểm: các class liên quan tới một nghiệp vụ nằm gần nhau; có thể dùng `default` (package-private) để giấu chi tiết cài đặt của feature đó, chỉ export ra ngoài những gì cần thiết — tận dụng đúng tinh thần package-private.
- Phù hợp khi dự án lớn dần, nhiều team làm việc song song trên các domain khác nhau.

**Tiêu chí chọn**: dự án nhỏ, ít thay đổi cấu trúc — chia theo tầng cũng ổn; dự án lớn, nhiều domain nghiệp vụ độc lập, muốn tận dụng package-private để đóng gói — nên chia theo tính năng.

</details>
