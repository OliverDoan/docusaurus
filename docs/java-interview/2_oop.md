---
sidebar_position: 2
title: "2. Lập trình hướng đối tượng (OOP)"
---

# Lập trình hướng đối tượng (OOP)

> **OOP (Object-Oriented Programming — Lập trình hướng đối tượng)** là chủ đề **được hỏi nhiều nhất** trong mọi buổi phỏng vấn Java cấp độ intern/fresher. Gần như **chắc chắn** bạn sẽ bị hỏi về 4 trụ cột, kế thừa, đa hình và sự khác nhau giữa abstract class với interface. Hãy ôn thật kỹ phần này — trả lời tốt ở đây là bạn đã ghi điểm hơn một nửa buổi phỏng vấn.

---

## Câu 1: OOP là gì? Bốn trụ cột của OOP là gì? `[Basic]`

### Câu hỏi

> "Em hiểu OOP là gì? Em hãy kể 4 đặc tính (trụ cột) của lập trình hướng đối tượng và giải thích từng cái cho anh nghe nhé."

### Giải thích lý thuyết

**OOP (Object-Oriented Programming — Lập trình hướng đối tượng)** là một **phương pháp (paradigm)** lập trình, trong đó ta tổ chức chương trình thành các **đối tượng (object)**. Mỗi đối tượng gói gọn **dữ liệu (data — thuộc tính)** và **hành vi (behavior — phương thức)** liên quan vào cùng một chỗ.

Ý tưởng cốt lõi: thay vì viết code rời rạc, ta **mô hình hóa thế giới thực** thành các đối tượng. Ví dụ một chiếc xe có dữ liệu (màu, tốc độ) và hành vi (chạy, phanh).

OOP có **4 trụ cột (four pillars)**:

1. **Đóng gói (Encapsulation)**: Gom dữ liệu và phương thức xử lý dữ liệu đó vào một lớp, đồng thời **giấu chi tiết bên trong** và chỉ cho truy cập qua phương thức công khai.
   - *Đời thường*: Máy ATM. Bạn bấm nút rút tiền, không cần biết bên trong máy đếm tiền thế nào.

2. **Kế thừa (Inheritance)**: Một lớp con (subclass) **kế thừa lại** thuộc tính và phương thức từ lớp cha (superclass), giúp **tái sử dụng code**.
   - *Đời thường*: Con cái thừa hưởng đặc điểm từ cha mẹ.

3. **Đa hình (Polymorphism)**: Cùng một hành động nhưng **biểu hiện khác nhau** tùy đối tượng. "Poly" = nhiều, "morph" = hình dạng.
   - *Đời thường*: Nút "phát âm thanh" — chó thì sủa, mèo thì kêu meo, dù cùng là hành động "kêu".

4. **Trừu tượng (Abstraction)**: Chỉ phơi bày những gì **cần thiết**, ẩn đi chi tiết phức tạp bên trong.
   - *Đời thường*: Lái xe chỉ cần biết đạp ga, không cần hiểu động cơ đốt trong hoạt động ra sao.

### Code minh hoạ

```java
// Lớp Animal minh hoạ gói dữ liệu (Encapsulation) và là lớp cha (Inheritance)
class Animal {
    private String ten; // dữ liệu được giấu (private)

    public Animal(String ten) {
        this.ten = ten;
    }

    public String getTen() { // truy cập qua phương thức công khai
        return ten;
    }

    public void keu() { // hành vi chung, sẽ được ghi đè (override)
        System.out.println(ten + " phát ra âm thanh");
    }
}

// Cho (Dog) kế thừa Animal
class Cho extends Animal {
    public Cho(String ten) {
        super(ten); // gọi constructor lớp cha
    }

    @Override
    public void keu() { // Đa hình: cùng phương thức keu() nhưng biểu hiện khác
        System.out.println(getTen() + " sủa: Gâu gâu!");
    }
}
```

