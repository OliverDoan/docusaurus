---
sidebar_position: 5
title: "5. Đóng gói (Encapsulation)"
---

# Đóng gói (Encapsulation)

Đóng gói là nguyên tắc che giấu dữ liệu bên trong đối tượng và chỉ cho phép truy cập qua các phương thức được kiểm soát. Nhờ giấu thuộc tính bằng `private` và cho đọc/ghi qua getter/setter, bạn bảo vệ được dữ liệu khỏi bị sửa tùy tiện và dễ thay đổi cách lưu trữ sau này. Bài này hướng dẫn dùng `private`, getter/setter và validation; phần chi tiết nằm bên dưới.

[![Sơ đồ tóm tắt bài: Đóng gói (Encapsulation)](/img/java/dong-goi.webp)](pathname:///img/java/dong-goi.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Che giấu field bằng `private`, chỉ truy cập qua getter/setter** — kiểm soát mọi thao tác đọc/ghi.
- ⭐ **Setter validate chặn giá trị phi logic ngay tại cửa ngõ** — như số dư âm, tuổi âm, email rỗng.
- **Getter có thể tính toán suy ra** — ví dụ `getFahrenheit()` từ độ C, không cần lưu dư thừa.
- **Ẩn cấu trúc nội bộ giúp tự do refactor** — đổi cách lưu trữ bên trong mà getter/setter không đổi thì không ai bị vỡ.
- **Tuân quy ước JavaBeans** — `get`/`set`, và `is` cho kiểu `boolean`.

:::

---

## Mục lục

- [Vì sao có đóng gói (encapsulation)?](#vì-sao-có-đóng-gói-encapsulation)
- [Đóng gói là gì?](#đóng-gói-là-gì)
- [private — che giấu dữ liệu](#private--che-giấu-dữ-liệu)
- [Getter và Setter](#getter-và-setter)
- [Lợi ích bảo vệ dữ liệu](#lợi-ích-bảo-vệ-dữ-liệu)
- [Validation trong setter](#validation-trong-setter)
- [Quy ước đặt tên getter/setter](#quy-ước-đặt-tên-gettersetter)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao có đóng gói (encapsulation)?

**Vấn đề:** nếu để thuộc tính `public` cho sửa trực tiếp, bất kỳ ai cũng có thể đặt giá trị phi logic, phá vỡ tính nhất quán (bất biến) của đối tượng. Hơn nữa, code bên ngoài phụ thuộc thẳng vào cấu trúc field — đổi field là vỡ.

```java
public class TaiKhoan {
    public double soDu;      // ai cũng sửa được
    public int tuoiChuTK;
    public String email;
}

public class Main {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();
        tk.soDu = -500000;   // số dư ÂM — phi logic!
        tk.tuoiChuTK = -3;   // tuổi ÂM — phi logic!
        tk.email = "";       // email RỖNG — phi logic!
        // Đối tượng rơi vào trạng thái sai mà không gì ngăn được
    }
}
```

**Giải pháp:** đóng gói — để field `private`, chỉ cho truy cập qua getter/setter (hoặc phương thức nghiệp vụ) để **kiểm soát** và **validate** mọi thay đổi. Ẩn chi tiết cài đặt giúp bạn tự do refactor bên trong mà không vỡ API bên ngoài, đồng thời bảo vệ trạng thái luôn nhất quán.

```java
public class TaiKhoan {
    private double soDu;
    private int tuoiChuTK;
    private String email;

    public double getSoDu() { return soDu; }

    // Setter validate: chặn giá trị phi logic ngay tại cửa ngõ
    public void setSoDu(double soDu) {
        if (soDu < 0) {
            throw new IllegalArgumentException("So du khong duoc am");
        }
        this.soDu = soDu;
    }

    public void setTuoiChuTK(int tuoi) {
        if (tuoi < 0) {
            throw new IllegalArgumentException("Tuoi khong duoc am");
        }
        this.tuoiChuTK = tuoi;
    }

    public void setEmail(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email khong duoc rong");
        }
        this.email = email;
    }
}
```

:::tip[Dùng thực tế]
- **Setter validate**: chặn giá trị sai như giá < 0, tuổi âm, email rỗng — dữ liệu luôn hợp lệ.
- **Tính toán qua getter**: suy ra giá trị (như độ F từ độ C) thay vì lưu dư thừa và dễ lệch.
- **Ẩn cấu trúc nội bộ**: bên ngoài không biết bạn lưu dữ liệu thế nào, chỉ gọi getter/setter.
- **Đổi cài đặt mà giữ API**: refactor cách lưu trữ bên trong nhưng getter/setter không đổi → không ai bị vỡ.
:::

---

## Đóng gói là gì?

**Đóng gói** (encapsulation — che giấu dữ liệu bên trong đối tượng và chỉ cho truy cập qua phương thức được kiểm soát) là một trong những nguyên tắc cốt lõi của OOP.

Ví dụ đời thường: chiếc máy ATM. Bạn không được tự ý thò tay vào trong rút tiền — bạn phải dùng đúng quy trình (nhập thẻ, nhập mã PIN, chọn số tiền). Bên trong máy "che giấu" tiền và logic, chỉ cho bạn tương tác qua các nút bấm được kiểm soát.

Đóng gói trong Java làm tương tự: giấu thuộc tính bằng `private`, cho phép truy cập qua **getter** (hàm đọc) và **setter** (hàm ghi).

---

## private — che giấu dữ liệu

**private** (từ khóa giới hạn truy cập — chỉ cho phép dùng bên trong chính lớp đó) khiến thuộc tính không thể truy cập trực tiếp từ bên ngoài.

```java
public class TaiKhoan {
    // private: chỉ bên trong lớp TaiKhoan mới truy cập trực tiếp
    private double soDu;
    private String chuTaiKhoan;
}
```

Thử truy cập từ bên ngoài sẽ bị chặn:

```java
public class Main {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();

        // LỖI: không thể truy cập trực tiếp thuộc tính private
        // tk.soDu = 1000000; // SAI!
        // System.out.println(tk.soDu); // SAI!
    }
}
```

Việc này ngăn người khác sửa dữ liệu một cách tùy tiện, ví dụ gán số dư âm.

---

## Getter và Setter

Để cho phép truy cập có kiểm soát, ta cung cấp:

- **Getter** (hàm lấy giá trị — đọc dữ liệu): thường tên `getTenThuocTinh()`.
- **Setter** (hàm đặt giá trị — ghi dữ liệu): thường tên `setTenThuocTinh(giaTri)`.

```java
public class TaiKhoan {
    private double soDu;
    private String chuTaiKhoan;

    // Getter: cho phép ĐỌC số dư
    public double getSoDu() {
        return soDu;
    }

    // Setter: cho phép GHI số dư
    public void setSoDu(double soDu) {
        this.soDu = soDu;
    }

    public String getChuTaiKhoan() {
        return chuTaiKhoan;
    }

    public void setChuTaiKhoan(String chuTaiKhoan) {
        this.chuTaiKhoan = chuTaiKhoan;
    }
}
```

Sử dụng qua getter/setter:

```java
public class Main {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();
        tk.setChuTaiKhoan("Nguyen Van A"); // ghi qua setter
        tk.setSoDu(500000);                // ghi qua setter

        System.out.println(tk.getChuTaiKhoan()); // đọc qua getter
        System.out.println(tk.getSoDu());        // đọc qua getter
    }
}
```

Sơ đồ minh hoạ truy cập có kiểm soát: code bên ngoài không đụng thẳng field `private`, mọi thao tác đọc/ghi phải đi qua getter/setter:

```mermaid
flowchart LR
    A["Code ben ngoai<br/>(Main)"] -->|"setSoDu(gia tri)"| B["Setter<br/>validate du lieu"]
    A -->|"getSoDu()"| C["Getter<br/>doc du lieu"]
    B --> D["private soDu<br/>(bi che giau)"]
    C --> D
```

---

## Lợi ích bảo vệ dữ liệu

Tại sao phải rườm rà như vậy thay vì để `public`? Vì đóng gói mang lại:

1. **Kiểm soát**: bạn quyết định cho ai đọc, ai ghi (có thể chỉ làm getter mà không có setter → thuộc tính chỉ đọc).
2. **Bảo vệ dữ liệu**: chặn các giá trị không hợp lệ qua setter.
3. **Dễ thay đổi sau này**: nếu đổi cách lưu trữ bên trong, bên ngoài không bị ảnh hưởng vì họ chỉ dùng getter/setter.

```java
public class NhietDo {
    private double celsius; // chỉ lưu độ C bên trong

    public double getCelsius() { return celsius; }
    public void setCelsius(double c) { this.celsius = c; }

    // Getter "tính toán": độ F suy ra từ độ C, không cần lưu riêng
    public double getFahrenheit() {
        return celsius * 9 / 5 + 32;
    }
}
```

Bên ngoài chỉ thấy `getFahrenheit()`, không cần biết bên trong chỉ lưu độ C.

---

## Validation trong setter

**Validation** (kiểm tra hợp lệ — đảm bảo dữ liệu đầu vào đúng quy tắc) là lợi ích lớn nhất của setter. Bạn chặn giá trị sai ngay tại cửa ngõ.

```java
public class TaiKhoan {
    private double soDu;

    public double getSoDu() {
        return soDu;
    }

    // Setter có kiểm tra: không cho số dư âm
    public void setSoDu(double soDu) {
        if (soDu < 0) {
            // Báo lỗi rõ ràng thay vì lưu dữ liệu sai
            throw new IllegalArgumentException("So du khong duoc am");
        }
        this.soDu = soDu;
    }

    // Phương thức nghiệp vụ: rút tiền có kiểm tra
    public void rutTien(double soTien) {
        if (soTien <= 0) {
            throw new IllegalArgumentException("So tien rut phai duong");
        }
        if (soTien > soDu) {
            throw new IllegalArgumentException("So du khong du");
        }
        soDu -= soTien;
    }
}
```

Nhờ validation, dữ liệu bên trong luôn ở trạng thái hợp lệ — không bao giờ có số dư âm.

```java
public class Main {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();
        tk.setSoDu(100000);  // OK

        // tk.setSoDu(-50000); // Ném lỗi: So du khong duoc am
    }
}
```

---

## Quy ước đặt tên getter/setter

Java có quy ước (convention) chuẩn cho getter/setter, gọi là **JavaBeans**:

- Getter: `get` + tên thuộc tính viết hoa chữ đầu. Ví dụ `soDu` → `getSoDu()`.
- Setter: `set` + tên thuộc tính viết hoa chữ đầu. Ví dụ `soDu` → `setSoDu(...)`.
- Với kiểu `boolean`: getter thường dùng `is`. Ví dụ `kichHoat` → `isKichHoat()`.

```java
public class NguoiDung {
    private boolean kichHoat;

    // boolean dùng "is" thay vì "get"
    public boolean isKichHoat() {
        return kichHoat;
    }

    public void setKichHoat(boolean kichHoat) {
        this.kichHoat = kichHoat;
    }
}
```

Tuân theo quy ước này giúp nhiều thư viện và công cụ Java tự động nhận diện getter/setter.

---

## Lỗi thường gặp

- **Để thuộc tính `public`**: phá vỡ đóng gói, ai cũng sửa được tùy tiện.
- **Setter không validate**: cho phép lưu dữ liệu sai (như số dư âm).
- **Nhầm tên getter/setter** so với quy ước → công cụ tự động không nhận ra.
- **Quên `this.`** trong setter khi tên tham số trùng tên thuộc tính → gán nhầm biến với chính nó.
- **Lạm dụng getter/setter cho mọi thứ**: đôi khi nên cung cấp phương thức nghiệp vụ (như `rutTien`) thay vì để bên ngoài tự thao tác.

---

## Tóm tắt

- **Đóng gói** che giấu dữ liệu và chỉ cho truy cập qua phương thức kiểm soát.
- Dùng `private` để giấu thuộc tính khỏi bên ngoài.
- **Getter** để đọc, **setter** để ghi dữ liệu.
- Lợi ích: kiểm soát truy cập, **bảo vệ dữ liệu**, dễ thay đổi sau này.
- **Validation** trong setter chặn dữ liệu không hợp lệ ngay từ đầu.
- Tuân theo quy ước đặt tên JavaBeans (`get`/`set`/`is`).

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao để thuộc tính (field) `public` bị coi là vi phạm nguyên tắc đóng gói? Hậu quả thực tế là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Field `public` cho phép **bất kỳ đoạn code nào** ở bất kỳ đâu gán trực tiếp giá trị, không qua bước kiểm tra nào — đối tượng có thể rơi vào trạng thái phi logic (số dư âm, tuổi âm...). Ngoài ra, mọi nơi dùng lớp đó đều **phụ thuộc trực tiếp vào tên và kiểu field**; sau này muốn đổi cách lưu trữ bên trong (ví dụ đổi từ `double` sang một kiểu tiền tệ riêng) sẽ phải sửa code ở **mọi nơi** đang truy cập field đó, rất dễ vỡ (breaking change). Encapsulation (field `private` + getter/setter) tránh cả hai vấn đề này.

</details>

**2. Khi nào bạn nên chỉ cung cấp getter mà KHÔNG cung cấp setter cho một thuộc tính?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi thuộc tính đó nên là **chỉ đọc** (read-only) sau khi khởi tạo — ví dụ `id`, ngày tạo (`createdAt`), hoặc bất kỳ giá trị nào không được phép thay đổi trong suốt vòng đời đối tượng. Chỉ cung cấp getter (không setter) là cách thể hiện **tính bất biến (immutability)** cho riêng thuộc tính đó: giá trị chỉ được gán một lần trong constructor, sau đó không ai sửa được nữa, giúp tránh side-effect ngoài ý muốn.

</details>

**3. Setter có validate và setter không validate khác nhau thế nào về mặt bảo vệ tính nhất quán (invariant) của đối tượng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Setter không validate** chỉ đơn thuần gán giá trị (`this.x = x;`), tương đương với để field `public` về mặt an toàn dữ liệu — vẫn có thể gán giá trị phi logic.
- **Setter có validate** kiểm tra điều kiện hợp lệ (ví dụ `if (soDu < 0) throw ...`) **trước khi** gán, đảm bảo đối tượng **luôn ở trạng thái hợp lệ** (invariant) tại mọi thời điểm — đây mới là giá trị thật sự của encapsulation, không chỉ là "ẩn field đi cho có hình thức".

</details>

**4. Quy ước JavaBeans (`getX()`, `setX()`, `isX()` cho boolean) quan trọng vì sao, ngoài việc dễ đọc?**

<details className="qa">
<summary>Xem đáp án</summary>

Rất nhiều thư viện và framework Java (Spring, Jackson, JPA/Hibernate, JSP/JSF cũ...) dùng **reflection** để tự động dò tìm getter/setter theo đúng quy ước JavaBeans nhằm: chuyển đổi object sang JSON (`ObjectMapper`), ánh xạ dữ liệu từ form/request vào object, hoặc map cột database vào field. Nếu đặt tên sai quy ước (ví dụ `layTen()` thay vì `getTen()`), các công cụ này sẽ **không nhận diện được** thuộc tính đó, dẫn tới lỗi serialize/deserialize hoặc field bị bỏ sót.

</details>

**5. Đọc code sau — setter có hoạt động đúng không? Vì sao?**

```java
public class SanPham {
    private double gia;

    public void setGia(double gia) {
        gia = gia; // không có this.
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không hoạt động đúng** — đây là lỗi rất phổ biến. Vì tham số của setter cũng tên `gia`, dòng `gia = gia;` chỉ đang **gán tham số cục bộ cho chính nó**, không hề đụng tới field `this.gia` của đối tượng. Kết quả: field `gia` của object luôn giữ giá trị mặc định (`0.0`), dù gọi `setGia(100)` bao nhiêu lần. Cách sửa: phải viết `this.gia = gia;` để phân biệt rõ field (`this.gia`) với tham số (`gia`).

</details>

**6. Đóng gói (encapsulation) và tính bất biến (immutability) liên hệ với nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Immutability có thể xem là **hình thức đóng gói triệt để nhất**: thay vì chỉ kiểm soát việc ghi qua setter có validate, ta **loại bỏ hoàn toàn khả năng ghi** sau khi tạo — mọi field là `private final`, không có setter nào cả, muốn "thay đổi" phải tạo đối tượng mới (giống cách `record` hoạt động). Điều này triệt tiêu hoàn toàn rủi ro dữ liệu bị sửa lén từ nơi khác, đơn giản hoá việc suy luận về trạng thái đối tượng, và an toàn hơn khi chia sẻ giữa nhiều luồng (thread) vì không có ai ghi đè được.

</details>

**7. "Defensive copy" (sao chép phòng thủ) là gì và liên quan gì tới encapsulation khi field là kiểu tham chiếu như `List` hoặc `Date`?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu getter trả về **trực tiếp tham chiếu** tới một field kiểu mutable (như `List`, mảng, `Date` cũ), người gọi có thể sửa nội dung của nó từ bên ngoài mà không qua bất kỳ setter nào — phá vỡ encapsulation dù field là `private`:

```java
public List<String> getDanhSach() {
    return danhSach; // rò rỉ tham chiếu — bên ngoài sửa được list gốc!
}
```

**Defensive copy** là trả về (hoặc nhận vào ở constructor) một **bản sao độc lập** thay vì tham chiếu gốc:

```java
public List<String> getDanhSach() {
    return new ArrayList<>(danhSach); // bản sao — sửa nó không ảnh hưởng field gốc
}
```

Đây là kỹ thuật cần thiết để encapsulation thực sự hiệu quả với các kiểu dữ liệu có thể thay đổi được (mutable).

</details>

**8. Tình huống: bạn thiết kế `TaiKhoanNganHang` với field `soDu`. Vì sao nên cung cấp các phương thức nghiệp vụ như `napTien(soTien)`, `rutTien(soTien)` thay vì chỉ để `getSoDu()`/`setSoDu(giaTri)` chung chung?**

<details className="qa">
<summary>Xem đáp án</summary>

Setter chung chung như `setSoDu(giaTri)` chỉ kiểm tra được điều kiện đơn giản (ví dụ "không âm"), nhưng **không mô tả được nghiệp vụ thực tế** và dễ bị dùng sai — ai cũng có thể gọi `setSoDu(1000000)` để "hô biến" ra tiền mà không qua giao dịch thật.

Phương thức nghiệp vụ như `rutTien(soTien)` gói cả **quy tắc nghiệp vụ** vào một chỗ: kiểm tra `soTien > 0`, kiểm tra `soTien <= soDu`, rồi mới trừ tiền — thể hiện đúng ý nghĩa hành động ("rút tiền" chứ không phải "gán số dư tùy ý"), và là nơi duy nhất được phép thay đổi `soDu` nên dễ đảm bảo tính nhất quán, dễ ghi log/audit giao dịch. Đây là encapsulation ở mức nghiệp vụ, không chỉ ở mức kỹ thuật field/getter/setter.

</details>

**9. Nếu muốn lớp con truy cập trực tiếp được thuộc tính của lớp cha, nhưng vẫn giấu khỏi code bên ngoài không liên quan, bạn dùng access modifier nào? Vì sao không dùng `private` hay `public`?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **`protected`**. `private` sẽ chặn luôn cả lớp con (lớp con không thấy được thành viên `private` của lớp cha dù có kế thừa), còn `public` thì lộ ra cho mọi code bên ngoài — vi phạm mục tiêu che giấu dữ liệu ban đầu. `protected` là điểm cân bằng: cho phép lớp con (dù ở package khác) truy cập trực tiếp để tái sử dụng và mở rộng logic, nhưng vẫn chặn code không liên quan (không phải lớp con) truy cập tùy tiện từ bên ngoài.

</details>
