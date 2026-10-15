---
sidebar_position: 3
title: "3. OOP nâng cao"
---

# 3. OOP nâng cao

## 1. Vòng đời đối tượng (Object Lifecycle)

Bài học: [1. Vòng đời đối tượng (Object Lifecycle)](../../java/03-more-about-oop/1_vong-doi-doi-tuong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt "đối tượng" (object) và "tham chiếu" (reference) trong Java.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Đối tượng** (object) là vùng dữ liệu thực sự nằm trên **heap**, được tạo ra bởi `new`.
- **Tham chiếu** (reference) là biến chứa **địa chỉ** trỏ tới đối tượng đó, không phải chính đối tượng.
- Nhiều biến tham chiếu có thể cùng trỏ tới một đối tượng; sửa qua biến này sẽ thấy thay đổi ở biến kia vì cả hai cùng trỏ chung một chỗ.
- Ví dụ: `XeOto xe1 = new XeOto("do"); XeOto xe2 = xe1;` — `xe1` và `xe2` là hai tham chiếu khác nhau nhưng cùng trỏ một object.

</details>

**2. Một đối tượng được xem là "đủ điều kiện" (eligible) để Garbage Collector thu hồi khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi **không còn tham chiếu mạnh (strong reference) nào** từ một "root" (biến local đang chạy, biến `static`, thread đang sống...) trỏ tới nó. Các trường hợp phổ biến:

- Gán `null` cho biến duy nhất đang trỏ tới object.
- Biến local ra khỏi phạm vi (scope) khi phương thức kết thúc.
- Gán lại biến để trỏ sang object khác, bỏ rơi object cũ.
- Object chỉ được tham chiếu bởi các object khác cũng đang là rác (cả một "đảo" object cô lập cũng bị thu gom).

Lưu ý: object nằm trong biến `static` hoặc collection còn sống thì **không bao giờ** đủ điều kiện GC cho tới khi bị xóa khỏi đó — đây là nguyên nhân phổ biến của memory leak.

</details>

**3. Heap và Stack khác nhau thế nào trong việc lưu trữ dữ liệu Java?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Stack | Heap |
|---|---|---|
| Lưu gì | Biến cục bộ, tham chiếu, khung gọi hàm | Các đối tượng thực sự (`new`) |
| Vòng đời | Tự động dọn khi hàm return | Do Garbage Collector quản lý |
| Tốc độ | Rất nhanh | Chậm hơn stack |
| Chia sẻ giữa thread | Mỗi thread một stack riêng | Dùng chung giữa các thread |

Khi một phương thức kết thúc, các biến cục bộ (kể cả tham chiếu) trên stack bị dọn, nhưng object trên heap chỉ mất đi khi không còn ai tham chiếu tới.

</details>

**4. Vì sao Java không cho lập trình viên tự `free`/`delete` bộ nhớ như C/C++? Đánh đổi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Tự quản lý bộ nhớ dễ gây **memory leak** (quên free), **double free**, hoặc **dangling pointer** (dùng sau khi free) — những lỗi rất khó debug và có thể gây crash hoặc lỗ hổng bảo mật.
- Java giao việc này cho **Garbage Collector**, tự động phát hiện và thu hồi object không còn tham chiếu, giúp code an toàn hơn và giảm gánh nặng cho lập trình viên.
- Đánh đổi: mất quyền kiểm soát chính xác thời điểm giải phóng, và GC tốn thêm CPU/có thể gây độ trễ (pause) không dự đoán trước — đây là lý do các hệ thống hiệu năng cực cao đôi khi phải tinh chỉnh GC hoặc chọn GC phù hợp (G1, ZGC...).

</details>

**5. `finalize()` là gì và vì sao bị deprecated? Thay thế bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`finalize()` là phương thức được JVM gọi (không đảm bảo) ngay trước khi GC thu hồi object, từng dùng để "dọn dẹp" tài nguyên.

Bị deprecated (từ Java 9, dự kiến loại bỏ) vì:

- **Không đảm bảo chạy**, và nếu chạy thì không biết chạy lúc nào — tài nguyên có thể bị giữ rất lâu.
- Làm **chậm** quá trình GC vì object có `finalize()` phải qua thêm một bước xử lý đặc biệt.
- Dễ gây lỗi nếu `finalize()` "hồi sinh" object (gán lại tham chiếu) hoặc ném exception.

Thay thế: implement `AutoCloseable` và dùng khối `try-with-resources`, hoặc dùng `java.lang.ref.Cleaner` cho các trường hợp cần dọn dẹp gắn với vòng đời GC.

</details>

**6. Đọc code sau — biến `xe1` có bị lỗi khi gọi `xe1.an()` ở dòng cuối không? Giải thích.**

```java
XeOto xe1 = new XeOto("do");
XeOto xe2 = xe1;
xe1 = null;
xe2.an();
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không lỗi.** `xe1 = null` chỉ cắt đứt tham chiếu của **biến `xe1`**, không xóa đối tượng. Đối tượng `XeOto("do")` vẫn còn tồn tại trên heap vì `xe2` vẫn đang trỏ tới nó — object chỉ đủ điều kiện GC khi **không còn bất kỳ tham chiếu nào** trỏ tới, chứ không phải khi một biến cụ thể bị gán `null`. Vì vậy `xe2.an()` chạy bình thường.

</details>

**7. `System.gc()` có đảm bảo Garbage Collector chạy ngay lập tức không? Có nên gọi trong code production không?**

<details className="qa">
<summary>Xem đáp án</summary>

- `System.gc()` chỉ là một **gợi ý** (hint) cho JVM rằng "bây giờ là thời điểm tốt để chạy GC", nhưng JVM **có quyền bỏ qua** hoàn toàn.
- Không nên gọi trong code production vì: không đáng tin cậy, có thể gây một đợt "stop-the-world" tốn kém không cần thiết, làm giảm hiệu năng ứng dụng một cách khó dự đoán.
- JVM hiện đại tự quyết định thời điểm chạy GC dựa trên áp lực bộ nhớ tốt hơn nhiều so với gọi thủ công.

</details>

**8. Mô tả ngắn gọn cơ chế Generational Garbage Collection (Young Generation / Old Generation) mà JVM hiện đại dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

- JVM chia heap thành **Young Generation** (nơi object mới sinh ra, gồm Eden + hai vùng Survivor) và **Old Generation** (nơi chứa object sống lâu).
- Giả định: phần lớn object "chết trẻ" (weak generational hypothesis), nên GC quét Young Generation thường xuyên bằng **Minor GC** — nhanh vì vùng nhỏ.
- Object sống sót qua nhiều lần Minor GC sẽ được **promote** (thăng cấp) sang Old Generation.
- Old Generation ít bị quét hơn, dùng **Major/Full GC** — chậm hơn nhưng ít xảy ra.
- Các GC hiện đại như **G1**, **ZGC**, **Shenandoah** tối ưu thêm để giảm thời gian "stop-the-world".

</details>

**9. Nêu một tình huống memory leak thực tế trong Java dù đã có GC, và cách khắc phục.**

<details className="qa">
<summary>Xem đáp án</summary>

Memory leak trong Java xảy ra khi object vẫn còn tham chiếu (nên GC không thu hồi được) nhưng thực tế không còn cần dùng nữa. Ví dụ phổ biến:

- **`static` collection tích lũy dần**: thêm phần tử vào `List`/`Map` khai báo `static` mà không bao giờ xóa → object bên trong không bao giờ bị GC.
- **Listener/callback không gỡ đăng ký**: đăng ký listener vào một object sống lâu (như UI framework) mà quên `removeListener` khi không cần nữa.
- **`ThreadLocal` không `remove()`** trong môi trường thread pool (thread được tái sử dụng nên giá trị cũ vẫn còn).

Khắc phục: chủ động xóa khỏi collection/gỡ listener khi không dùng nữa, dùng `WeakReference`/`WeakHashMap` khi tham chiếu chỉ nên "giữ nếu còn ai khác cần", và luôn `remove()` `ThreadLocal` sau khi dùng xong (ví dụ trong `finally`).

</details>

**10. Bạn được giao debug một ứng dụng Java bị `OutOfMemoryError` tăng dần theo thời gian chạy. Bạn sẽ tiếp cận theo quy trình nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Xác nhận là leak thật** chứ không phải chỉ cần tăng heap (`-Xmx`) — theo dõi biểu đồ heap usage theo thời gian, nếu tăng dần không giảm sau GC thì đúng là leak.
2. **Chụp heap dump** (`jmap -dump` hoặc bật `-XX:+HeapDumpOnOutOfMemoryError`) tại thời điểm bộ nhớ cao.
3. Dùng công cụ phân tích (**Eclipse MAT**, VisualVM) để tìm **object nào chiếm nhiều bộ nhớ nhất** và xem "đường đi tới GC root" (ai đang giữ tham chiếu tới nó).
4. Tập trung vào các nghi phạm quen thuộc: `static` collection phình to, cache không giới hạn kích thước, listener/`ThreadLocal` không gỡ.
5. Sửa bằng cách xóa tham chiếu đúng lúc, hoặc dùng cache có giới hạn (LRU) / `WeakReference`.
6. Chạy lại với công cụ profiling (JFR, async-profiler) để xác nhận vấn đề đã hết trước khi deploy.

</details>

---

## 2. Kế thừa (Inheritance)

Bài học: [2. Kế thừa (Inheritance)](../../java/03-more-about-oop/2_ke-thua.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Quan hệ "is-a" của kế thừa khác gì quan hệ "has-a" của composition?**

<details className="qa">
<summary>Xem đáp án</summary>

- **"is-a" (kế thừa)**: lớp con **là một loại** của lớp cha. Ví dụ: "Chó **là một** Động vật" → `Cho extends DongVat`.
- **"has-a" (composition)**: một lớp **chứa** một đối tượng khác như thuộc tính, không phải là loại của nó. Ví dụ: "Ô tô **có một** Động cơ" → class `OTo` có field `Động cơ dongCo`.

Chọn sai quan hệ dễ dẫn tới thiết kế cứng nhắc — ví dụ không nên cho `OTo extends DongCo` vì ô tô không phải "là một" động cơ.

</details>

**2. Vì sao Java chỉ hỗ trợ kế thừa đơn (single inheritance) đối với class, mà không cho `extends` nhiều lớp cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

Để tránh **diamond problem** (vấn đề hình thoi): nếu một lớp kế thừa hai lớp cha cùng có một phương thức giống chữ ký, trình biên dịch không biết chọn cài đặt của lớp cha nào — gây nhập nhằng (ambiguity).

Java giải quyết nhu cầu "đa kế thừa hành vi" bằng **interface** — một lớp có thể `implements` nhiều interface. Từ Java 8, interface có `default method`, nhưng Java bắt buộc lớp phải override tường minh nếu hai interface có `default method` trùng chữ ký, nên vẫn tránh được nhập nhằng.

</details>

**3. Khi tạo một đối tượng của lớp con kế thừa nhiều tầng (ví dụ `Cho extends ThuCung extends DongVat`), thứ tự gọi constructor diễn ra như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Constructor luôn chạy từ **lớp gốc xuống lớp con cùng**, vì mỗi constructor bắt buộc gọi `super(...)` (tường minh hoặc ngầm định) trước khi chạy phần thân của chính nó:

```java
// Thứ tự chạy: Object() -> DongVat() -> ThuCung() -> Cho()
```

Nghĩa là `DongVat` khởi tạo xong hoàn toàn trước khi `ThuCung` bắt đầu, rồi `ThuCung` xong mới tới `Cho`. Điều này đảm bảo phần dữ liệu kế thừa từ lớp cha luôn sẵn sàng trước khi lớp con dùng tới.

</details>

**4. Nếu lớp cha KHÔNG có constructor không tham số, và lớp con không gọi `super(...)` tường minh, chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi biên dịch.** Nếu constructor của lớp con không gọi `super(...)` tường minh ở dòng đầu, Java tự động chèn `super()` (không tham số) ngầm định. Nhưng nếu lớp cha không có constructor không tham số nào (chỉ có constructor nhận tham số), lệnh `super()` ngầm định đó không tồn tại → biên dịch lỗi. Cách sửa: gọi tường minh `super(thamSo)` khớp với constructor có sẵn của lớp cha.

</details>

**5. So sánh phạm vi truy cập `private`, `protected`, `public` trong ngữ cảnh kế thừa — lớp con thấy được gì từ lớp cha?**

<details className="qa">
<summary>Xem đáp án</summary>

| Phạm vi | Lớp con cùng package | Lớp con khác package |
|---|---|---|
| `private` | Không thấy | Không thấy |
| (default/package) | Thấy | Không thấy |
| `protected` | Thấy | Thấy (qua kế thừa) |
| `public` | Thấy | Thấy |

- `private` chỉ dùng được bên trong chính lớp khai báo nó, kể cả lớp con cũng không truy cập trực tiếp được — muốn lớp con dùng thì phải để `protected` hoặc cung cấp getter/setter `public`/`protected`.
- `protected` được thiết kế riêng cho mục đích kế thừa: lớp con ở bất kỳ package nào cũng truy cập được thành viên `protected` của lớp cha.

</details>

**6. "Composition over inheritance" (ưu tiên composition hơn kế thừa) nghĩa là gì? Vì sao nguyên tắc này được khuyến nghị?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc khuyên: khi không thực sự là quan hệ "is-a" rõ ràng, nên cho một lớp **chứa** đối tượng khác (composition) thay vì kế thừa nó.

Lý do:

- Kế thừa tạo **coupling rất chặt** — sửa lớp cha có thể vô tình phá vỡ hành vi lớp con (fragile base class problem).
- Kế thừa là quan hệ cố định lúc biên dịch; composition linh hoạt hơn, có thể **đổi hành vi lúc chạy** (ví dụ thay implementation của field chứa).
- Kế thừa lộ toàn bộ API `public`/`protected` của lớp cha ra lớp con, kể cả phần không cần dùng; composition chỉ lộ ra những gì lớp bao ngoài chủ động expose.

Ví dụ: thay vì `Stack extends Vector` (kế thừa sai — Stack không nên có toàn bộ method chèn/xóa tùy tiện của Vector), nên cho `Stack` **chứa** một `Deque` bên trong và chỉ expose `push()`/`pop()`.

</details>

**7. Đọc code sau — phương thức nào của `toString()` được gọi khi in `System.out.println(cho)`, và giải thích lý do.**

```java
public class DongVat {
    @Override
    public String toString() { return "Toi la dong vat"; }
}

public class Cho extends DongVat {
    @Override
    public String toString() { return "Toi la cho"; }
}

public class Main {
    public static void main(String[] args) {
        DongVat dv = new Cho();
        System.out.println(dv);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **"Toi la cho"**. Dù biến `dv` có kiểu khai báo là `DongVat`, `println()` bên trong gọi `dv.toString()` — và vì `toString()` bị **override** (ghi đè), Java dùng **dynamic binding**: chọn phương thức theo kiểu **thực** của đối tượng (`Cho`), không phải kiểu khai báo. Đây chính là cơ chế đa hình kế thừa từ `Object.toString()`.

</details>

**8. Tình huống thiết kế: bạn cần mô hình hóa `NhanVien`, `NhanVienQuanLy` (Manager), và mỗi nhân viên có một `HopDongLaoDong` (hợp đồng lao động) riêng. Bạn sẽ dùng kế thừa ở đâu và composition ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Kế thừa** cho `NhanVienQuanLy extends NhanVien`: một quản lý **là một** nhân viên (is-a), có thêm hành vi riêng như quản lý cấp dưới.
- **Composition** cho quan hệ `NhanVien` — `HopDongLaoDong`: nhân viên **có một** hợp đồng (has-a), không phải "nhân viên là một hợp đồng". Nên cho `NhanVien` chứa field `HopDongLaoDong hopDong` thay vì kế thừa.

Nguyên tắc chọn: chỉ kế thừa khi quan hệ thực sự "is-a" và lớp con cần **toàn bộ** hành vi công khai của lớp cha; còn lại nên composition để giảm coupling.

</details>

**9. `instanceof` và ép kiểu (downcasting) dùng để làm gì trong ngữ cảnh kế thừa? Rủi ro khi lạm dụng là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
DongVat dv = new Cho();
if (dv instanceof Cho) {          // kiểm tra kiểu THỰC trước khi ép
    Cho c = (Cho) dv;             // downcasting: từ lớp cha ép xuống lớp con
    c.sua();                       // gọi được method riêng của Cho
}
```

`instanceof` kiểm tra xem đối tượng có phải kiểu cụ thể nào đó không; downcasting để truy cập các phương thức **chỉ có ở lớp con**, không có ở lớp cha. Ép kiểu sai (không kiểm tra `instanceof` trước) ném `ClassCastException` lúc chạy.

Rủi ro khi lạm dụng: nếu code thường xuyên phải `instanceof` + ép kiểu để rẽ nhánh theo từng loại lớp con, đó thường là dấu hiệu **thiết kế đa hình chưa tốt** — nên đưa hành vi đó thành một phương thức override ở lớp cha/con thay vì kiểm tra kiểu thủ công.

</details>

**10. Java 17 có tính năng `sealed class` liên quan tới kế thừa. Nó giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`sealed class` (lớp niêm phong, chính thức từ Java 17) cho phép lớp cha **giới hạn chính xác** danh sách lớp nào được phép kế thừa nó, khai báo qua từ khóa `permits`:

```java
public sealed class PhuongTien permits XeMay, MayBay { }
```

Vấn đề nó giải quyết: kế thừa thông thường cho phép **bất kỳ ai** cũng `extends` một lớp `public`, khiến tác giả lớp cha không kiểm soát được hết các lớp con có thể xuất hiện — gây khó khăn khi muốn `switch` pattern matching xử lý "đầy đủ mọi trường hợp" (exhaustiveness). Với `sealed`, compiler biết chính xác tập lớp con nên có thể kiểm tra tính đầy đủ của các nhánh xử lý.

</details>

---

## 3. Trừu tượng (Abstraction)

Bài học: [3. Trừu tượng (Abstraction)](../../java/03-more-about-oop/3_truu-tuong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `abstract class` không thể tạo đối tượng trực tiếp bằng `new`? Điều gì xảy ra nếu cố làm vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì abstract class có thể chứa **abstract method** — phương thức chỉ có tên, không có phần thân. Nếu cho phép `new` một abstract class, chương trình sẽ gọi được một phương thức không có cài đặt nào để chạy, điều này vô nghĩa và không an toàn.

Nếu cố viết `new PhuongTien()` với `PhuongTien` là abstract class, Java báo **lỗi biên dịch**: "`PhuongTien` is abstract; cannot be instantiated". Bạn chỉ có thể `new` một lớp con **cụ thể** (concrete class) đã cài đặt đầy đủ mọi abstract method.

</details>

**2. Một `abstract class` có bắt buộc mọi phương thức đều phải là `abstract` không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Một abstract class có thể trộn cả phương thức thường (có thân, dùng chung cho mọi lớp con) và abstract method (chưa có thân, bắt buộc lớp con cài đặt). Thậm chí một abstract class có thể **không có** abstract method nào — chỉ đơn giản là đánh dấu "không cho tạo trực tiếp", nhưng cách dùng phổ biến nhất vẫn là kết hợp cả hai loại, ví dụ method thường gọi abstract method bên trong (nền tảng của Template Method pattern).

</details>

**3. `abstract class` có được phép có constructor không? Nếu không thể `new` được thì constructor để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có**, abstract class được phép (và thường nên) có constructor. Constructor này không dùng để `new` trực tiếp abstract class, mà được **lớp con gọi qua `super(...)`** khi lớp con khởi tạo — dùng để thiết lập các thuộc tính chung khai báo ở lớp cha (ví dụ `ten` trong `PhuongTien`). Đây là điểm khác biệt lớn với interface — interface không có constructor vì không lưu trạng thái field thường.

</details>

**4. So sánh `default method` của interface (Java 8+) với method thường của abstract class — chúng có thay thế được nhau hoàn toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều cho phép cung cấp cài đặt sẵn để lớp con dùng lại mà không bắt buộc override. Tuy nhiên khác biệt quan trọng:

- **Method thường trong abstract class** có thể truy cập **field/thuộc tính** của lớp (`this.ten`), và abstract class có constructor để khởi tạo field đó.
- **`default method` trong interface** không có field thường để dựa vào (interface chỉ có hằng số `public static final`), nên thường chỉ gọi qua các abstract method khác của chính interface đó, không lưu trạng thái riêng.

Vì vậy không thay thế hoàn toàn nhau: cần **chia sẻ dữ liệu và code** giữa các lớp có quan hệ "is-a" → abstract class; chỉ cần chia sẻ **hành vi không phụ thuộc field riêng** → default method của interface đủ dùng.

</details>

**5. Template Method là một design pattern gắn liền với abstract class. Mô tả ý tưởng và cho ví dụ ngắn.**

<details className="qa">
<summary>Xem đáp án</summary>

**Template Method** (phương thức khuôn mẫu): lớp cha (abstract class) định nghĩa **khung/luồng xử lý chung** trong một method thường, còn các **bước chi tiết** được để trống dưới dạng abstract method cho lớp con tự điền vào.

```java
abstract class QuyTrinhPhaCafe {
    // Template method: luồng cố định, không cho lớp con đổi thứ tự
    final void phaCafe() {
        dunNuoc();
        phaTheoKieuRieng(); // bước riêng do lớp con quyết định
        rotVaoLy();
    }
    void dunNuoc() { System.out.println("Dun nuoc soi"); }
    abstract void phaTheoKieuRieng();
    void rotVaoLy() { System.out.println("Rot ra ly"); }
}
```

Lớp con (`CaPhePhin`, `CaPheMay`...) chỉ cần cài đặt `phaTheoKieuRieng()`, còn luồng tổng thể không đổi — tránh lặp code và đảm bảo mọi lớp con tuân theo đúng quy trình.

</details>

**6. Đọc code sau — dòng nào gây lỗi biên dịch và vì sao?**

```java
abstract class Hinh {
    abstract double dienTich();
}

class TamGiac extends Hinh {
    double day, cao;
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi ở khai báo `class TamGiac extends Hinh`**: `TamGiac` kế thừa `Hinh` nhưng **không cài đặt** `dienTich()`, trong khi bản thân `TamGiac` lại không được khai báo là `abstract`. Java bắt buộc: một lớp **cụ thể** (không phải abstract) kế thừa abstract class phải cài đặt **đầy đủ** mọi abstract method còn sót lại.

Cách sửa: hoặc thêm phần thân cho `dienTich()` trong `TamGiac`, hoặc khai báo `abstract class TamGiac extends Hinh` để đẩy trách nhiệm cài đặt xuống lớp con tiếp theo.

</details>

**7. Từ Java 8 trở đi, interface đã có `default method` và `static method`, ranh giới với abstract class bị mờ đi nhiều. Vậy khi nào bạn vẫn chọn abstract class thay vì interface?**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn **abstract class** khi:

- Các lớp con có **quan hệ họ hàng rõ ràng** (is-a) và cần **chia sẻ trạng thái** (field) chung, không chỉ hành vi.
- Cần **constructor** để khởi tạo dữ liệu chung bắt buộc.
- Muốn kiểm soát chặt hơn về access modifier (`protected`, `private` cho method nội bộ) — điều interface không hỗ trợ đầy đủ.

Chọn **interface** khi:

- Muốn mô tả một **khả năng** (capability) mà nhiều lớp không họ hàng đều có thể có (`Comparable`, `Runnable`).
- Cần **đa kế thừa hành vi** — một lớp implement nhiều interface, nhưng chỉ extends được một lớp cha.

Quy tắc kinh điển: "is-a và cần state chung" → abstract class; "can-do và không quan tâm state" → interface.

</details>

**8. `abstract method` có thể khai báo là `private`, `static`, hoặc `final` không? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không được**, cả ba đều mâu thuẫn với bản chất của abstract method:

- `private`: abstract method cần lớp con **override** được, mà `private` thì lớp con không nhìn thấy để override.
- `static`: method `static` gắn với lớp, không tham gia cơ chế **dynamic binding/override** — không có ý nghĩa để trừu tượng hóa.
- `final`: `final` nghĩa là **không được override**, trong khi mục đích của abstract method chính là bắt buộc lớp con phải override.

Kết hợp bất kỳ từ khóa nào ở trên với `abstract` đều gây **lỗi biên dịch**.

</details>

**9. Trừu tượng (abstraction) và đóng gói (encapsulation) là hai khái niệm hay bị nhầm lẫn. Phân biệt chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Trừu tượng (abstraction)**: tập trung vào **thiết kế ở mức khái niệm** — phơi bày "làm được gì" (what), giấu "làm thế nào" (how). Công cụ: `abstract class`, `interface`.
- **Đóng gói (encapsulation)**: tập trung vào **bảo vệ dữ liệu ở mức cài đặt** — giấu chi tiết lưu trữ bên trong đối tượng, chỉ cho truy cập qua getter/setter được kiểm soát. Công cụ: `private` + getter/setter.

Nói ngắn gọn: trừu tượng là "che giấu độ phức tạp trong thiết kế API", còn đóng gói là "che giấu dữ liệu trong cài đặt". Hai khái niệm bổ trợ nhau: một `interface` (trừu tượng tốt) vẫn có thể được cài đặt bởi một lớp có field `private` (đóng gói tốt).

</details>

---

## 4. Method Chaining (gọi chuỗi phương thức)

Bài học: [4. Method Chaining (gọi chuỗi phương thức)](../../java/03-more-about-oop/4_method-chaining.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bí quyết kỹ thuật khiến method chaining hoạt động được là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi phương thức trong chuỗi phải **trả về chính đối tượng hiện tại** bằng `return this;` (hoặc trả về một Builder). Vì kết quả trả về vẫn là cùng một đối tượng (hoặc builder) có đầy đủ các phương thức đó, ta có thể gọi tiếp phương thức khác ngay trên giá trị trả về, tạo thành chuỗi `obj.a().b().c()`.

</details>

**2. Vì sao một phương thức khai báo kiểu trả về `void` thì không thể tham gia method chaining?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `void` nghĩa là phương thức **không trả về giá trị nào**. Sau khi gọi một method `void`, biểu thức đó không còn "đối tượng" nào để gọi tiếp phương thức khác — trình biên dịch sẽ báo lỗi nếu bạn cố viết `obj.methodVoid().methodKhac()`. Muốn chaining, kiểu trả về phải là chính lớp đó (hoặc Builder/interface tương ứng).

</details>

**3. Method chaining và Builder Pattern có phải là một khái niệm không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không hoàn toàn.** Method chaining là một **kỹ thuật** (mỗi method `return this`), còn Builder Pattern là một **design pattern** ứng dụng kỹ thuật đó để giải quyết bài toán cụ thể: dựng một đối tượng phức tạp từng bước, thường qua một lớp `Builder` riêng, kết thúc bằng `build()`.

Nói cách khác: mọi Builder Pattern đều dùng method chaining, nhưng không phải mọi method chaining đều là Builder Pattern — ví dụ `StringBuilder.append()` chaining trên chính đối tượng, không có bước `build()` tách biệt.

</details>

**4. Vì sao `StringBuilder` nhanh hơn nối chuỗi bằng toán tử `+` nhiều lần trong vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

`String` trong Java là **bất biến** (immutable). Mỗi lần dùng `+` để nối, Java phải tạo ra một **chuỗi mới** hoàn toàn (sao chép lại toàn bộ nội dung cũ cộng thêm phần mới), gây lãng phí bộ nhớ và CPU nếu lặp nhiều lần.

`StringBuilder` dùng một **mảng ký tự nội bộ có thể thay đổi** (mutable buffer). Phương thức `append()` chỉ ghi thêm vào buffer đó (mở rộng khi cần), không tạo bản sao toàn bộ mỗi lần — vì vậy hiệu quả hơn nhiều khi nối chuỗi lặp lại, ví dụ trong vòng lặp `for`.

</details>

**5. Đọc code sau — vì sao dòng cuối gây lỗi biên dịch?**

```java
public class LyCaPhe {
    String noiDung = "";
    void themDuong() { noiDung += "duong"; }
    LyCaPhe themSua() { noiDung += " sua"; return this; }
}

LyCaPhe ly = new LyCaPhe();
ly.themDuong().themSua();
```

<details className="qa">
<summary>Xem đáp án</summary>

`themDuong()` khai báo kiểu trả về là `void` (không có `return this;`), nên `ly.themDuong()` không trả về giá trị nào để gọi tiếp `.themSua()` — trình biên dịch báo lỗi vì `void` không có phương thức `themSua()`. Cách sửa: đổi kiểu trả về của `themDuong()` thành `LyCaPhe` và thêm `return this;`.

</details>

**6. "Fluent API" là gì? Nêu một ví dụ trong thư viện chuẩn Java hiện đại (ngoài `StringBuilder`).**

<details className="qa">
<summary>Xem đáp án</summary>

**Fluent API** (giao diện trôi chảy) là cách thiết kế API sao cho lời gọi đọc tự nhiên như một câu văn, thường dựa trên method chaining.

Ví dụ điển hình: **Stream API** (Java 8+):

```java
List<String> ketQua = danhSach.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

Mỗi bước (`filter`, `map`) trả về một `Stream` mới để gọi tiếp bước sau, đọc rất giống mô tả tuần tự "lọc rồi biến đổi rồi thu thập".

</details>

**7. Method chaining có nhược điểm gì khi debug hoặc đọc code?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Khó đặt breakpoint/debug từng bước**: nhiều lời gọi nằm trên cùng một biểu thức, khó dừng lại kiểm tra giá trị trung gian sau mỗi bước như khi tách thành từng dòng riêng.
- **Stack trace khó đọc**: nếu một bước giữa chuỗi ném exception, thông báo lỗi có thể chỉ trỏ tới đúng một dòng dài chứa nhiều lời gọi, khó biết bước nào gây lỗi.
- **Chuỗi quá dài gây khó đọc**: nếu nhồi quá nhiều bước trên một dòng thay vì xuống dòng hợp lý, code trở nên rối mắt.

Giải pháp thực hành: xuống dòng mỗi phương thức trong chuỗi, và với logic phức tạp nên tách thành các bước rõ ràng hơn là chaining quá dài.

</details>

**8. Tình huống: bạn thiết kế `HttpRequestBuilder` dùng method chaining để cấu hình URL, header, body rồi gọi `build()`. Builder này nên mutable (tự sửa state bên trong) hay immutable (mỗi bước trả về bản sao mới)? Đánh đổi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cách đều được dùng thực tế, tùy đánh đổi:

- **Builder mutable** (mỗi method sửa field nội bộ rồi `return this;`): đơn giản, tiết kiệm bộ nhớ, là cách phổ biến nhất (giống ví dụ `Pizza.Builder` trong bài). Rủi ro: nếu builder được **tái sử dụng** hoặc chia sẻ giữa nhiều luồng (thread), việc sửa state chung có thể gây tranh chấp dữ liệu (race condition) hoặc lỗi khó lường nếu gọi `build()` nhiều lần với ý định độc lập.
- **Builder immutable** (mỗi method trả về **bản builder mới** với state đã cập nhật, không sửa builder gốc): an toàn hơn khi chia sẻ giữa nhiều thread hoặc muốn tái sử dụng một builder gốc làm "khuôn" rồi tạo nhiều biến thể khác nhau từ nó, nhưng tốn thêm bộ nhớ vì tạo nhiều đối tượng trung gian.

Với `HttpRequestBuilder` dùng trong một luồng, xây một request rồi bỏ đi — mutable đơn giản và đủ dùng. Nếu builder được giữ lại làm template dùng chung nhiều nơi, nên cân nhắc immutable để tránh side-effect ngoài ý muốn.

</details>

---

## 5. Đóng gói (Encapsulation)

Bài học: [5. Đóng gói (Encapsulation)](../../java/03-more-about-oop/5_dong-goi.md)

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

---

## 6. Interfaces

Bài học: [6. Interfaces](../../java/03-more-about-oop/6_interfaces.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Điểm khác biệt cốt lõi giữa interface và class thường là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Class thường mô tả **cả dữ liệu lẫn cài đặt cụ thể** — bạn `new` được để tạo đối tượng thật sự chạy được ngay. Interface chỉ mô tả một **hợp đồng (contract)**: liệt kê "phải làm được gì" mà (thường) không nói "làm thế nào" — không `new` trực tiếp được, phải có một lớp `implements` nó và cung cấp phần cài đặt. Nói cách khác, interface tách biệt hoàn toàn phần **khai báo hành vi** khỏi phần **cài đặt**, giúp code phụ thuộc vào abstraction thay vì cài đặt cụ thể.

</details>

**2. Vì sao một lớp Java `implements` được nhiều interface cùng lúc, nhưng chỉ `extends` được một lớp cha?**

<details className="qa">
<summary>Xem đáp án</summary>

Kế thừa nhiều lớp cha (đa kế thừa **implementation**) dễ gây nhập nhằng khi hai lớp cha có field hoặc method cùng tên với cài đặt khác nhau — Java tránh vấn đề này bằng kế thừa đơn cho class.

Interface truyền thống (trước Java 8) chỉ khai báo method **không có thân**, nên nhiều interface trùng tên method cũng không gây nhập nhằng gì — lớp implement chỉ cần viết **một** phần thân cho method đó là thỏa mãn tất cả interface cùng lúc. Từ Java 8 có `default method` (có thân), Java xử lý xung đột bằng cách **bắt buộc lớp phải override tường minh** nếu hai interface có `default method` trùng chữ ký (xem câu 4).

</details>

**3. `default method` (Java 8+) ra đời để giải quyết vấn đề gì trong thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Java 8, thêm một method mới vào interface sẽ làm **hỏng (không biên dịch được)** mọi lớp đã `implements` interface đó trước kia, vì chúng chưa cài đặt method mới. Đây là vấn đề lớn với các interface cốt lõi như `Collection`, `Iterable` được hàng triệu lớp implement trong hệ sinh thái Java.

`default method` cho phép thêm method **có sẵn phần thân** vào interface — các lớp cũ **không bắt buộc** override, tự động dùng cài đặt mặc định, vẫn biên dịch bình thường. Đây chính là cách Oracle thêm `stream()`, `forEach()` vào `Collection`/`Iterable` ở Java 8 mà không phá vỡ code cũ.

</details>

**4. Một lớp `implements` hai interface, cả hai đều có `default method` trùng tên và trùng tham số. Điều gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi biên dịch** nếu lớp không tự xử lý. Java không tự động chọn cài đặt của interface nào (tránh nhập nhằng — đây chính là "diamond problem" phiên bản default method), nên **bắt buộc** lớp implement phải **override tường minh** phương thức đó:

```java
interface A { default void hello() { System.out.println("A"); } }
interface B { default void hello() { System.out.println("B"); } }

class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // có thể gọi tường minh cài đặt của một interface cụ thể
    }
}
```

Cú pháp `TenInterface.super.method()` cho phép gọi rõ ràng cài đặt mặc định của interface nào bạn muốn.

</details>

**5. `static method` trong interface dùng để làm gì? Cho ví dụ trong thư viện chuẩn Java.**

<details className="qa">
<summary>Xem đáp án</summary>

`static method` trong interface cung cấp các **phương thức tiện ích liên quan trực tiếp** tới interface đó, gọi qua tên interface, không cần tạo đối tượng nào cả — thường dùng làm **factory method** (phương thức tạo đối tượng).

Ví dụ trong thư viện chuẩn: `List.of(1, 2, 3)`, `Comparator.comparing(NguoiDung::getTen)`, `Stream.of(...)` — đây đều là static method khai báo ngay trong interface (`List`, `Comparator`, `Stream`), giúp gom logic tạo/tiện ích liên quan về đúng chỗ interface đó thay vì để rải rác ở một lớp utility khác.

</details>

**6. Java 9 bổ sung `private method` cho interface. Mục đích của nó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`private method` trong interface (Java 9+) dùng để **tái sử dụng code chung giữa các `default method`** trong cùng interface đó, mà **không lộ ra ngoài** cho lớp implement:

```java
interface Bao {
    default void tomTat() {
        String tt = chuanBiTomTat(); // gọi private method dùng chung
        System.out.println(tt);
    }
    default void inChiTiet() {
        System.out.println(chuanBiTomTat() + " - chi tiet");
    }
    private String chuanBiTomTat() { // chỉ dùng nội bộ interface, tránh lặp code
        return "Tom tat noi dung";
    }
}
```

Trước Java 9, nếu muốn tái dùng logic chung giữa các default method, bạn buộc phải để nó là một default method khác (vô tình lộ ra `public`) — `private method` giải quyết đúng vấn đề đó.

</details>

**7. "Functional interface" là gì? Liên hệ với lambda expression như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Functional interface** (giao diện hàm) là interface chỉ có **đúng một** abstract method (có thể có thêm default/static method). Java cho phép dùng **lambda expression** hoặc **method reference** để tạo cài đặt của functional interface một cách ngắn gọn, không cần viết hẳn một lớp implement.

Ví dụ: `Runnable` (chỉ có `run()`), `Comparator<T>` (chỉ có `compare()`):

```java
Runnable r = () -> System.out.println("Chay!"); // lambda thay cho implements Runnable
Comparator<String> cmp = (a, b) -> a.length() - b.length();
```

Annotation `@FunctionalInterface` không bắt buộc nhưng nên dùng — compiler sẽ báo lỗi nếu ai đó vô tình thêm abstract method thứ hai, phá vỡ tính "functional" của interface.

</details>

**8. Đọc code sau — biến `MAX` trong interface có thể bị lớp implement gán lại giá trị khác không? Vì sao?**

```java
interface CauHinh {
    int MAX = 100;
}

class ApDung implements CauHinh {
    void thayDoi() {
        MAX = 200; // dòng này thế nào?
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi biên dịch.** Mọi biến khai báo trong interface đều **ngầm định** là `public static final` — tức là **hằng số**, dù bạn không viết tường minh các từ khóa đó. Vì `final`, giá trị chỉ được gán một lần lúc khai báo và **không thể gán lại** ở bất kỳ đâu, kể cả trong lớp implement. Dòng `MAX = 200;` sẽ báo lỗi "cannot assign a value to final variable MAX".

</details>

**9. Vì sao "lập trình theo interface" (programming to an interface) giúp việc viết unit test và mock dễ dàng hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi code nghiệp vụ phụ thuộc vào **interface** (`Repository`) thay vì lớp cụ thể (`MySqlRepository`), bạn có thể truyền vào một **cài đặt giả (mock/stub)** của interface đó khi test, mà không cần dựng database hay gọi mạng thật:

```java
class RepositoryGia implements Repository {
    public void luu(String data) { /* không làm gì, chỉ để test */ }
}

DichVuDonHang dv = new DichVuDonHang(new RepositoryGia());
```

Đây chính là nền tảng của **Dependency Injection**: constructor hoặc setter nhận vào kiểu interface, còn việc "cài đặt cụ thể nào được truyền vào" được quyết định từ bên ngoài (có thể là framework như Spring, hoặc thủ công trong test). Nếu code phụ thuộc thẳng vào lớp cụ thể, test buộc phải dùng đúng cài đặt thật đó, khó cô lập và chạy chậm hơn.

</details>

**10. So sánh nhanh: interface có thể có trạng thái (state) thực sự không? Vì sao điều này quan trọng khi migrate một class thành interface?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Interface chỉ có hằng số `public static final` (không đổi được), không có field thường để lưu trạng thái riêng cho mỗi đối tượng. Đây là khác biệt quan trọng so với abstract class (có thể có field thường + constructor).

Hệ quả khi thiết kế: nếu bạn định chuyển một `abstract class` đang lưu trạng thái chung (ví dụ bộ đếm, cache) thành `interface`, bạn **sẽ mất khả năng lưu state đó** — buộc phải đẩy trạng thái xuống từng lớp implement tự quản lý, hoặc giữ nguyên là abstract class nếu bắt buộc cần chia sẻ state.

</details>

**11. Tình huống: bạn thiết kế hệ thống thanh toán hỗ trợ nhiều cổng (Momo, VNPay, Stripe), có thể thêm cổng mới trong tương lai mà không sửa code xử lý đơn hàng. Bạn dùng interface thế nào? Đây có phải là Strategy pattern không?**

<details className="qa">
<summary>Xem đáp án</summary>

Định nghĩa một interface hợp đồng chung, ví dụ:

```java
interface CongThanhToan {
    KetQua thanhToan(DonHang don);
}

class MomoGateway implements CongThanhToan { /* cài đặt riêng cho Momo */ }
class VnPayGateway implements CongThanhToan { /* cài đặt riêng cho VNPay */ }
```

Lớp xử lý đơn hàng chỉ phụ thuộc vào `CongThanhToan` (interface), nhận cài đặt cụ thể qua constructor (Dependency Injection):

```java
class XuLyDonHang {
    private final CongThanhToan cong;
    XuLyDonHang(CongThanhToan cong) { this.cong = cong; }
    void xuLy(DonHang don) { cong.thanhToan(don); }
}
```

**Đúng, đây chính là Strategy pattern** (mẫu chiến lược): mỗi cài đặt interface là một "chiến lược" thanh toán khác nhau, có thể **hoán đổi lúc chạy** mà không đụng vào `XuLyDonHang`. Thêm cổng thanh toán mới (ví dụ Stripe) chỉ cần viết thêm một lớp `implements CongThanhToan`, không sửa code xử lý đơn hàng đã có — đúng nguyên lý Open/Closed (mở để mở rộng, đóng để sửa đổi).

</details>

---

## 7. Enums

Bài học: [7. Enums](../../java/03-more-about-oop/7_enums.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Enum "type-safe" (kiểu-an-toàn) nghĩa là gì? So với dùng hằng số `int`, lợi ích cụ thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

"Type-safe" nghĩa là **trình biên dịch kiểm tra và chặn ngay** các giá trị không hợp lệ, thay vì để lỗi trôi tới lúc chạy. Với `enum`, một biến khai báo kiểu `TrangThai` chỉ có thể nhận đúng các hằng số đã định nghĩa trong `TrangThai` — truyền nhầm một enum khác hay một số nguyên bất kỳ sẽ báo **lỗi biên dịch** ngay lập tức.

Ngược lại, dùng hằng số `int` (`NEW = 0`), biến tham số chỉ là `int` thông thường — truyền `99` hay bất kỳ số nào khác vẫn biên dịch được bình thường, lỗi logic chỉ phát hiện được lúc chạy (hoặc không phát hiện được).

</details>

**2. `EnumMap` và `EnumSet` là gì? Vì sao chúng hiệu quả hơn `HashMap`/`HashSet` thông thường khi key là enum?**

<details className="qa">
<summary>Xem đáp án</summary>

`EnumMap<K, V>` và `EnumSet<E>` là các cài đặt `Map`/`Set` chuyên biệt dành riêng cho key/phần tử kiểu `enum`. Bên trong, chúng dùng **mảng** được đánh chỉ số trực tiếp bằng `ordinal()` của từng hằng số, thay vì phải tính `hashCode()` và dò bucket như `HashMap`/`HashSet` thông thường.

Lợi ích: **nhanh hơn** (truy cập gần như O(1) thực sự qua chỉ số mảng), **tiết kiệm bộ nhớ hơn** (không cần cấu trúc bucket/entry phức tạp), và khi duyệt (`for`), phần tử luôn theo **đúng thứ tự khai báo** của enum — rất tiện cho các bài toán như đếm số lượng theo từng trạng thái.

</details>

**3. `enum` có thể `implements` interface không? Vì sao `enum` không thể `extends` một class khác?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có thể `implements` interface** — enum trong Java thường được dùng kèm interface để bắt buộc mỗi hằng số có một hành vi chung:

```java
interface CoMauSac { String maHex(); }

enum Mau implements CoMauSac {
    DO { public String maHex() { return "#FF0000"; } },
    XANH { public String maHex() { return "#00FF00"; } };
}
```

**Không thể `extends`** class khác vì mỗi `enum` trong Java **ngầm định đã kế thừa** lớp `java.lang.Enum` (để có sẵn `values()`, `ordinal()`, `name()`...). Vì Java chỉ cho kế thừa đơn (single inheritance), enum đã "dùng hết" suất kế thừa lớp cho `Enum`, nên không thể `extends` thêm lớp nào khác — nhưng vẫn `implements` được nhiều interface như class thường.

</details>

**4. Mỗi hằng số enum có thể có phần thân override riêng (constant-specific method body). Nêu ví dụ và giải thích khác gì override thông thường giữa các lớp.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
public enum PhepTinh {
    CONG { public int apDung(int a, int b) { return a + b; } },
    TRU  { public int apDung(int a, int b) { return a - b; } };

    public abstract int apDung(int a, int b); // mỗi hằng số phải cài đặt riêng
}
```

Về bản chất, mỗi hằng số enum có phần thân riêng (`{ ... }`) thực sự tạo ra một **lớp con vô danh (anonymous subclass)** của chính enum đó, override phương thức `abstract` khai báo trong enum — cơ chế giống hệt override giữa lớp cha/lớp con thông thường, chỉ khác là "lớp con" ở đây chính là từng hằng số riêng lẻ, không phải một class riêng biệt mà bạn đặt tên.

</details>

**5. So sánh `switch` statement truyền thống với `switch` expression (Java 14+) khi dùng với enum.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// switch statement cũ: cần break, dễ quên "fall-through"
switch (tt) {
    case DANG_XU_LY:
        System.out.println("Dang xu ly");
        break;
    case DA_GIAO:
        System.out.println("Da giao");
        break;
    default:
        System.out.println("Khac");
}

// switch expression mới (Java 14+): cú pháp mũi tên, TRẢ VỀ giá trị, không cần break
String ketQua = switch (tt) {
    case DANG_XU_LY -> "Dang xu ly";
    case DA_GIAO -> "Da giao";
    default -> "Khac";
};
```

`switch` expression: cú pháp `->` gọn hơn, **không có fall-through** (không cần `break`, không lo lọt case), có thể **trả về giá trị trực tiếp**, và nếu switch trên enum liệt kê **đủ mọi hằng số** thì có thể bỏ `default` — compiler sẽ báo lỗi nếu về sau bạn thêm hằng số enum mới mà quên xử lý case đó, giúp phát hiện thiếu sót sớm.

</details>

**6. Vì sao không nên dựa vào `ordinal()` để lưu enum vào database hoặc so sánh mức độ ưu tiên? Rủi ro cụ thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`ordinal()` trả về **vị trí khai báo** (bắt đầu từ 0) của hằng số trong enum — giá trị này **phụ thuộc thứ tự viết code**, không phải một định danh cố định gắn liền với ý nghĩa nghiệp vụ.

Rủi ro: nếu sau này bạn **thêm, xóa, hoặc sắp xếp lại** thứ tự các hằng số, `ordinal()` của mọi hằng số phía sau sẽ **thay đổi theo** — dữ liệu cũ đã lưu `ordinal()` trong database sẽ bị đọc sai sang một trạng thái hoàn toàn khác. Cách an toàn hơn: lưu `name()` (chuỗi tên) vào database, hoặc gán một thuộc tính riêng cố định (như mã số nghiệp vụ) cho mỗi hằng số thay vì dựa vào vị trí.

</details>

**7. Vì sao Joshua Bloch (tác giả "Effective Java") khuyến nghị dùng `enum` với một hằng số duy nhất để cài đặt Singleton pattern?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
public enum CauHinhDuyNhat {
    INSTANCE;
    void doSomething() { /* ... */ }
}
// Dùng: CauHinhDuyNhat.INSTANCE.doSomething();
```

Vì JVM **tự đảm bảo** mỗi hằng số enum chỉ được khởi tạo **đúng một lần**, an toàn tuyệt đối với đa luồng (thread-safe) mà không cần tự viết `synchronized` hay double-checked locking như cách cài Singleton truyền thống bằng class thường. Enum còn miễn nhiễm với các lỗ hổng phổ biến của Singleton kiểu cũ: không thể bị tạo thêm instance qua **reflection** (Java chặn riêng với enum) và tự động hỗ trợ **serialization** đúng đắn (không bị nhân bản instance khi deserialize).

</details>

**8. `TrangThai.valueOf("KHONG_TON_TAI")` sẽ ném ra exception gì? Làm sao xử lý an toàn khi tên có thể không hợp lệ (ví dụ đến từ input người dùng)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ném ra **`IllegalArgumentException`** nếu chuỗi truyền vào không khớp chính xác (phân biệt hoa/thường) với bất kỳ tên hằng số nào.

Cách xử lý an toàn khi giá trị đến từ nguồn không tin cậy (input người dùng, request API):

```java
try {
    TrangThai tt = TrangThai.valueOf(input.toUpperCase());
} catch (IllegalArgumentException e) {
    // xử lý giá trị không hợp lệ, ví dụ trả lỗi 400 cho client
}
```

Hoặc viết một phương thức tra cứu tùy chỉnh trả về `Optional<TrangThai>` thay vì để `valueOf` ném exception thẳng ra ngoài tầng nghiệp vụ.

</details>

**9. Tình huống: `TrangThaiDonHang` (NEW, PAID, SHIPPED, CANCELLED) cần đảm bảo chỉ được chuyển trạng thái theo đúng luồng hợp lệ (ví dụ không thể từ `SHIPPED` quay lại `NEW`). Bạn thiết kế enum này thế nào để enforce quy tắc đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Gắn logic kiểm tra chuyển trạng thái (state machine) ngay bên trong enum, thay vì để rải rác ở tầng service:

```java
public enum TrangThaiDonHang {
    NEW, PAID, SHIPPED, CANCELLED;

    public boolean coTheChuyenSang(TrangThaiDonHang tiep) {
        return switch (this) {
            case NEW -> tiep == PAID || tiep == CANCELLED;
            case PAID -> tiep == SHIPPED || tiep == CANCELLED;
            case SHIPPED -> false;   // đã giao, không chuyển đi đâu nữa
            case CANCELLED -> false; // đã hủy, kết thúc luồng
        };
    }
}

// Dùng ở tầng nghiệp vụ:
if (!donHang.getTrangThai().coTheChuyenSang(moi)) {
    throw new IllegalStateException("Chuyen trang thai khong hop le");
}
```

Cách này gom **toàn bộ quy tắc chuyển trạng thái hợp lệ vào một nơi duy nhất** (trong chính enum), tránh mỗi service tự viết `if/else` rải rác dễ sót trường hợp, và dễ mở rộng khi thêm trạng thái mới.

</details>

---

## 8. Record

Bài học: [8. Record](../../java/03-more-about-oop/8_record.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `record` (Java 16+) khác biệt cốt lõi gì so với class thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Về cú pháp, `record` là **viết tắt** — Java tự sinh constructor, accessor, `equals()`, `hashCode()`, `toString()` chỉ từ một dòng khai báo thành phần (components). Về ngữ nghĩa, `record` thể hiện rõ ràng ý định "đây là lớp chứa **dữ liệu bất biến** (immutable data carrier)": mọi thành phần ngầm `final`, không có setter, so sánh bằng `equals` dựa theo **giá trị** chứ không theo địa chỉ tham chiếu như class thường mặc định. Class thường phải tự viết tất cả những điều này thủ công nếu muốn có hành vi tương tự.

</details>

**2. Vì sao `record` không thể `extends` một class khác, nhưng vẫn `implements` interface được?**

<details className="qa">
<summary>Xem đáp án</summary>

Mọi `record` đều **ngầm định kế thừa** lớp `java.lang.Record` (tương tự cách mọi `enum` ngầm kế thừa `java.lang.Enum`), để có sẵn cơ chế `equals`/`hashCode`/`toString` dựa trên component. Vì Java chỉ hỗ trợ **kế thừa đơn**, suất `extends` đó đã dành cho `Record`, nên record không thể `extends` thêm class nào khác.

Tuy nhiên `implements` interface hoàn toàn không bị ảnh hưởng — record vẫn có thể triển khai một hay nhiều interface như class thường, ví dụ `record DiemSo(...) implements Comparable<DiemSo>` để bổ sung khả năng so sánh.

</details>

**3. Compact constructor khác gì canonical constructor thông thường của record? Khi nào cần dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Canonical constructor** là constructor đầy đủ, nhận đúng danh sách tham số theo components và tự gán field — Java sinh sẵn nếu bạn không viết, hoặc bạn có thể viết lại đầy đủ (`public DiemSo(String monHoc, double diem) { this.monHoc = monHoc; this.diem = diem; }`).
- **Compact constructor** là dạng **rút gọn** của canonical constructor: không cần liệt kê lại tham số, không cần dòng gán `this.x = x` — chỉ viết phần **kiểm tra/biến đổi giá trị** trước khi Java tự gán field ngầm ở cuối.

```java
public record DiemSo(String monHoc, double diem) {
    public DiemSo { // compact constructor: không có (...)
        if (diem < 0 || diem > 10) throw new IllegalArgumentException("Diem phai tu 0 den 10");
    }
}
```

Nên dùng compact constructor khi cần **validate** dữ liệu đầu vào hoặc **chuẩn hóa** giá trị (ví dụ `trim()` một chuỗi) mà không muốn viết lại toàn bộ constructor đầy đủ.

</details>

**4. `equals()` tự sinh của record so sánh dựa trên gì? Nếu một component là kiểu mảng (`int[]`), việc so sánh có đúng như mong đợi không?**

<details className="qa">
<summary>Xem đáp án</summary>

`equals()` tự sinh so sánh **từng component** bằng `equals()` tương ứng của kiểu dữ liệu đó (dùng `Objects.equals` cho kiểu tham chiếu, so sánh trực tiếp cho kiểu nguyên thủy).

**Vấn đề với mảng**: kiểu mảng (`int[]`, `String[]`...) trong Java **không override `equals()`** — `equals()` mặc định của mảng chỉ so sánh **địa chỉ tham chiếu**, không so sánh nội dung phần tử bên trong. Vì vậy nếu một record có component là mảng, hai record chứa hai mảng khác địa chỉ nhưng cùng nội dung sẽ bị coi là **không bằng nhau** — đây là cái bẫy phổ biến. Giải pháp: dùng `List` (như `List<Integer>`) thay cho mảng khi cần so sánh theo giá trị, vì `List.equals()` đã so sánh nội dung đúng.

</details>

**5. Record có thể có field `static` không? Có thể thêm field instance khác ngoài các components đã khai báo không?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Field `static`**: được phép, vì `static` gắn với **lớp**, không phải với từng instance dữ liệu — không mâu thuẫn với tính bất biến của record.
- **Field instance khác ngoài components**: **không được phép**. Toàn bộ trạng thái instance của record phải được thể hiện đầy đủ qua danh sách components khai báo trong `record TenRecord(...)`, đây là ràng buộc cố ý để đảm bảo `equals`/`hashCode`/`toString` tự sinh luôn phản ánh **đúng và đủ** toàn bộ dữ liệu — record không cho phép "giấu" thêm state ngầm mà các phương thức tự sinh không biết tới.

</details>

**6. Java 21 đưa "record pattern" vào `switch` để destructuring record. Nêu ví dụ và lợi ích.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
record Diem(int x, int y) {}

static String moTa(Object obj) {
    return switch (obj) {
        case Diem(int x, int y) when x == y -> "Diem tren duong cheo (" + x + ", " + y + ")";
        case Diem(int x, int y) -> "Diem thuong: x=" + x + ", y=" + y;
        default -> "Khong phai Diem";
    };
}
```

**Record pattern** (Java 21) cho phép **"bóc tách" (destructure)** trực tiếp các component của record ngay trong nhánh `case`, kết hợp được với mệnh đề `when` để thêm điều kiện lọc. Lợi ích: tránh phải viết `instanceof` rồi gọi thủ công từng accessor (`d.x()`, `d.y()`) như trước, code ngắn gọn và trực quan hơn hẳn khi xử lý dữ liệu dạng cây (nested record).

</details>

**7. Record có cho phép override phương thức accessor để thêm logic không? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

**Có.** Bạn có thể viết lại (override) accessor của một component để thêm xử lý, miễn là giữ đúng tên và kiểu trả về:

```java
public record NguoiDung(String ten) {
    // Override accessor mặc định để chuẩn hóa dữ liệu khi đọc ra
    public String ten() {
        return ten.trim();
    }
}
```

Lưu ý: override accessor **không** thay đổi giá trị field gốc được lưu bên trong (vẫn nguyên như lúc truyền vào constructor) — nó chỉ ảnh hưởng tới **những gì trả về khi gọi accessor**. Muốn chuẩn hóa cả giá trị lưu trữ, nên xử lý ngay trong **compact constructor** thay vì trong accessor.

</details>

**8. Nêu hai tình huống KHÔNG nên dùng record, và giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

- **JPA/Hibernate entity**: các entity ORM truyền thống cần **constructor không tham số**, cho phép **thay đổi trạng thái** sau khi tạo (Hibernate tự set field qua reflection/proxy để lazy-loading), và đôi khi cần **kế thừa** (`extends` entity cha) — cả ba điều này đều mâu thuẫn với bản chất bất biến, không kế thừa của record. Có thể dùng record cho **DTO/projection** đọc dữ liệu, nhưng không nên dùng làm entity chính.
- **Đối tượng cần thay đổi trạng thái liên tục** (ví dụ một bộ đếm, một session đang được cập nhật nhiều field theo thời gian): record buộc phải tạo object mới mỗi lần "đổi" dữ liệu, không phù hợp với những đối tượng có vòng đời dài và trạng thái thay đổi thường xuyên — dùng class thường với field mutable sẽ hợp lý và hiệu quả hơn.

</details>

**9. So với việc dùng Lombok `@Value`/`@Data` để giảm code lặp cho lớp dữ liệu, vì sao nhiều dự án hiện nay ưu tiên chuyển sang `record` (Java 16+)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`record` là tính năng built-in của ngôn ngữ**, không cần thêm dependency ngoài, không cần annotation processor sinh code lúc build, và **IDE hỗ trợ native** ngay từ đầu (không cần cài plugin Lombok riêng).
- Record thể hiện **rõ ràng ý định bất biến** ngay trong cú pháp ngôn ngữ (`record`), dễ nhận diện hơn annotation `@Value` chỉ là một lớp chú thích được xử lý ngầm.
- Về mặt công cụ: một số công cụ phân tích tĩnh, debugger, hoặc thư viện serialization đôi khi xử lý code sinh bởi annotation processor (Lombok) kém tường minh hơn record — vì record là cấu trúc **chính thức trong JVM/bytecode**, được các công cụ hỗ trợ đầy đủ và ổn định hơn về lâu dài.

Lombok vẫn hữu ích khi cần các tính năng record chưa hỗ trợ (như `@Builder`, hoặc mutable data class có getter/setter/`@Data`), nhưng riêng cho lớp dữ liệu bất biến, `record` thường là lựa chọn hiện đại và tiêu chuẩn hơn.

</details>

---

## 9. Nạp chồng và Ghi đè (Overloading / Overriding)

Bài học: [9. Nạp chồng và Ghi đè (Overloading / Overriding)](../../java/03-more-about-oop/9_overloading-overriding.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Tóm tắt sự khác nhau cốt lõi giữa overloading và overriding chỉ trong một câu.**

<details className="qa">
<summary>Xem đáp án</summary>

**Overloading** là nhiều phương thức **cùng tên, khác tham số** trong **cùng một lớp**, được Java chọn phiên bản lúc **biên dịch** (static binding); **overriding** là lớp con **viết lại** một phương thức **cùng tên, cùng tham số** đã có ở lớp cha, được Java chọn phiên bản lúc **chạy** dựa trên kiểu thực của đối tượng (dynamic binding) — đây là nền tảng của đa hình.

</details>

**2. Khi có nhiều overload phù hợp với một lời gọi (do autoboxing/varargs), Java ưu tiên chọn phiên bản nào trước?**

<details className="qa">
<summary>Xem đáp án</summary>

Java thử theo thứ tự ưu tiên, dừng ngay khi tìm được phiên bản khớp ở giai đoạn nào:

1. **Khớp chính xác kiểu** (exact match), không cần chuyển đổi gì.
2. **Widening primitive conversion** (mở rộng kiểu nguyên thủy, ví dụ `int` → `long` → `double`).
3. **Autoboxing/unboxing** (ví dụ `int` → `Integer`).
4. **Varargs** (`...`) — chỉ dùng khi không còn cách nào khác khớp được.

```java
void in(long x) { System.out.println("long"); }
void in(Integer x) { System.out.println("Integer"); }
void in(int... x) { System.out.println("varargs"); }

in(5); // in ra "long" — widening (int -> long) được ưu tiên hơn autoboxing và varargs
```

</details>

**3. Đọc code sau — lời gọi `xuLy(null)` có biên dịch được không? Vì sao?**

```java
void xuLy(String s) { System.out.println("String"); }
void xuLy(Object o) { System.out.println("Object"); }

xuLy(null);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Biên dịch được và in ra "String".** Khi có nhiều overload đều có thể nhận `null`, Java chọn phiên bản có tham số **cụ thể/hẹp nhất (most specific type)** — vì `String` là lớp con của `Object`, overload nhận `String` được coi là "khớp chặt hơn". Nếu hai overload không có quan hệ cha-con rõ ràng (ví dụ `xuLy(String s)` và `xuLy(Integer i)` cùng tồn tại), gọi `xuLy(null)` sẽ gây **lỗi biên dịch "ambiguous method call"** vì Java không biết chọn cái nào.

</details>

**4. "Covariant return type" (kiểu trả về hiệp biến) trong overriding là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Khi override, phương thức của lớp con được phép trả về một kiểu là **lớp con** của kiểu trả về gốc ở lớp cha, thay vì phải giữ nguyên y hệt:

```java
class DongVat {
    DongVat sinhSan() { return new DongVat(); }
}
class Cho extends DongVat {
    @Override
    Cho sinhSan() { return new Cho(); } // Cho là lớp con của DongVat -> hợp lệ
}
```

Điều này cho phép người gọi `Cho c = new Cho(); c.sinhSan()` nhận thẳng về kiểu `Cho` cụ thể hơn mà không cần ép kiểu, dù về bản chất vẫn đang override đúng phương thức của lớp cha.

</details>

**5. Một phương thức `private` ở lớp cha có bị "override" bởi lớp con nếu khai báo cùng tên, cùng tham số ở lớp con không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Phương thức `private` không tham gia cơ chế override vì lớp con **không nhìn thấy** (không kế thừa được) thành viên `private` của lớp cha. Nếu lớp con khai báo một phương thức trùng tên, trùng tham số, đó chỉ là một phương thức **hoàn toàn mới, độc lập**, tình cờ trùng tên — không liên quan gì tới phương thức `private` của lớp cha, và không có `@Override` nào áp dụng được ở đây (nếu cố thêm `@Override` sẽ báo lỗi biên dịch vì không thực sự override được gì).

</details>

**6. `@Override` không bắt buộc nhưng nên dùng. Ngoài bắt lỗi gõ nhầm tên/tham số, nó còn hữu ích khi nào với `default method` của interface?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Override` dùng được cho cả trường hợp lớp **override một `default method`** của interface (không chỉ override method của abstract/class cha):

```java
interface CoTheBay { default void bay() { System.out.println("Bay mac dinh"); } }
class Chim implements CoTheBay {
    @Override // hợp lệ: override default method của interface
    public void bay() { System.out.println("Chim vo canh de bay"); }
}
```

Lợi ích tương tự: nếu interface đổi tên `default method` hoặc đổi tham số, compiler sẽ báo lỗi ngay ở lớp implement thay vì âm thầm tạo ra một phương thức mới không liên quan.

</details>

**7. Vì sao hai overload sau gây lỗi biên dịch "erasure of method ... is the same" dù trông có vẻ khác kiểu tham số?**

```java
void xuLy(List<String> danhSach) { }
void xuLy(List<Integer> danhSach) { }
```

<details className="qa">
<summary>Xem đáp án</summary>

Vì cơ chế **type erasure** (xóa kiểu generic) của Java: generic chỉ tồn tại lúc **biên dịch** để kiểm tra kiểu, còn ở mức **bytecode chạy thực tế**, cả `List<String>` lẫn `List<Integer>` đều bị "xóa" thành cùng một kiểu thô `List`. Vì vậy hai overload này, sau khi erasure, có **chữ ký (signature) giống hệt nhau** ở tầng bytecode — Java không cho phép định nghĩa hai phương thức trùng chữ ký, nên báo lỗi biên dịch ngay, dù về mặt cú pháp nguồn chúng trông khác kiểu tham số.

</details>

**8. Constructor có thể overload được không? Có thể override được không? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Overload: có.** Một lớp có thể có nhiều constructor cùng tên lớp nhưng khác danh sách tham số — đây chính là overloading áp dụng cho constructor, rất phổ biến.
- **Override: không.** Constructor **không được kế thừa** xuống lớp con (mỗi lớp phải tự định nghĩa constructor riêng của mình, dù có thể gọi lại `super(...)` của lớp cha), nên khái niệm "ghi đè" không áp dụng được — constructor của lớp con không phải là "phiên bản viết lại" của constructor lớp cha, mà là một constructor hoàn toàn độc lập, chỉ có nghĩa vụ gọi `super(...)` để khởi tạo phần dữ liệu thừa hưởng.

</details>

**9. Đọc code sau — tại sao gọi `new Con()` lại in ra `0` thay vì `10`? Đây là một cạm bẫy kinh điển liên quan tới overriding.**

```java
class Cha {
    Cha() {
        khoiTao(); // gọi method có thể bị override, ngay trong constructor lớp cha
    }
    void khoiTao() { System.out.println("Cha khoi tao"); }
}
class Con extends Cha {
    int gia = 10;
    @Override
    void khoiTao() { System.out.println("Gia = " + gia); }
}
new Con();
```

<details className="qa">
<summary>Xem đáp án</summary>

Vì thứ tự khởi tạo: khi `new Con()` chạy, **constructor của `Cha` chạy trước** (do `super()` ngầm định luôn ở dòng đầu của constructor `Con`). Bên trong constructor `Cha`, lời gọi `khoiTao()` dùng **dynamic binding** — chọn theo kiểu **thực** của đối tượng (`Con`), nên chạy phiên bản override ở `Con`. Nhưng tại thời điểm đó, **field `gia` của `Con` chưa được khởi tạo** (phần instance field của `Con` chạy sau constructor của `Cha`), nên `gia` vẫn đang ở giá trị mặc định `0`.

Đây là lý do kinh điển vì sao **không nên gọi phương thức có thể bị override ngay trong constructor** — đối tượng lớp con lúc đó chưa hoàn tất khởi tạo, dễ đọc phải dữ liệu chưa sẵn sàng.

</details>

**10. Khi override `equals()`, quy tắc nào bạn phải tuân theo với `hashCode()`? Vi phạm quy tắc này gây hậu quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy tắc bắt buộc: **nếu hai đối tượng `equals()` trả về `true`, chúng phải có `hashCode()` giống nhau.** (Chiều ngược lại không bắt buộc — hai object có thể cùng `hashCode()` nhưng `equals()` khác nhau, gọi là "hash collision").

Vi phạm quy tắc này (override `equals()` nhưng quên override `hashCode()` tương ứng) gây lỗi khó phát hiện khi dùng các cấu trúc dựa trên hash như `HashMap`, `HashSet`: hai object "bằng nhau" theo `equals()` nhưng có `hashCode()` khác nhau sẽ bị coi là **khác phần tử**, nằm ở hai bucket khác nhau — dẫn tới `set.contains(x)` trả về `false` dù rõ ràng có một phần tử `equals` với `x` đã tồn tại trong set.

</details>

**11. Tình huống: bạn thiết kế một hàm `log(...)` cần in được nhiều kiểu dữ liệu (String, int, đối tượng tùy ý). Bạn cân nhắc viết nhiều overload `log(String)`, `log(int)`, `log(Object)`... hay dùng một phương thức generic `<T> log(T value)`? Đánh đổi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Nhiều overload**: phù hợp khi mỗi kiểu dữ liệu cần **xử lý logic khác nhau thật sự** (ví dụ format số khác format chuỗi). Rủi ro: dễ **ambiguous** khi truyền `null` hoặc kiểu không khớp chính xác overload nào (xem câu 3), và số lượng overload tăng theo số kiểu cần hỗ trợ, khó bảo trì nếu logic cốt lõi giống nhau.
- **Một phương thức generic `<T> log(T value)`**: phù hợp khi logic xử lý **giống nhau** cho mọi kiểu (ví dụ chỉ gọi `String.valueOf(value)` rồi in ra) — tránh trùng lặp code, không lo ambiguous vì chỉ có một phương thức duy nhất.

Quy tắc chọn: nếu hành vi thực sự khác nhau theo từng kiểu cụ thể (cần đặc thù hóa), dùng overload; nếu chỉ là một luồng xử lý chung áp dụng cho "kiểu bất kỳ", generic method gọn và an toàn hơn. Trong ví dụ `log`, thực tế `System.out.println()` chọn overload vì mỗi kiểu (`int`, `boolean`, `Object`...) có cách format hiển thị mặc định khác nhau đáng để tách riêng.

</details>

---

## 10. Khối khởi tạo (Initializer Block)

Bài học: [10. Khối khởi tạo (Initializer Block)](../../java/03-more-about-oop/10_initializer-block.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Instance initializer block và static initializer block khác nhau cốt lõi ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Instance initializer block** (`{ }`) chạy **mỗi lần** một đối tượng mới được `new`, ngay trước phần thân constructor — gắn với **từng instance**.
- **Static initializer block** (`static { }`) chạy **đúng một lần duy nhất**, khi lớp được **nạp (load)** vào JVM lần đầu tiên — gắn với **chính lớp**, không phụ thuộc số lượng object được tạo ra sau đó.

</details>

**2. Khi có kế thừa, thứ tự thực thi đầy đủ (static, instance, constructor) giữa lớp cha và lớp con diễn ra như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự đầy đủ khi `new` một đối tượng lớp con lần đầu tiên:

1. **Static field + static block của lớp cha** (chỉ chạy lần đầu lớp cha được nạp).
2. **Static field + static block của lớp con** (chỉ chạy lần đầu lớp con được nạp).
3. **Instance field + instance block của lớp cha.**
4. **Constructor của lớp cha** (chạy phần thân, sau khi `super()` của nó — nếu có — đã xong).
5. **Instance field + instance block của lớp con.**
6. **Constructor của lớp con.**

Quy tắc chung: **static luôn đi trước instance**, và **phần của lớp cha luôn đi trước phần tương ứng của lớp con** (cả static lẫn instance).

</details>

**3. Đọc code sau — đoán chính xác thứ tự các dòng được in ra.**

```java
public class SanPham {
    String ten = "mac dinh";
    { System.out.println("Block: ten = " + ten); }
    SanPham(String ten) {
        System.out.println("Constructor bat dau");
        this.ten = ten;
    }
}
new SanPham("Sach");
```

<details className="qa">
<summary>Xem đáp án</summary>

```
Block: ten = mac dinh
Constructor bat dau
```

Field `ten = "mac dinh"` và instance block chạy **theo đúng thứ tự xuất hiện trong code**, cả hai đều chạy **trước** phần thân constructor — nên tại thời điểm block chạy, `ten` đã có giá trị `"mac dinh"` (đã được gán ở dòng field). Constructor chạy sau cùng và mới gán `ten` thành `"Sach"`.

</details>

**4. Vì sao static initializer block KHÔNG thể truy cập biến instance? Nếu cố làm, Java báo lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Static block chạy khi **lớp được nạp vào JVM**, trước cả khi **bất kỳ đối tượng nào** của lớp đó được tạo ra — lúc này chưa hề có "instance" nào tồn tại để truy cập biến instance. Nếu cố viết:

```java
public class Vi {
    int soDu; // biến instance
    static {
        System.out.println(soDu); // LỖI
    }
}
```

Java báo **lỗi biên dịch**: "non-static variable soDu cannot be referenced from a static context" — vì static block không gắn với bất kỳ object cụ thể nào để biết lấy `soDu` của object nào.

</details>

**5. Instance initializer block khác gì so với gán giá trị trực tiếp ngay tại khai báo field (`int x = 5;`)? Chúng có tương tác với nhau không?**

<details className="qa">
<summary>Xem đáp án</summary>

Về bản chất, cả hai đều là "code khởi tạo cấp instance" và được trình biên dịch **gộp chung, chạy theo đúng thứ tự xuất hiện** trong file nguồn — field initializer chỉ là dạng viết tắt của việc gán giá trị ngay khi khai báo, còn instance block cho phép viết **logic phức tạp hơn một dòng** (vòng lặp, điều kiện, xử lý ngoại lệ...) mà cú pháp field initializer không làm được gọn gàng.

```java
int a = 1;              // field initializer
{ System.out.println(a); a = tinhToanPhucTap(); } // instance block, chạy NGAY SAU dòng trên
int b = a + 1;           // field initializer tiếp theo, chạy SAU block ở trên
```

Thứ tự chạy tuân theo đúng vị trí xuất hiện trong code, không phải "tất cả field trước rồi mới tới block".

</details>

**6. Static block đôi khi được dùng để khởi tạo dữ liệu có thể ném exception (đọc file cấu hình, parse dữ liệu...). Điều gì xảy ra nếu static block ném một exception không được bắt?**

<details className="qa">
<summary>Xem đáp án</summary>

Java sẽ bọc exception đó lại thành **`ExceptionInInitializerError`** (một `Error`, không phải `Exception` thường) và lớp sẽ **không nạp được** — mọi cố gắng sử dụng lớp đó sau này (tạo object, gọi static method) sẽ gặp **`NoClassDefFoundError`** ở những lần gọi tiếp theo, vì JVM đánh dấu lớp là "lỗi khởi tạo" và không thử nạp lại.

Vì hậu quả nghiêm trọng và khó debug (lỗi xảy ra rất sớm, trước cả `main`), nên bọc `try/catch` cẩn thận bên trong static block nếu logic có khả năng ném exception, thay vì để nó tự do lan ra ngoài.

</details>

**7. Khi nào bạn thật sự cần dùng static block thay vì chỉ gán trực tiếp `static Type x = giaTri;`?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ cần static block khi việc khởi tạo **không thể gói gọn trong một biểu thức đơn giản**, ví dụ:

- Cần **vòng lặp hoặc điều kiện** để dựng dữ liệu (ví dụ dựng một `Map` tra cứu có hàng chục entry).
- Cần **bắt exception** trong lúc khởi tạo (đọc file, parse cấu hình).
- Cần khởi tạo **nhiều static field có phụ thuộc lẫn nhau** theo một trình tự logic phức tạp.

Nếu chỉ là gán một giá trị đơn giản (`static int MAX = 100;`), không cần static block — gán trực tiếp gọn hơn nhiều và có tác dụng tương đương.

</details>

**8. "Double brace initialization" (khởi tạo hai lớp ngoặc `{{ }}`) là một kỹ thuật dùng instance initializer block của anonymous class để khởi tạo collection gọn gàng. Vì sao kỹ thuật này bị khuyến cáo tránh dùng trong thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// "Double brace": {} ngoài tạo anonymous subclass, {} trong là instance block
List<String> ds = new ArrayList<String>() {{
    add("a"); add("b");
}};
```

Kỹ thuật này thực chất tạo ra một **lớp con vô danh (anonymous subclass)** của `ArrayList` chỉ để chạy instance block bên trong. Vấn đề:

- Mỗi lần dùng, JVM phải sinh ra một **class file mới** — tốn bộ nhớ metaspace không cần thiết cho việc đơn giản là khởi tạo dữ liệu.
- Nếu class đó là **non-static inner class** trong ngữ cảnh có instance bao ngoài, nó **giữ tham chiếu ngầm tới outer instance**, dễ gây **memory leak** nếu list được giữ lâu dài trong khi outer object lẽ ra phải bị GC.
- `equals()`/`serialization` có thể ứng xử khác vì thực chất đây là một **subclass**, không phải `ArrayList` gốc.

Thay thế hiện đại, gọn và an toàn hơn nhiều: `List.of("a", "b")` nếu chỉ cần danh sách bất biến, hoặc `new ArrayList<>(List.of("a", "b"))` nếu cần một list có thể sửa đổi (mutable) sau đó — thay vì double brace initialization.

</details>

---

## 11. Static vs Dynamic Binding

Bài học: [11. Static vs Dynamic Binding](../../java/03-more-about-oop/11_static-vs-dynamic-binding.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Định nghĩa ngắn gọn: binding là gì, và static binding khác dynamic binding ở điểm mấu chốt nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Binding** là việc Java quyết định lời gọi phương thức sẽ chạy phần thân code nào. **Static binding** quyết định lúc **biên dịch**, dựa trên **kiểu khai báo** của biến (áp dụng cho overloading, `static`, `final`, `private`). **Dynamic binding** quyết định lúc **chạy**, dựa trên **kiểu thực** của đối tượng (áp dụng cho method bị override) — đây chính là cơ chế làm nên tính đa hình.

</details>

**2. Vì sao phương thức `static` dùng static binding? Gọi `dv.loai()` (với `dv` là biến kiểu cha trỏ tới object con) có phải là polymorphism không?**

<details className="qa">
<summary>Xem đáp án</summary>

Method `static` gắn liền với **lớp**, không gắn với từng object cụ thể — nó không có khái niệm "đối tượng thực đang gọi", nên không có cơ sở để chọn theo kiểu thực lúc chạy. Java xử lý nó hoàn toàn dựa trên **kiểu khai báo** biết được ngay lúc biên dịch.

**Không phải polymorphism.** Nếu lớp con khai báo lại một `static` method cùng tên, đó gọi là **method hiding** (che khuất), không phải overriding — gọi qua biến kiểu cha (`dv.loai()`) luôn chạy phiên bản `static` của **lớp khai báo của biến** (`DongVat`), bất kể object thực tế là gì.

</details>

**3. Field (thuộc tính) có tham gia dynamic binding giống method bị override không? Đọc code sau và cho biết kết quả.**

```java
class DongVat { String loai = "Dong vat"; }
class Cho extends DongVat { String loai = "Cho"; }

DongVat dv = new Cho();
System.out.println(dv.loai);
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **"Dong vat"**. Đây là điểm rất hay bị nhầm: **field không bao giờ tham gia dynamic binding**, kể cả khi bị "che" (field hiding) bởi field cùng tên ở lớp con. Truy cập field luôn dựa trên **kiểu khai báo** của biến, không phải kiểu thực của object — khác hẳn với method bị override (dùng dynamic binding). Chỉ có method instance bị override mới hưởng cơ chế đa hình; field thì không.

</details>

**4. Vì sao phương thức `private` không tham gia dynamic binding?**

<details className="qa">
<summary>Xem đáp án</summary>

Phương thức `private` **chỉ nhìn thấy được bên trong chính lớp khai báo nó** — lớp con hoàn toàn không biết tới sự tồn tại của nó (không kế thừa được), nên không thể "override" theo đúng nghĩa. Nếu lớp con khai báo một method trùng tên, trùng tham số, đó chỉ là một method **hoàn toàn mới và độc lập**, không liên quan gì tới method `private` của lớp cha — vì vậy không có gì để "chọn lúc chạy" cả, mọi lời gọi bên trong lớp cha tới method `private` của chính nó luôn cố định (static binding).

</details>

**5. Bên trong JVM, dynamic binding cho method override được cài đặt bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

JVM dùng cơ chế **virtual method table** (thường gọi là **vtable**) — mỗi lớp có một bảng ánh xạ từ "chữ ký phương thức" sang "địa chỉ cài đặt thực tế" của lớp đó. Khi gọi một method có thể bị override, JVM không tra cứu theo kiểu khai báo mà lấy vtable **của kiểu thực (runtime class)** của object, rồi tra trong bảng đó để tìm đúng cài đặt cần chạy — đây gọi là **invokevirtual** trong bytecode. Method `static`/`private`/`final` dùng lệnh bytecode khác (`invokestatic`, `invokespecial`) — được giải quyết thẳng lúc biên dịch, không cần tra vtable lúc chạy, nên nhanh hơn.

</details>

**6. Constructor tham gia loại binding nào — static hay dynamic? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

**Static binding.** Khi viết `new Cho()`, trình biên dịch biết **chính xác** constructor nào sẽ chạy ngay tại thời điểm biên dịch, dựa vào **kiểu được chỉ định tường minh sau từ khóa `new`** — không có khái niệm "kiểu thực khác với kiểu khai báo" ở đây như với biến tham chiếu, vì bản thân câu lệnh `new` chính là nơi xác định kiểu cụ thể sẽ được tạo.

</details>

**7. Từ khóa `final` trên một method ảnh hưởng thế nào tới binding, và vì sao điều đó có thể giúp JVM tối ưu hiệu năng?**

<details className="qa">
<summary>Xem đáp án</summary>

Method `final` **không thể bị override**, nên Java biết chắc chắn ngay lúc biên dịch — không có lớp con nào có thể thay đổi cài đặt của nó — vì vậy nó dùng **static binding** giống `private`/`static`.

Về hiệu năng: vì JVM (cụ thể là JIT compiler) biết chắc method `final` chỉ có **đúng một** cài đặt khả dĩ, nó có thể **inline** (chèn thẳng phần thân method vào nơi gọi) một cách an toàn mà không cần lo về khả năng bị ghi đè khác đi lúc chạy — giúp tránh chi phí tra vtable và mở ra thêm cơ hội tối ưu hóa. Với method thông thường có thể bị override, JIT vẫn có kỹ thuật tối ưu riêng (như "monomorphic inline caching"), nhưng `final` cho một đảm bảo chắc chắn hơn ngay từ đầu.

</details>

**8. Đọc code sau — biến `pt` kiểu `PhuongTien` gọi `dung` (biến `static`) qua instance. Kết quả in ra là gì, và vì sao cách viết này dễ gây hiểu nhầm?**

```java
class PhuongTien {
    static int soBanh = 4;
}
class XeMay extends PhuongTien {
    static int soBanh = 2;
}

PhuongTien pt = new XeMay();
System.out.println(pt.soBanh);
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`4`**. Field `static` cũng dùng **static binding theo kiểu khai báo** (`PhuongTien`), y hệt method `static` — hoàn toàn không liên quan tới object thực (`XeMay`) đang được `pt` trỏ tới.

Cách viết `pt.soBanh` (truy cập field/method `static` qua một **biến instance**) rất dễ gây hiểu lầm rằng nó "đa hình" giống method override, trong khi thực chất Java chỉ đang nhìn vào **kiểu khai báo** để tra cứu — nhiều IDE và linter (như trình cảnh báo của IntelliJ) cố ý **cảnh báo** kiểu truy cập này và gợi ý viết lại thành `PhuongTien.soBanh` cho rõ ràng.

</details>

**9. Tình huống: bạn đang refactor một codebase cũ có nhiều chỗ gọi method `static` qua biến instance (ví dụ `obj.utilMethod()` dù `utilMethod` là `static`), gây hiểu nhầm là polymorphism. Bạn sẽ làm gì để code rõ ràng và an toàn hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

1. Dùng IDE (IntelliJ/Eclipse đều có sẵn inspection cho việc này) để tìm tất cả chỗ gọi method `static` qua instance, rồi **đổi thành gọi qua tên lớp** (`TenLop.method()`) — không thay đổi hành vi chạy, chỉ làm rõ ràng ý định.
2. Rà lại xem có chỗ nào **cố tình dựa vào** hành vi "gọi qua instance nhưng chạy theo kiểu khai báo" hay không (rất hiếm khi là chủ đích) — nếu có, nên viết comment giải thích rõ, tránh gây bẫy cho người đọc sau.
3. Nếu ý định thực sự là muốn hành vi **đa hình** (khác nhau theo từng lớp con), method đó **không nên là `static`** — cần chuyển thành method instance thông thường (bỏ `static`, dùng `@Override`) để tận dụng đúng dynamic binding.
4. Thêm bật cảnh báo linter cho quy tắc "static method access via instance reference" để ngăn lỗi tương tự tái diễn trong tương lai.

</details>

**10. Nêu "câu thần chú" tóm tắt toàn bộ chủ đề static vs dynamic binding và giải thích ý nghĩa từng vế.**

<details className="qa">
<summary>Xem đáp án</summary>

> **"Kiểu khai báo quyết định gọi được method nào; kiểu thực quyết định chạy phần thân nào."**

- **Vế đầu** (kiểu khai báo quyết định gọi được gì): trình biên dịch chỉ cho phép gọi những method/field **tồn tại trong kiểu khai báo** của biến — dù object thực tế có thêm method riêng, bạn không gọi được nếu biến khai báo kiểu cha không có method đó (trừ khi ép kiểu xuống lớp con).
- **Vế sau** (kiểu thực quyết định chạy phần thân nào): với các method **bị override**, một khi đã gọi được (thỏa vế đầu), JVM sẽ chạy đúng phần thân của **kiểu thực** của object tại thời điểm chạy — đây chính là dynamic binding, nền tảng của đa hình.

</details>

---

## 12. Pass by Value / Pass by Reference

Bài học: [12. Pass by Value / Pass by Reference](../../java/03-more-about-oop/12_pass-by-value-reference.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Java là pass by value hay pass by reference? "Giá trị của tham chiếu" (value of the reference) được truyền có nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Java **luôn luôn** là **pass by value**, không có ngoại lệ. Với kiểu nguyên thủy, giá trị được sao chép trực tiếp. Với đối tượng, biến không chứa chính đối tượng mà chứa **tham chiếu** (địa chỉ trỏ tới object trên heap) — khi truyền vào hàm, Java sao chép **giá trị của địa chỉ đó** (một bản sao tham chiếu), chứ không truyền thẳng biến gốc. Tham số trong hàm và biến gốc là **hai biến tham chiếu độc lập**, chỉ tình cờ cùng trỏ tới một object — đây là lý do sửa field qua tham số vẫn ảnh hưởng object gốc, nhưng gán lại tham số thì không.

</details>

**2. Đọc code sau — vì sao hàm `swap` không hoán đổi được `x` và `y`? Viết một cách khác để thực sự hoán đổi được giá trị hai biến ngoài `main`.**

```java
static void swap(int a, int b) {
    int tmp = a; a = b; b = tmp;
}
int x = 1, y = 2;
swap(x, y);
```

<details className="qa">
<summary>Xem đáp án</summary>

`swap` chỉ nhận được **bản sao giá trị** của `x` và `y` qua `a`, `b` — hoán đổi `a`/`b` bên trong chỉ ảnh hưởng bản sao, không đụng gì tới `x`, `y` bên ngoài. Vì Java không có pass by reference, không thể viết một hàm `swap(int a, int b)` hoạt động trực tiếp trên hai biến `int` độc lập.

Cách thực sự hoán đổi được, ví dụ trả về kết quả qua một mảng hoặc một object bọc:

```java
static int[] swap(int a, int b) {
    return new int[]{b, a}; // trả về MỚI, người gọi tự gán lại
}
int[] ketQua = swap(x, y);
x = ketQua[0];
y = ketQua[1];
```

</details>

**3. Vì sao nhiều lập trình viên mới nhầm Java là "pass by reference" khi truyền đối tượng? "Bằng chứng" quyết định để khẳng định Java vẫn là pass by value là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhầm lẫn xảy ra vì khi sửa **field** của object qua tham số (`u.ten = "moi"`), thay đổi đó **thấy được** ở biến gốc bên ngoài — trông giống hệt hành vi pass by reference của các ngôn ngữ khác.

**Bằng chứng quyết định**: thử **gán lại chính tham số** đó cho một object mới ngay trong hàm (`u = new NguoiDung(...)`). Nếu là pass by reference thật, biến gốc bên ngoài phải đổi theo. Nhưng thực tế biến gốc **không hề đổi** — vì tham số chỉ là **bản sao tham chiếu**, gán lại bản sao đó không ảnh hưởng gì tới biến gốc đang giữ tham chiếu khác. Đây chính là phép thử phân biệt dứt khoát hai khái niệm.

</details>

**4. Tính bất biến (immutable) của `String` ảnh hưởng thế nào tới việc truyền tham số? So sánh với truyền một `StringBuilder` (mutable) vào hàm.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
static void noiThemString(String s) { s = s + " them"; }       // KHÔNG ảnh hưởng biến gốc
static void noiThemBuilder(StringBuilder sb) { sb.append(" them"); } // CÓ ảnh hưởng biến gốc

String ten = "Java";
noiThemString(ten);
System.out.println(ten); // "Java" — không đổi

StringBuilder sb = new StringBuilder("Java");
noiThemBuilder(sb);
System.out.println(sb); // "Java them" — đã đổi!
```

Với `String`, phép `+` **luôn tạo chuỗi mới**, rồi gán chuỗi mới đó cho **bản sao tham chiếu** `s` — không đụng gì tới `ten` gốc. Với `StringBuilder` (mutable), gọi `append()` **sửa trực tiếp nội dung bên trong** object mà cả `sb` (tham số) và biến gốc cùng trỏ tới — nên thay đổi thấy được ở ngoài. Bài học: khả năng "hàm có sửa được nội dung nhìn thấy từ ngoài hay không" phụ thuộc vào **object đó có mutable hay không**, chứ không phải do Java đổi cơ chế truyền tham số.

</details>

**5. Đọc code sau — dòng nào ảnh hưởng tới `list` gốc, dòng nào không?**

```java
static void themPhanTu(List<String> ds) { ds.add("moi"); }
static void ganLaiList(List<String> ds) { ds = new ArrayList<>(); ds.add("khac"); }

List<String> list = new ArrayList<>(List.of("a", "b"));
themPhanTu(list);
System.out.println(list); // ?
ganLaiList(list);
System.out.println(list); // ?
```

<details className="qa">
<summary>Xem đáp án</summary>

```
[a, b, moi]
[a, b, moi]
```

- `themPhanTu(list)`: `ds.add("moi")` gọi phương thức **sửa nội dung** của chính object `ArrayList` mà cả `ds` và `list` cùng trỏ tới → **có** ảnh hưởng, list gốc có thêm phần tử.
- `ganLaiList(list)`: `ds = new ArrayList<>()` chỉ **gán lại bản sao tham chiếu** `ds` để trỏ sang một list hoàn toàn mới — `list` gốc vẫn trỏ tới list cũ, không hề đổi. Thao tác `add("khac")` sau đó chỉ tác động lên list mới bị bỏ rơi, không ai nhìn thấy từ bên ngoài hàm.

</details>

**6. Wrapper class như `Integer`, `Long` có bất biến không? Truyền một `Integer` vào hàm rồi cố "tăng" giá trị bên trong hàm có ảnh hưởng biến gốc không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có, wrapper class bất biến** — một khi tạo ra, giá trị bên trong `Integer`/`Long`/`Double`... không thể thay đổi.

```java
static void tang(Integer n) {
    n = n + 1; // tạo một Integer MỚI (do unboxing rồi autoboxing lại), gán cho bản sao tham chiếu
}
Integer x = 5;
tang(x);
System.out.println(x); // 5 — không đổi
```

Phép `n + 1` unbox `n` thành `int`, cộng thêm 1, rồi autobox kết quả thành một object `Integer` **mới**, gán cho tham số `n` — hoàn toàn không có "setter" nào để sửa giá trị bên trong object `Integer` gốc. Kết hợp với việc gán lại tham số vô hại (câu 3), biến `x` gốc không bao giờ đổi.

</details>

**7. Java không có tham số kiểu `out`/`ref` như C#. Nếu cần một hàm "trả về nhiều giá trị" (ví dụ vừa lấy thương vừa lấy số dư của phép chia), bạn giải quyết thế nào trong Java?**

<details className="qa">
<summary>Xem đáp án</summary>

Cách thành ngữ (idiomatic) nhất trong Java hiện đại: gói nhiều giá trị vào **một `record`** rồi trả về:

```java
record KetQuaChia(int thuong, int du) {}

static KetQuaChia chia(int a, int b) {
    return new KetQuaChia(a / b, a % b);
}

KetQuaChia kq = chia(17, 5);
System.out.println(kq.thuong() + " " + kq.du()); // 3 2
```

Các cách khác ít khuyến khích hơn: trả về mảng (`int[]{thuong, du}` — mất tên ý nghĩa, dễ nhầm chỉ số), hoặc dùng một object mảng một phần tử làm "con trỏ giả" để mô phỏng tham số `out` (`int[] ketQua = new int[1]; hamGanVao(ketQua);`) — cách này hoạt động vì mảng là object nên sửa phần tử bên trong ảnh hưởng ra ngoài, nhưng thường bị coi là code khó đọc, chỉ nên dùng `record`/class DTO là chuẩn mực.

</details>

**8. So với các ngôn ngữ có pass by reference thật sự (ví dụ tham số `ref`/`out` trong C#, hay tham chiếu `&` trong C++), Java khác biệt cơ bản ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong C#/C++, khi truyền bằng tham chiếu thật (`ref`/`&`), tham số bên trong hàm và biến bên ngoài là **CÙNG MỘT Ô NHỚ** — gán lại giá trị cho tham số (kể cả với kiểu nguyên thủy) sẽ **ảnh hưởng trực tiếp** biến gốc, y hệt viết vào chính biến đó.

```csharp
// C#: ref cho phép gán lại và biến gốc đổi theo
void TangC#(ref int x) { x = x + 1; }
int a = 5;
TangC#(ref a);
// a bây giờ là 6 — pass by reference THẬT
```

Java **không có** khái niệm này ở bất kỳ đâu — luôn tạo bản sao (giá trị nguyên thủy hoặc giá trị tham chiếu) trước khi đưa vào hàm, nên gán lại tham số **không bao giờ** ảnh hưởng biến gốc, dù là kiểu nguyên thủy hay đối tượng.

</details>

**9. Truyền một `List` vào constructor rồi lưu trực tiếp tham chiếu đó làm field (`this.danhSach = ds;`) có an toàn không? Vì sao cần "defensive copy"?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không hoàn toàn an toàn.** Vì Java truyền theo giá trị của tham chiếu, `this.danhSach` sau khi gán sẽ **cùng trỏ** tới list gốc mà người gọi constructor đang giữ. Nếu người gọi tiếp tục sửa list đó **từ bên ngoài** sau khi tạo object, field `danhSach` bên trong object cũng bị thay đổi theo — dù object đó có thể được thiết kế để **bất biến**.

```java
class GioHang {
    private final List<String> danhSach;
    GioHang(List<String> ds) {
        this.danhSach = new ArrayList<>(ds); // defensive copy: bản sao độc lập
    }
}
```

**Defensive copy** (sao chép phòng thủ) là tạo một **bản sao mới** ngay tại constructor (hoặc getter) thay vì giữ nguyên tham chiếu được truyền vào — đảm bảo object không bị "sửa lén" từ bên ngoài thông qua tham chiếu dùng chung, giữ đúng tính bất biến/toàn vẹn dữ liệu mà object dự định cung cấp.

</details>

**10. Đọc code sau — mảng (array) trong Java có phải là object không? Dòng nào ảnh hưởng mảng gốc, dòng nào không?**

```java
static void suaPhanTu(int[] arr) { arr[0] = 999; }
static void ganLaiMang(int[] arr) { arr = new int[]{1, 2, 3}; }

int[] mang = {10, 20, 30};
suaPhanTu(mang);
System.out.println(mang[0]); // ?
ganLaiMang(mang);
System.out.println(mang[0]); // ?
```

<details className="qa">
<summary>Xem đáp án</summary>

```
999
999
```

**Mảng trong Java là object** (nằm trên heap, biến mảng chỉ là tham chiếu tới nó) — tuân theo đúng quy tắc pass by value dành cho đối tượng:

- `suaPhanTu(mang)`: `arr[0] = 999` sửa **phần tử bên trong** mảng mà cả `arr` và `mang` cùng trỏ tới → **ảnh hưởng** mảng gốc, giống hệt việc sửa field của một object.
- `ganLaiMang(mang)`: `arr = new int[]{...}` chỉ gán lại **bản sao tham chiếu** `arr` để trỏ sang mảng hoàn toàn mới → **không ảnh hưởng** `mang` gốc, `mang` vẫn trỏ mảng cũ đã bị sửa phần tử `[0]` thành `999` ở bước trước.

</details>