### Đáp án mẫu

> "OOP là cách lập trình mà mình tổ chức chương trình thành các đối tượng, mỗi đối tượng gói dữ liệu và hành vi vào cùng một chỗ giống như mô hình hóa thế giới thực. OOP có 4 trụ cột: **đóng gói** là giấu dữ liệu và chỉ cho truy cập qua getter/setter; **kế thừa** là lớp con dùng lại code của lớp cha; **đa hình** là cùng một phương thức nhưng mỗi đối tượng làm khác nhau; và **trừu tượng** là chỉ phơi ra cái cần dùng, ẩn chi tiết phức tạp đi. Ví dụ chó và mèo cùng kế thừa Animal, cùng có phương thức keu() nhưng kêu khác nhau — đó là đa hình."

---

## Câu 2: Class và Object khác nhau như thế nào? `[Basic]`

### Câu hỏi

> "Em phân biệt giúp anh **class (lớp)** và **object (đối tượng)**. Cho một ví dụ luôn nhé."

### Giải thích lý thuyết

- **Class (lớp)** là một **khuôn mẫu (template / blueprint)**. Nó **mô tả** một đối tượng sẽ có những thuộc tính và phương thức gì. Class **không chiếm bộ nhớ** cho dữ liệu cụ thể — nó chỉ là bản thiết kế.

- **Object (đối tượng)** là một **thực thể cụ thể (instance)** được tạo ra từ class bằng từ khóa `new`. Mỗi object có **vùng nhớ riêng** và có **giá trị dữ liệu cụ thể của chính nó**.

So sánh dễ hiểu:
- Class giống như **bản thiết kế ngôi nhà** (chỉ vẽ trên giấy).
- Object là **ngôi nhà thật được xây** từ bản thiết kế đó — và bạn có thể xây nhiều ngôi nhà từ cùng một bản vẽ.

### Code minh hoạ

```java
// Class: khuôn mẫu mô tả một chiếc xe
class Xe {
    String mau;     // thuộc tính
    int tocDo;

    void chay() {   // phương thức
        System.out.println(mau + " đang chạy " + tocDo + " km/h");
    }
}

public class Main {
    public static void main(String[] args) {
        // Object: thực thể cụ thể, tạo bằng new
        Xe xe1 = new Xe();
        xe1.mau = "Đỏ";
        xe1.tocDo = 80;

        Xe xe2 = new Xe(); // một object khác, vùng nhớ riêng
        xe2.mau = "Xanh";
        xe2.tocDo = 60;

        xe1.chay(); // Đỏ đang chạy 80 km/h
        xe2.chay(); // Xanh đang chạy 60 km/h
    }
}
```

### Đáp án mẫu

> "Class là khuôn mẫu, là bản thiết kế mô tả đối tượng sẽ có thuộc tính và phương thức gì, nhưng nó không chiếm bộ nhớ dữ liệu cụ thể. Còn object là thực thể thật được tạo ra từ class bằng từ khóa `new`, mỗi object có vùng nhớ và giá trị riêng. Ví dụ class Xe là bản vẽ, còn xe1 màu đỏ và xe2 màu xanh là hai object cụ thể được tạo từ class đó."

---

## Câu 3: Constructor là gì? Constructor mặc định? Từ khóa `this` dùng làm gì? `[Basic]`

### Câu hỏi

> "Constructor (hàm khởi tạo) là gì? Nếu mình không viết constructor thì sao? Và từ khóa `this` để làm gì?"

### Giải thích lý thuyết

**Constructor (hàm khởi tạo)** là một phương thức đặc biệt được gọi **tự động khi tạo object bằng `new`**, dùng để **khởi tạo giá trị ban đầu** cho object. Đặc điểm:

- **Tên trùng với tên class**.
- **Không có kiểu trả về** (kể cả `void`).
- Có thể có **nhiều constructor** với tham số khác nhau (đây là overloading).

**Constructor mặc định (default constructor)**: Nếu bạn **không viết constructor nào**, trình biên dịch (compiler) **tự thêm một constructor rỗng không tham số** cho bạn. Nhưng lưu ý: nếu bạn đã viết **bất kỳ** constructor có tham số nào, compiler sẽ **không** tự thêm cái rỗng nữa.

**Từ khóa `this`**: Là tham chiếu (reference) trỏ tới **chính object hiện tại**. Thường dùng để:
- Phân biệt **thuộc tính của object** với **tham số** khi trùng tên.
- Gọi constructor khác trong cùng class: `this(...)`.

### Code minh hoạ

```java
class SinhVien {
    String ten;
    int tuoi;

    // Constructor không tham số
    public SinhVien() {
        this.ten = "Chưa đặt tên"; // this trỏ tới object hiện tại
        this.tuoi = 18;
    }

    // Constructor có tham số (overloading)
    public SinhVien(String ten, int tuoi) {
        // this.ten là thuộc tính, ten là tham số — this giúp phân biệt
        this.ten = ten;
        this.tuoi = tuoi;
    }
}

public class Main {
    public static void main(String[] args) {
        SinhVien sv1 = new SinhVien();               // gọi constructor rỗng
        SinhVien sv2 = new SinhVien("Lan", 20);      // gọi constructor có tham số
    }
}
```

### Đáp án mẫu

> "Constructor là hàm khởi tạo, được gọi tự động khi mình tạo object bằng `new`, dùng để gán giá trị ban đầu. Nó trùng tên với class và không có kiểu trả về. Nếu mình không viết constructor nào thì compiler tự thêm một constructor rỗng mặc định, nhưng nếu mình đã viết một constructor có tham số thì cái mặc định sẽ không còn được tự thêm nữa. Còn `this` là tham chiếu tới chính object hiện tại, hay dùng để phân biệt thuộc tính với tham số khi chúng trùng tên, kiểu `this.ten = ten`."

---

## Câu 4: Đóng gói (Encapsulation) là gì? Vì sao để biến `private` rồi dùng getter/setter? `[Basic]`

### Câu hỏi

> "Đóng gói là gì? Tại sao người ta hay để thuộc tính `private` rồi viết getter/setter thay vì để `public` luôn cho nhanh?"

### Giải thích lý thuyết

**Đóng gói (Encapsulation)** là việc **gói dữ liệu và phương thức** vào cùng một lớp, đồng thời **giấu (data hiding)** trạng thái bên trong khỏi bên ngoài. Cách làm phổ biến: để thuộc tính ở mức `private`, rồi cung cấp **getter** (đọc) và **setter** (ghi) ở mức `public`.

Lợi ích vì sao không để `public` cho nhanh:

1. **Kiểm soát dữ liệu (validation)**: Trong setter, ta có thể **kiểm tra giá trị hợp lệ** trước khi gán. Nếu để `public`, ai cũng gán bừa được (ví dụ tuổi = -5).
2. **Bảo vệ dữ liệu**: Có thể tạo trường **chỉ đọc** (chỉ có getter, không có setter).
3. **Dễ bảo trì**: Sau này muốn đổi cách lưu trữ bên trong, chỉ cần sửa trong getter/setter, **code bên ngoài không bị ảnh hưởng**.
4. **Che giấu chi tiết**: Bên ngoài không cần biết dữ liệu được lưu thế nào.

### Code minh hoạ

```java
class TaiKhoan {
    private double soDu; // private: giấu khỏi bên ngoài

    // Getter: cho đọc
    public double getSoDu() {
        return soDu;
    }

    // Setter có kiểm tra hợp lệ (validation)
    public void napTien(double tien) {
        if (tien <= 0) {
            System.out.println("Số tiền nạp phải lớn hơn 0!");
            return; // chặn dữ liệu sai
        }
        this.soDu += tien;
    }
}

public class Main {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();
        // tk.soDu = -1000;  // LỖI biên dịch: soDu là private, không thể gán trực tiếp
        tk.napTien(500);     // hợp lệ
        tk.napTien(-100);    // bị chặn bởi validation
        System.out.println("Số dư: " + tk.getSoDu()); // 500.0
    }
}
```

### Đáp án mẫu

> "Đóng gói là gom dữ liệu và phương thức vào một lớp rồi giấu dữ liệu bên trong, thường bằng cách để thuộc tính `private` và cho truy cập qua getter/setter. Lý do không để `public` luôn là vì trong setter mình kiểm soát được giá trị hợp lệ — ví dụ chặn nạp số tiền âm; mình cũng có thể làm trường chỉ đọc bằng cách chỉ viết getter; và sau này muốn đổi cách lưu bên trong thì code bên ngoài không bị ảnh hưởng. Tóm lại nó giúp dữ liệu an toàn và code dễ bảo trì hơn."

---

## Câu 5: Kế thừa (Inheritance) là gì? `extends`, `super`. Java có đa kế thừa class không? `[Intermediate]`

### Câu hỏi

> "Em giải thích kế thừa trong Java. Từ khóa `extends` và `super` dùng làm gì? Java có cho **đa kế thừa (multiple inheritance)** class không, vì sao?"

### Giải thích lý thuyết

**Kế thừa (Inheritance)** cho phép một **lớp con (subclass / child)** dùng lại thuộc tính và phương thức của **lớp cha (superclass / parent)**, giúp **tái sử dụng code** và thể hiện quan hệ "là một" (is-a). Ví dụ: `Cho` **là một** `Animal`.

- **`extends`**: Từ khóa để khai báo lớp con kế thừa lớp cha: `class Cho extends Animal`.
- **`super`**: Tham chiếu tới **lớp cha**. Dùng để:
  - Gọi **constructor của lớp cha**: `super(...)`.
  - Gọi **phương thức của lớp cha** đã bị ghi đè: `super.keu()`.

**Java KHÔNG hỗ trợ đa kế thừa với class** — một class chỉ được `extends` **một** class cha duy nhất. Lý do là tránh **"Diamond Problem" (vấn đề kim cương)**: nếu một lớp kế thừa hai lớp cha mà cả hai có cùng một phương thức, compiler sẽ không biết chọn phương thức nào.

Tuy nhiên, Java cho phép **một class `implements` (triển khai) nhiều interface** — đây là cách Java đạt được "đa kế thừa hành vi" một cách an toàn.

### Code minh hoạ

```java
class Animal {
    protected String ten;

    public Animal(String ten) {
        this.ten = ten;
    }

    public void an() {
        System.out.println(ten + " đang ăn");
    }
}

class Cho extends Animal { // Cho kế thừa Animal
    public Cho(String ten) {
        super(ten); // gọi constructor của lớp cha Animal
    }

    public void sua() {
        super.an();  // gọi phương thức an() của lớp cha
        System.out.println(ten + " sủa gâu gâu");
    }
}

public class Main {
    public static void main(String[] args) {
        Cho c = new Cho("Mực");
        c.an();   // kế thừa từ Animal -> Mực đang ăn
        c.sua();  // Mực đang ăn / Mực sủa gâu gâu
    }
}
```

### Đáp án mẫu

> "Kế thừa cho phép lớp con dùng lại thuộc tính và phương thức của lớp cha để tái sử dụng code, thể hiện quan hệ 'là một'. Mình dùng `extends` để khai báo kế thừa, còn `super` để gọi constructor hoặc phương thức của lớp cha. Java **không** cho đa kế thừa với class — một class chỉ `extends` được một class cha thôi, để tránh Diamond Problem khi hai lớp cha có cùng phương thức thì không biết chọn cái nào. Nhưng Java cho `implements` nhiều interface cùng lúc, đó là cách Java đạt được đa kế thừa hành vi một cách an toàn."

---

## Câu 6: Đa hình (Polymorphism) là gì? Phân biệt runtime và compile-time? `[Intermediate]`

### Câu hỏi

> "Đa hình là gì? Có mấy loại đa hình? Em phân biệt đa hình lúc biên dịch và đa hình lúc chạy giúp anh."

### Giải thích lý thuyết

**Đa hình (Polymorphism)** nghĩa là "nhiều hình dạng" — cùng một hành động/phương thức nhưng có thể **biểu hiện khác nhau** tùy đối tượng. Java có **2 loại**:

1. **Đa hình lúc biên dịch (Compile-time Polymorphism)** — còn gọi là **Static Polymorphism**:
   - Đạt được bằng **nạp chồng phương thức (method overloading)**: cùng tên phương thức nhưng **khác danh sách tham số**.
   - Compiler quyết định gọi phương thức nào **ngay lúc biên dịch** dựa trên tham số truyền vào.

2. **Đa hình lúc chạy (Runtime Polymorphism)** — còn gọi là **Dynamic Polymorphism**:
   - Đạt được bằng **ghi đè phương thức (method overriding)**: lớp con viết lại phương thức của lớp cha.
   - Phương thức nào được gọi sẽ được quyết định **lúc chạy (runtime)** dựa trên **object thật sự**, chứ không phải kiểu khai báo. Cơ chế này gọi là **dynamic method dispatch**.

### Code minh hoạ

```java
class HinhHoc {
    public double tinhDienTich() {
        return 0;
    }
}

class HinhTron extends HinhHoc {
    double banKinh = 2;

    @Override
    public double tinhDienTich() { // ghi đè -> đa hình lúc chạy
        return Math.PI * banKinh * banKinh;
    }
}

class HinhVuong extends HinhHoc {
    double canh = 3;

    @Override
    public double tinhDienTich() {
        return canh * canh;
    }
}

public class Main {
    // Ví dụ đa hình lúc biên dịch (overloading)
    static int cong(int a, int b) { return a + b; }
    static double cong(double a, double b) { return a + b; }

    public static void main(String[] args) {
        // Đa hình lúc chạy: biến kiểu cha trỏ tới object con
        HinhHoc h;
        h = new HinhTron();
        System.out.println(h.tinhDienTich());  // gọi của HinhTron (quyết định lúc chạy)
        h = new HinhVuong();
        System.out.println(h.tinhDienTich());  // gọi của HinhVuong

        // Đa hình lúc biên dịch: compiler chọn theo tham số
        System.out.println(cong(2, 3));        // gọi bản int
        System.out.println(cong(2.5, 3.5));    // gọi bản double
    }
}
```

### Đáp án mẫu

> "Đa hình là cùng một phương thức nhưng biểu hiện khác nhau tùy đối tượng. Java có hai loại: đa hình lúc biên dịch đạt được bằng **overloading** — cùng tên hàm khác tham số, compiler chọn ngay lúc biên dịch; và đa hình lúc chạy đạt được bằng **overriding** — lớp con viết lại phương thức lớp cha, và phương thức nào chạy được quyết định lúc runtime dựa trên object thật. Ví dụ một biến kiểu HinhHoc trỏ tới object HinhTron thì gọi tinhDienTich() sẽ chạy bản của HinhTron — đó chính là đa hình lúc chạy."

---

## Câu 7: Overloading và Overriding khác nhau thế nào? `@Override` để làm gì? `[Intermediate]`

### Câu hỏi

> "Em phân biệt **overloading (nạp chồng)** và **overriding (ghi đè)**. Annotation `@Override` có tác dụng gì?"

### Giải thích lý thuyết

Đây là một câu **rất hay bị nhầm**, cần nắm rõ:

**Overloading (nạp chồng phương thức)**:
- **Cùng tên** phương thức nhưng **khác danh sách tham số** (khác số lượng, kiểu, hoặc thứ tự tham số).
- Xảy ra trong **cùng một class** (hoặc lớp con).
- Là **đa hình lúc biên dịch**.
- Kiểu trả về có thể giống hoặc khác — nhưng **chỉ khác kiểu trả về thì KHÔNG đủ** để overloading.

**Overriding (ghi đè phương thức)**:
- Lớp con viết lại phương thức của lớp cha với **cùng tên, cùng tham số, cùng kiểu trả về** (hoặc kiểu trả về là lớp con — covariant).
- Xảy ra giữa **lớp cha và lớp con** (cần có kế thừa).
- Là **đa hình lúc chạy**.
- Mức truy cập của lớp con **không được hẹp hơn** lớp cha.

**`@Override`**: Là **annotation** báo cho compiler biết "phương thức này tôi cố ý ghi đè của lớp cha". Nếu mình ghi sai tên hoặc sai tham số (vô tình tạo overloading thay vì override), **compiler sẽ báo lỗi ngay** — giúp tránh bug. Đây là một thói quen tốt.

### Code minh hoạ

```java
class MayTinh {
    // Overloading: cùng tên "cong", khác tham số
    int cong(int a, int b) { return a + b; }
    int cong(int a, int b, int c) { return a + b + c; }
    double cong(double a, double b) { return a + b; }

    void inThongTin() {
        System.out.println("Máy tính cơ bản");
    }
}

class MayTinhKhoaHoc extends MayTinh {
    @Override // báo compiler đây là ghi đè -> nếu sai sẽ báo lỗi
    void inThongTin() { // Overriding: cùng tên, cùng tham số với lớp cha
        System.out.println("Máy tính khoa học");
    }
}
```

### Đáp án mẫu

> "Overloading là cùng tên phương thức nhưng khác danh sách tham số, xảy ra trong cùng một class, là đa hình lúc biên dịch. Còn overriding là lớp con viết lại phương thức của lớp cha với cùng tên cùng tham số cùng kiểu trả về, cần có kế thừa, là đa hình lúc chạy. Một điểm hay nhầm là chỉ khác kiểu trả về thôi thì không tính overloading. Còn `@Override` là annotation báo compiler rằng mình cố ý ghi đè, nếu mình lỡ viết sai tên hay sai tham số thì compiler báo lỗi luôn nên rất an toàn."

---

## Câu 8: Abstract class và Interface khác nhau thế nào? Khi nào dùng cái nào? `[Intermediate]`

### Câu hỏi

> "Đây là câu kinh điển nhé: **abstract class (lớp trừu tượng)** và **interface (giao diện)** khác nhau ở đâu? Khi nào em chọn cái này, khi nào chọn cái kia?"

### Giải thích lý thuyết

Cả hai đều dùng cho **trừu tượng (abstraction)** và **không thể tạo object trực tiếp** bằng `new`, nhưng khác nhau ở nhiều điểm:

| Tiêu chí | Abstract class (lớp trừu tượng) | Interface (giao diện) |
|---|---|---|
| Từ khóa | `abstract class` | `interface` |
| Cách dùng ở lớp con | `extends` (chỉ 1) | `implements` (nhiều) |
| Phương thức | Có cả abstract lẫn phương thức có thân hàm | Truyền thống chỉ có abstract (Java 8+ thêm `default`, `static`) |
| Thuộc tính | Biến thường, có trạng thái | Mặc định là `public static final` (hằng số) |
| Constructor | Có | Không |
| Đa kế thừa | Không (chỉ extends 1 class) | Có (implements nhiều interface) |
| Mức truy cập phương thức | Bất kỳ (private, protected...) | Mặc định `public` |

**Khi nào dùng cái nào?**

- Dùng **abstract class** khi: các lớp con có **quan hệ chặt chẽ (is-a)**, **chia sẻ code chung** (có phương thức đã cài đặt sẵn), hoặc cần **lưu trạng thái** (biến). Ví dụ: `Animal` là lớp cha của `Cho`, `Meo` — chúng chia sẻ thuộc tính `ten` và phương thức `an()`.

- Dùng **interface** khi: muốn định nghĩa một **hợp đồng (contract) về hành vi** mà nhiều lớp **không liên quan** có thể cùng triển khai, hoặc khi cần **đa kế thừa hành vi**. Ví dụ: interface `Bay` có thể được cả `Chim` và `MayBay` triển khai dù chúng chẳng họ hàng gì.

Từ **Java 8**, interface có thêm **`default method`** (phương thức có thân hàm mặc định), làm ranh giới hai bên gần hơn — nhưng abstract class vẫn khác ở chỗ có **trạng thái (biến instance)** và **constructor**.

### Code minh hoạ

```java
// Abstract class: có trạng thái + phương thức chung
abstract class Animal {
    protected String ten; // có trạng thái

    public Animal(String ten) { // có constructor
        this.ten = ten;
    }

    public void ngu() { // phương thức đã cài đặt sẵn, dùng chung
        System.out.println(ten + " đang ngủ");
    }

    public abstract void keu(); // phương thức trừu tượng, lớp con bắt buộc cài đặt
}

// Interface: hợp đồng hành vi, lớp không liên quan cũng dùng được
interface Bay {
    void bay(); // mặc định public abstract
}

class Chim extends Animal implements Bay {
    public Chim(String ten) {
        super(ten);
    }

    @Override
    public void keu() {
        System.out.println(ten + " hót líu lo");
    }

    @Override
    public void bay() {
        System.out.println(ten + " đang bay");
    }
}
```

### Đáp án mẫu

> "Cả abstract class và interface đều dùng cho trừu tượng và đều không tạo object trực tiếp được. Khác nhau là: abstract class thì lớp con `extends` và chỉ được một, nó có thể có biến trạng thái, có constructor, và có phương thức cài đặt sẵn. Còn interface thì lớp con `implements` được nhiều cùng lúc, các trường mặc định là hằng `public static final`, không có constructor. Về khi nào dùng: mình chọn abstract class khi các lớp con có quan hệ chặt chẽ và chia sẻ code chung; còn chọn interface khi muốn định nghĩa một hợp đồng hành vi cho nhiều lớp không liên quan, hoặc khi cần đa kế thừa hành vi. Từ Java 8 interface có thêm default method nhưng vẫn không có trạng thái như abstract class."

---

## Câu 9: Từ khóa `static` dùng làm gì? Biến static khác biến instance ra sao? `[Basic]`

### Câu hỏi

> "Từ khóa `static` trong Java để làm gì? Biến `static` khác biến thường (instance) như thế nào?"

### Giải thích lý thuyết

**`static`** nghĩa là thành phần đó **thuộc về class**, không thuộc về một object cụ thể. Có thể áp dụng cho biến, phương thức và khối static.

- **Biến static (static variable / class variable)**: Chỉ có **một bản duy nhất** được **chia sẻ chung** cho tất cả object của class. Truy cập qua **tên class**: `TenClass.bien`.
- **Biến instance (instance variable)**: Mỗi object có **bản riêng**, không chia sẻ.
- **Phương thức static (static method)**: Gọi qua tên class **không cần tạo object**. Lưu ý: phương thức static **không truy cập trực tiếp** được biến/phương thức instance và **không dùng được `this`** (vì không gắn với object nào). Ví dụ điển hình: `Math.sqrt()`, và hàm `main` cũng là `static`.

Khi nào dùng `static`: cho các giá trị **dùng chung** (ví dụ đếm số object đã tạo, hằng số cấu hình) hoặc các hàm **tiện ích (utility)** không cần dữ liệu của object.

### Code minh hoạ

```java
class DemSinhVien {
    static int soLuong = 0;   // biến static: chia sẻ chung mọi object
    String ten;               // biến instance: riêng từng object

    public DemSinhVien(String ten) {
        this.ten = ten;
        soLuong++; // mỗi lần tạo object, biến chung tăng 1
    }

    // Phương thức static: gọi không cần object
    static int laySoLuong() {
        return soLuong;
        // return this.ten; // LỖI: static không dùng được this / biến instance
    }
}

public class Main {
    public static void main(String[] args) {
        new DemSinhVien("An");
        new DemSinhVien("Bình");
        // Truy cập qua tên class, không cần object
        System.out.println(DemSinhVien.laySoLuong()); // 2
    }
}
```

### Đáp án mẫu

> "`static` nghĩa là thành phần đó thuộc về class chứ không thuộc object cụ thể. Biến static chỉ có một bản duy nhất, được chia sẻ chung cho tất cả object — ví dụ dùng để đếm số object đã tạo. Còn biến instance thì mỗi object có một bản riêng. Phương thức static thì gọi qua tên class mà không cần tạo object, như `Math.sqrt()`, nhưng nó không dùng được `this` và không truy cập trực tiếp biến instance vì nó không gắn với object nào. Hàm `main` cũng là static nên JVM gọi được mà không cần tạo object."

---

## Câu 10: Từ khóa `final` dùng cho biến, method, class có ý nghĩa gì? `[Basic]`

### Câu hỏi

> "Từ khóa `final` áp dụng cho biến, phương thức và class thì mỗi trường hợp có ý nghĩa gì?"

### Giải thích lý thuyết

**`final`** có nghĩa là "không thể thay đổi", nhưng ý nghĩa cụ thể tùy vào nơi áp dụng:

1. **`final` cho biến (variable)**: Biến trở thành **hằng số (constant)** — chỉ được gán giá trị **một lần**, sau đó không gán lại được.
   - Lưu ý quan trọng: với biến tham chiếu (object), `final` chỉ khóa **tham chiếu** (không trỏ sang object khác), nhưng **nội dung bên trong object vẫn có thể thay đổi**.

2. **`final` cho phương thức (method)**: Phương thức đó **không thể bị ghi đè (override)** ở lớp con. Dùng khi muốn đảm bảo hành vi của phương thức không bị thay đổi.

3. **`final` cho class**: Class đó **không thể bị kế thừa (extends)**. Ví dụ điển hình là lớp `String` trong Java là `final`.

Quy ước đặt tên: hằng số `final` thường viết HOA và gạch dưới, ví dụ `MAX_SIZE`.

### Code minh hoạ

```java
final class HangSo {       // class final: không thể extends
    static final double PI = 3.14159; // biến final: hằng số, gán 1 lần

    final void inPI() {    // method final: lớp con không override được
        System.out.println("PI = " + PI);
    }
}

public class Main {
    public static void main(String[] args) {
        final int TUOI = 18; // biến final
        // TUOI = 20;        // LỖI: không gán lại được biến final

        final int[] mang = {1, 2, 3};
        // mang = new int[5]; // LỖI: không trỏ sang mảng khác
        mang[0] = 99;         // HỢP LỆ: nội dung bên trong vẫn đổi được
        System.out.println(mang[0]); // 99
    }
}
```

### Đáp án mẫu

> "`final` nghĩa là không thay đổi được, nhưng tùy chỗ áp dụng. Với biến thì nó thành hằng số, chỉ gán được một lần — lưu ý là với object thì final chỉ khóa tham chiếu chứ nội dung bên trong vẫn đổi được. Với phương thức thì lớp con không override được nó nữa. Với class thì class đó không thể bị kế thừa, ví dụ class String trong Java chính là final. Mình hay dùng final cho các hằng số như `MAX_SIZE` để đảm bảo giá trị không bị sửa nhầm."
