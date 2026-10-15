---
sidebar_position: 1
title: "1. Học cơ bản"
---

# 1. Học cơ bản

## 1. Cú pháp cơ bản

Bài học: [1. Cú pháp cơ bản](../../java/01-learn-the-basics/1_cu-phap-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao trong Java, tất cả biến và hàm đều phải khai báo bên trong một `class`, không thể tồn tại "trôi nổi" như ở một số ngôn ngữ khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Java là ngôn ngữ hướng đối tượng thuần túy (mọi thứ xoay quanh **class**), nên trình biên dịch (compiler) yêu cầu mọi thành phần đều thuộc về một class cụ thể vì các lý do:

- **Không gian tên (namespace)**: class đóng vai trò như một "hộp chứa" giúp phân biệt các hàm/biến trùng tên ở nơi khác nhau (ví dụ `Car.start()` khác `Computer.start()`).
- **Đơn vị nạp của JVM**: khi chạy, JVM nạp (load) chương trình theo từng class — mỗi file `.class` tương ứng một class; JVM không có cơ chế nạp một hàm "tự do" không thuộc class nào.
- **Tính nhất quán hướng đối tượng**: ép buộc tư duy đóng gói dữ liệu và hành vi cùng nhau ngay từ đầu, tránh code rải rác khó bảo trì.

Một số ngôn ngữ khác (Python, JavaScript, C) cho phép hàm/biến toàn cục vì chúng không bắt buộc mô hình hướng đối tượng.

</details>

**2. Quy tắc về tên file `.java` so với tên class `public` bên trong là gì? Điều gì xảy ra nếu vi phạm quy tắc này?**

<details className="qa">
<summary>Xem đáp án</summary>

- Một file `.java` có thể chứa nhiều class, nhưng **tối đa một class `public`**.
- Nếu file có một class `public`, **tên file bắt buộc trùng chính xác** (kể cả chữ hoa/thường) với tên class đó.

```java
// File: HelloWorld.java
public class HelloWorld {   // OK, tên class trùng tên file
    // ...
}
```

Nếu đặt sai — ví dụ class là `HelloWorld` nhưng file lưu thành `hello.java` — trình biên dịch `javac` sẽ báo lỗi dạng `class HelloWorld is public, should be declared in a file named HelloWorld.java`.

Nếu file không có class nào là `public` (chỉ có class mặc định/package-private), tên file không bị ràng buộc phải trùng tên class.

</details>

**3. Phân biệt `System.out.println` với `System.out.print`. Ba loại comment trong Java khác nhau ở điểm nào và khi nào nên dùng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `System.out.println(...)` — in ra rồi **tự động xuống dòng**.
- `System.out.print(...)` — in ra nhưng **giữ nguyên con trỏ trên cùng dòng**, lần in tiếp theo nối ngay sau.

Ba loại comment:

| Loại | Cú pháp | Khi dùng |
|------|---------|----------|
| Một dòng | `// nội dung` | Ghi chú ngắn cho một dòng code |
| Nhiều dòng | `/* ... */` | Ghi chú dài, tạm vô hiệu hóa (comment out) một đoạn code |
| Tài liệu (Javadoc) | `/** ... */` | Mô tả class/method để công cụ `javadoc` sinh tài liệu API tự động |

Javadoc thường đặt ngay trước khai báo class/method, có thể chứa các thẻ như `@param`, `@return`, `@author` để công cụ đọc và xuất ra trang tài liệu.

</details>

**4. Vì sao Java bắt buộc kết thúc mỗi câu lệnh bằng dấu `;`, trong khi một số ngôn ngữ như Python lại không cần? Điều này liên quan thế nào đến cách trình biên dịch hoạt động?**

<details className="qa">
<summary>Xem đáp án</summary>

- Python dùng xuống dòng và thụt lề làm ranh giới câu lệnh/khối lệnh — trình thông dịch dựa vào cấu trúc dòng để hiểu code.
- Java (giống C/C++) coi khoảng trắng và xuống dòng là **không có ý nghĩa cú pháp**; nhiều câu lệnh có thể viết trên cùng một dòng hoặc một câu lệnh trải dài nhiều dòng. Vì vậy `javac` cần một ký hiệu tường minh để biết "câu lệnh kết thúc ở đây" — đó là dấu `;`.

```java
int a = 1; int b = 2; // hai câu lệnh trên cùng một dòng — hợp lệ vì có dấu ;
```

Thiếu `;`, compiler báo lỗi `';' expected` vì nó không xác định được ranh giới câu lệnh.

</details>

**5. Đoạn code dưới đây in ra gì?**

```java
public class Demo {
    public static void main(String[] args) {
        System.out.print("Ket qua: ");
        System.out.print(5);
        System.out.println(5);
        System.out.println("Xong");
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Output:

```
Ket qua: 55
Xong
```

Giải thích: `print` không xuống dòng nên `"Ket qua: "`, `5` (từ `print`) và `5` (từ `println`) nối liền nhau trên cùng một dòng thành `Ket qua: 55`; `println` in xong số `5` đó rồi mới xuống dòng. Câu lệnh `println("Xong")` in tiếp ở dòng kế.

</details>

**6. Đoạn code sau có biên dịch được không? Nếu không, chỉ ra lỗi và cách sửa.**

```java
public class Demo {
    public static void main(String[] args) {
        int diem = 10
        System.out.println("Diem: " + diem);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không biên dịch được.** Lỗi: thiếu dấu chấm phẩy `;` sau `int diem = 10`. Compiler báo `';' expected` tại vị trí đó.

Sửa lại:

```java
public class Demo {
    public static void main(String[] args) {
        int diem = 10;
        System.out.println("Diem: " + diem);
    }
}
```

Đây là lỗi cú pháp phổ biến nhất với người mới học Java.

</details>

**7. Chữ ký `public static void main(String[] args)` có ý nghĩa gì ở từng từ khóa? Nếu đổi thành `public void main(String[] args)` (bỏ `static`), chương trình có chạy được không?**

<details className="qa">
<summary>Xem đáp án</summary>

- `public` — JVM (gọi từ bên ngoài class) phải truy cập được hàm này.
- `static` — hàm chạy được mà không cần tạo đối tượng (instance) của class trước; JVM gọi thẳng `main` khi khởi động chương trình, lúc đó chưa có đối tượng nào tồn tại.
- `void` — không trả về giá trị.
- `main` — tên cố định do đặc tả Java quy định, JVM chỉ tìm đúng tên này.
- `String[] args` — mảng chứa các tham số truyền từ dòng lệnh.

**Nếu bỏ `static`:** chương trình **không chạy được**. JVM báo lỗi runtime dạng `Main method is not static in class Demo, please define the main method as: public static void main(String[] args)`, vì JVM cần gọi `main` mà không phải tạo đối tượng trước — thiếu `static` phá vỡ điều kiện đó.

</details>

**8. Bạn viết `public class Employee { ... }` nhưng vô tình lưu file thành `employee.java` (chữ thường). Trên Linux và trên macOS/Windows, kết quả biên dịch có giống nhau không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không giống nhau**, vì hệ thống file của các hệ điều hành xử lý chữ hoa/thường khác nhau:

- **Linux**: hệ thống file phân biệt hoa/thường (case-sensitive) → `employee.java` và `Employee.java` là hai file khác nhau → `javac` báo lỗi ngay vì tên file không khớp tên class `public`.
- **macOS mặc định (APFS) và Windows (NTFS)**: hệ thống file không phân biệt hoa/thường với người dùng thông thường → việc biên dịch/chạy đôi khi vẫn "qua" được một cách tình cờ, gây ảo giác code đúng.

Đây là lý do dự án thực tế nên luôn kiểm thử trên môi trường Linux (thường dùng cho server/CI) để tránh lỗi "chạy được ở máy tôi nhưng lỗi trên server".

</details>

**9. Một file `.java` có được phép chứa nhiều class không? Nêu quy tắc và khi nào nên tách class ra file riêng.**

<details className="qa">
<summary>Xem đáp án</summary>

Được phép, với điều kiện:

- Chỉ tối đa **một** class trong file được khai báo `public`.
- Các class còn lại phải là package-private (không có từ khóa `public`), và tên file phải trùng với tên class `public` (nếu có).

```java
// File: Bank.java
public class Bank {
    // ...
}

class Account { // không public — hợp lệ trong cùng file Bank.java
    // ...
}
```

**Khi nào nên tách file riêng:** khi class có kích thước lớn, được dùng lại ở nhiều nơi khác, hoặc cần khai báo `public` riêng để các package khác truy cập trực tiếp. Trong dự án thực tế, quy ước phổ biến là mỗi class `public` một file để dễ tìm kiếm, review và quản lý qua hệ thống quản lý phiên bản.

</details>

---

## 2. Vòng đời của chương trình

Bài học: [2. Vòng đời của chương trình](../../java/01-learn-the-basics/2_vong-doi-chuong-trinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô tả ba bước vòng đời của một chương trình Java, từ lúc viết code tới lúc chạy ra kết quả.**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Viết mã nguồn**: lập trình viên viết code trong file `.java`.
2. **Biên dịch**: công cụ `javac` (Java Compiler) kiểm tra cú pháp và dịch file `.java` thành file `.class` chứa **bytecode**.
3. **Thực thi**: `JVM` (Java Virtual Machine) nạp file `.class`, dịch bytecode sang mã máy (thường qua **JIT** — Just-In-Time compiler) rồi CPU thực thi.

```
File .java  →  javac (biên dịch)  →  File .class (bytecode)  →  JVM (chạy)
```

</details>

**2. Bytecode là gì? Vì sao nó là "bí quyết" giúp Java đạt được khẩu hiệu "Write Once, Run Anywhere"?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bytecode** (mã byte) là dạng trung gian gồm các chỉ thị mà **JVM** hiểu được — nó không phải mã máy (machine code) riêng của bất kỳ CPU/hệ điều hành cụ thể nào.

Vì mỗi hệ điều hành chỉ cần cài một bản JVM tương ứng, mà mọi JVM đều hiểu cùng một loại bytecode, nên:

- Lập trình viên chỉ cần biên dịch **một lần** ra file `.class`.
- File `.class` đó chạy được trên Windows, macOS, Linux... miễn máy đó có JVM phù hợp — không cần biên dịch lại cho từng nền tảng.

Đây là điểm khác biệt lớn so với C/C++, nơi mỗi hệ điều hành cần một bản build (biên dịch) riêng ra thẳng mã máy.

</details>

**3. Phân biệt `JVM`, `JRE` và `JDK`. Người chỉ chạy ứng dụng Java và người lập trình Java cần cài gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba khái niệm lồng nhau như các hộp, từ trong ra ngoài:

| Thành phần | Gồm | Vai trò |
|---|---|---|
| `JVM` (Java Virtual Machine) | Lõi trong cùng | Nạp và chạy bytecode |
| `JRE` (Java Runtime Environment) | `JVM` + thư viện chuẩn | Đủ để **chạy** một chương trình Java đã biên dịch |
| `JDK` (Java Development Kit) | `JRE` + công cụ (`javac`, debugger...) | Đủ để **viết và biên dịch** code Java |

- Người **chỉ chạy** ứng dụng Java (end user) → chỉ cần `JRE`.
- Người **lập trình** Java → cần `JDK` (vì cần `javac` để biên dịch).

Lưu ý: từ Java 11 trở đi, Oracle không phân phối `JRE` độc lập nữa — thường chỉ còn `JDK` để tải, nhưng khái niệm ba lớp vẫn đúng về mặt kiến trúc.

</details>

**4. `JIT` (Just-In-Time compiler) là gì? Nó khác gì so với việc thông dịch (interpret) thuần túy hay biên dịch thẳng ra mã máy như C/C++?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Thông dịch thuần túy** (như một số ngôn ngữ script): đọc và chạy từng dòng lệnh, không cần biên dịch trước, nhưng chạy chậm vì phải "dịch lại" mỗi lần gặp.
- **Biên dịch thẳng ra mã máy** (C/C++): nhanh khi chạy, nhưng phải biên dịch riêng cho từng hệ điều hành/CPU, mất khả năng "chạy mọi nơi".
- **`JIT`**: là phần của JVM, biên dịch bytecode sang mã máy **ngay lúc chương trình đang chạy** (runtime), tập trung tối ưu những đoạn code chạy nhiều lần ("hot code"). Kết quả là Java vừa giữ được tính di động của bytecode, vừa đạt tốc độ gần với mã máy biên dịch sẵn sau khi JIT "làm nóng" (warm up).

Ngoài `JIT`, Java hiện đại còn hỗ trợ biên dịch **AOT** (Ahead-Of-Time, ví dụ qua GraalVM Native Image) để sinh thẳng file thực thi native, đánh đổi lấy thời gian khởi động nhanh hơn nhưng mất một phần tính "chạy mọi nơi" của bytecode.

</details>

**5. Bạn gõ `java ChaoBan.class` để chạy chương trình và bị lỗi. Lệnh đúng là gì, và vì sao lệnh sai lại gây lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Lệnh đúng: `java ChaoBan` — **không kèm** đuôi `.class`.

Vì lệnh `java` nhận vào **tên class** (để JVM tìm và nạp đúng class có hàm `main`), không phải tên file. Khi gõ `java ChaoBan.class`, JVM hiểu nhầm `ChaoBan.class` (kèm cả dấu chấm) là tên class, không tìm thấy class nào tên như vậy nên báo lỗi dạng `Error: Could not find or load main class ChaoBan.class`.

</details>

**6. Bạn vừa sửa code trong file `.java` và chạy lại bằng `java TenClass`, nhưng vẫn thấy kết quả cũ như trước khi sửa. Nguyên nhân thường gặp nhất là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân phổ biến nhất: **quên biên dịch lại** bằng `javac` sau khi sửa code.

Lệnh `java TenClass` chỉ chạy file `.class` (bytecode) đã có sẵn — nó **không** tự động đọc lại file `.java` gốc. Nếu bạn sửa `.java` mà không chạy lại `javac`, file `.class` cũ (chưa cập nhật) vẫn còn nằm đó và JVM cứ thế chạy bản cũ.

Cách khắc phục: luôn `javac TenClass.java` (biên dịch) trước, rồi mới `java TenClass` (chạy). Đây cũng là lý do các công cụ build (Maven, Gradle) hay IDE thường tự động biên dịch lại trước khi chạy, để tránh lỗi này.

</details>

**7. Một server production chỉ cần chạy ứng dụng Java đã đóng gói sẵn (file `.jar`), không cần biên dịch thêm gì. Đội vận hành nên cài `JDK` hay `JRE` trên server đó? Vì sao cân nhắc này quan trọng trong thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

Về nguyên tắc chỉ cần **`JRE`** (hoặc bản `JDK` đầy đủ nhưng chỉ dùng phần chạy), vì server chỉ **chạy** bytecode đã biên dịch sẵn trong file `.jar`, không cần `javac` hay các công cụ phát triển khác.

Cân nhắc này quan trọng vì:

- **Bảo mật/diện tích tấn công (attack surface)**: cài ít công cụ hơn trên server production giảm nguy cơ bị khai thác qua các thành phần không dùng tới.
- **Kích thước image**: trong container (ví dụ Docker), dùng base image JRE thay vì JDK giúp image nhẹ hơn đáng kể, triển khai nhanh hơn.
- Trong thực tế hiện nay, do Oracle không còn phân phối `JRE` độc lập từ Java 11, nhiều team dùng các bản JRE tối giản của OpenJDK hoặc công cụ `jlink` để tự tạo runtime image tối thiểu chỉ chứa module cần thiết.

</details>

**8. Bộ dọn rác (Garbage Collector — GC) nằm ở đâu trong vòng đời chương trình, và vì sao đây được xem là một lợi thế của Java so với C/C++?**

<details className="qa">
<summary>Xem đáp án</summary>

`GC` là một thành phần chạy **bên trong JVM**, hoạt động song song trong lúc chương trình đang chạy (giai đoạn thực thi ở bước 3 của vòng đời). Nó tự động phát hiện các đối tượng không còn được tham chiếu tới (unreachable) và thu hồi vùng nhớ (heap) mà chúng chiếm giữ.

So với C/C++ — nơi lập trình viên phải tự `malloc`/`free` (hoặc `new`/`delete`) bộ nhớ thủ công, dễ gây lỗi **rò rỉ bộ nhớ** (memory leak) khi quên giải phóng, hoặc **dangling pointer** khi giải phóng rồi vẫn dùng — Java giao việc quản lý vòng đời bộ nhớ cho JVM, giúp giảm hẳn nhóm lỗi này. Đánh đổi là JVM tốn thêm tài nguyên và có thể gây độ trễ ngắn (GC pause) khi dọn rác, dù các GC hiện đại (như G1, ZGC) đã tối ưu để độ trễ này rất nhỏ.

</details>

**9. `ClassLoader` là gì và nó liên quan thế nào tới vòng đời chương trình? Một class có bị nạp ngay từ đầu khi chương trình khởi động không?**

<details className="qa">
<summary>Xem đáp án</summary>

`ClassLoader` là thành phần của JVM chịu trách nhiệm **tìm và nạp file `.class` vào bộ nhớ** khi cần, chuyển bytecode thành các đối tượng `Class` mà JVM có thể dùng để tạo instance, gọi method...

Điểm hay bị hiểu nhầm: JVM **không nạp mọi class ngay khi khởi động chương trình**. Việc nạp class trong Java là **lazy** (trễ) — một class chỉ thực sự được nạp lần đầu tiên nó được dùng đến (ví dụ lần đầu gọi `new TenClass()`, truy cập static field, hay gọi static method của nó). Quá trình đầy đủ gồm ba giai đoạn: **loading** (nạp bytecode), **linking** (kiểm tra, chuẩn bị, liên kết tham chiếu) và **initialization** (chạy khối khởi tạo static và gán giá trị field static).

Hiểu cơ chế này giúp giải thích các hiện tượng như: chương trình chạy một lúc mới báo lỗi `ClassNotFoundException`/`NoClassDefFoundError` dù class đó "có vẻ" không liên quan đến đoạn code đang lỗi, hoặc vì sao static initializer chỉ chạy đúng một lần và đúng lúc class được dùng lần đầu.

</details>

---

## 3. Kiểu dữ liệu

Bài học: [3. Kiểu dữ liệu](../../java/01-learn-the-basics/3_kieu-du-lieu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Java có bao nhiêu kiểu nguyên thủy (primitive)? Kể tên và phân nhóm chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Java có đúng **8 kiểu nguyên thủy**, chia thành 4 nhóm:

- **Số nguyên**: `byte`, `short`, `int`, `long`.
- **Số thực**: `float`, `double`.
- **Ký tự**: `char`.
- **Luận lý**: `boolean`.

Đây là các kiểu dựng sẵn của ngôn ngữ, lưu trực tiếp giá trị (không phải object), khác với kiểu tham chiếu như `String` hay mảng.

</details>

**2. Phân biệt kiểu nguyên thủy (primitive) và kiểu tham chiếu (reference) trong Java. Cho ví dụ mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Kiểu nguyên thủy | Kiểu tham chiếu |
|---|---|---|
| Lưu trữ | Lưu **trực tiếp giá trị** | Lưu **địa chỉ** trỏ tới object trong bộ nhớ |
| Ví dụ | `int`, `double`, `boolean`, `char`... | `String`, mảng, các class tự tạo |
| Giá trị mặc định (biến instance) | `0`, `0.0`, `false`... | `null` |
| Có thể là `null` | Không | Có |

```java
int soNguyen = 5;              // lưu trực tiếp giá trị 5
String ten = "Java";           // "ten" lưu địa chỉ trỏ tới object chuỗi "Java"
```

</details>

**3. So sánh `int` với `Integer`. `Autoboxing`/`unboxing` là gì và khi nào bạn buộc phải dùng `Integer` thay vì `int`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `int` — kiểu nguyên thủy, lưu trực tiếp giá trị, nhanh và nhẹ, **không** nhận `null`.
- `Integer` — kiểu tham chiếu (wrapper class bọc quanh `int`), là object thật sự, **có thể** là `null`, dùng được ở nơi yêu cầu object (như generics, `Collection`).

**Autoboxing**: Java tự động chuyển `int` → `Integer` khi cần một object (ví dụ đưa vào `List`). **Unboxing**: chiều ngược lại, tự động lấy giá trị `int` ra từ `Integer`.

```java
List<Integer> diem = new ArrayList<>();
diem.add(9);              // autoboxing: int 9 → Integer tự động
int x = diem.get(0);      // unboxing: Integer → int tự động
```

Bắt buộc dùng `Integer` (thay vì `int`) khi: dùng trong `List<Integer>`/`Map<..., Integer>` (generics không nhận primitive trực tiếp), hoặc khi field cần biểu diễn trạng thái "chưa có giá trị" bằng `null`.

</details>

**4. Vì sao khai báo số thực `float` cần thêm hậu tố `f` (ví dụ `36.6f`) nhưng `double` thì không cần hậu tố gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong Java, **một số thực viết trực tiếp (literal) không có hậu tố mặc định được hiểu là `double`** (độ chính xác 64-bit). Vì vậy:

```java
float nhietDo = 36.6;   // LỖI biên dịch: incompatible types (double → float cần ép kiểu tường minh)
float nhietDo = 36.6f;  // ĐÚNG: hậu tố f báo cho compiler đây là giá trị float
double soPi = 3.14;     // ĐÚNG: không cần hậu tố vì mặc định đã là double
```

Gán một giá trị `double` (64-bit) cho biến `float` (32-bit) là ép kiểu thu hẹp (narrowing) tiềm ẩn mất dữ liệu, nên compiler bắt buộc phải có hậu tố `f` hoặc ép kiểu `(float)` tường minh.

</details>

**5. Đoạn code sau có biên dịch được không? Nếu có lỗi, hãy chỉ ra dòng gây lỗi và giải thích.**

```java
public class Demo {
    public static void main(String[] args) {
        byte diem = 120;
        byte tong = diem + 10;
        System.out.println(tong);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không biên dịch được** ở dòng `byte tong = diem + 10;`.

Lý do: trong Java, mọi phép toán số học giữa các kiểu nhỏ hơn `int` (như `byte`, `short`) đều tự động được **nâng cấp lên `int`** trước khi tính (kể cả khi cả hai toán hạng đều là `byte`). Kết quả `diem + 10` có kiểu `int`, trong khi biến `tong` khai báo là `byte` → gán `int` cho `byte` là ép kiểu thu hẹp, cần ép kiểu tường minh:

```java
byte tong = (byte) (diem + 10); // phải ép kiểu rõ ràng
```

Ngoài ra cần lưu ý: nếu kết quả `diem + 10` vượt phạm vi `byte` (-128 đến 127), giá trị sẽ bị tràn số (overflow) và "cuộn vòng" ra một giá trị âm không như mong đợi.

</details>

**6. Đoạn code sau chạy có ném ngoại lệ (exception) không? Vì sao?**

```java
public class Demo {
    public static void main(String[] args) {
        Integer soLuong = null;
        int tong = soLuong + 5;
        System.out.println(tong);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Có, ném `NullPointerException` (NPE) lúc chạy** (compile vẫn qua bình thường).

Giải thích: `soLuong + 5` yêu cầu **unboxing** `Integer` thành `int` để cộng. Nhưng `soLuong` đang là `null` — không có giá trị `int` nào để "mở bọc" ra cả, nên JVM ném `NullPointerException` ngay tại phép unboxing này.

Đây là lỗi rất dễ gặp khi trộn wrapper class (`Integer`, `Double`...) với primitive trong biểu thức tính toán — luôn kiểm tra `null` trước khi để wrapper tham gia phép toán, hoặc gán giá trị mặc định hợp lý.

</details>

**7. Vì sao đoạn code sau bị compiler báo lỗi "variable might not have been initialized", trong khi field cùng kiểu trong một class lại không bị lỗi này?**

```java
public class Demo {
    static int tongInstance; // field static — KHÔNG lỗi, tự có giá trị mặc định 0

    public static void main(String[] args) {
        int tongCucBo;                 // biến cục bộ — chưa gán giá trị
        System.out.println(tongCucBo); // LỖI: variable might not have been initialized
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Vì Java chỉ cấp **giá trị mặc định tự động** cho **biến instance/static** (field của class), còn **biến cục bộ** (khai báo trong method) thì **không** có giá trị mặc định.

- `tongInstance` là field `static` → JVM tự gán `0` khi class được khởi tạo.
- `tongCucBo` là biến cục bộ trong `main` → nếu bạn đọc giá trị của nó trước khi gán, compiler chủ động chặn lại bằng lỗi biên dịch, thay vì để chương trình chạy với một giá trị rác không xác định.

Đây là một quyết định thiết kế an toàn của Java: buộc lập trình viên phải luôn khởi tạo biến cục bộ trước khi dùng.

</details>

**8. Bạn cần lưu số tiền (ví dụ giá sản phẩm, số dư tài khoản) trong một ứng dụng thương mại điện tử. Có nên dùng `double` không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không nên** dùng `double` (hay `float`) để lưu tiền, vì các kiểu số thực dấu phẩy động (floating-point) biểu diễn giá trị theo hệ nhị phân, nên **không thể biểu diễn chính xác** nhiều số thập phân thông thường (ví dụ `0.1`), dẫn tới sai số tích lũy khi cộng/trừ nhiều lần:

```java
double a = 0.1 + 0.2;
System.out.println(a); // in ra 0.30000000000000004, không phải 0.3
```

Trong tính toán tài chính, sai số nhỏ này có thể tích lũy thành chênh lệch tiền thật.

**Nên dùng**:

- `java.math.BigDecimal` — biểu diễn số thập phân chính xác tuyệt đối, có các phương thức tính toán và làm tròn tường minh (`setScale`, `RoundingMode`).
- Hoặc lưu số tiền dưới dạng số nguyên nhỏ nhất (ví dụ lưu **xu/cent** bằng `long`) nếu hệ thống không cần độ chính xác thập phân phức tạp.

</details>

**9. Đoạn code sau in ra `true` hay `false`? Giải thích vì sao (đây là câu hỏi phỏng vấn Java kinh điển).**

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b);   // dòng 1

Integer c = 200;
Integer d = 200;
System.out.println(c == d);   // dòng 2
```

<details className="qa">
<summary>Xem đáp án</summary>

Dòng 1 in `true`, dòng 2 in `false`.

Nguyên nhân: JVM có cơ chế **cache** (bộ nhớ đệm) sẵn các object `Integer` cho khoảng giá trị từ **-128 đến 127** (Integer Cache). Khi autoboxing một `int` trong khoảng này, Java trả về **cùng một object** đã cache sẵn, nên `a == b` (so sánh địa chỉ object) trả về `true`.

Với `200` — nằm ngoài khoảng cache — mỗi lần autoboxing sẽ tạo ra một object `Integer` **mới**, nên `c == d` so sánh hai địa chỉ khác nhau → `false`.

**Bài học thực hành**: luôn dùng `.equals()` để so sánh **giá trị** của các kiểu wrapper (`Integer`, `Long`...), không dùng `==` (chỉ nên dùng `==` cho kiểu nguyên thủy như `int`).

```java
System.out.println(c.equals(d)); // true — so sánh đúng giá trị
```

</details>

**10. `char` trong Java chiếm 16 bit và biểu diễn Unicode. Điều gì xảy ra khi bạn cần lưu một ký tự emoji hoặc chữ Hán hiếm nằm ngoài phạm vi 16 bit cơ bản?**

<details className="qa">
<summary>Xem đáp án</summary>

`char` trong Java lưu một đơn vị mã UTF-16 (16 bit), đủ để biểu diễn các ký tự trong **BMP** (Basic Multilingual Plane — vùng ký tự Unicode cơ bản, gồm hầu hết chữ cái, chữ số, ký hiệu và nhiều ngôn ngữ thông dụng).

Tuy nhiên, nhiều **emoji** và một số chữ Hán/Hàn hiếm nằm **ngoài BMP** (mã Unicode lớn hơn giá trị 16 bit có thể biểu diễn) — các ký tự này cần **surrogate pair**: hai giá trị `char` (16 bit) ghép lại mới biểu diễn được một ký tự thật sự.

```java
String emoji = "😀";
System.out.println(emoji.length());        // in ra 2, KHÔNG phải 1 (vì đây là surrogate pair)
System.out.println(emoji.codePointCount(0, emoji.length())); // in ra 1 — đúng "1 ký tự" thật
```

Vì lý do này, khi xử lý chuỗi có thể chứa emoji/ký tự ngoài BMP, nên dùng các phương thức làm việc theo **code point** (như `codePointAt`, `codePoints()`) thay vì giả định một `char` luôn là một ký tự hiển thị hoàn chỉnh.

</details>

---

## 4. Biến và phạm vi

Bài học: [4. Biến và phạm vi](../../java/01-learn-the-basics/4_bien-va-pham-vi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Ba loại biến trong Java (cục bộ, instance, static) khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại biến | Khai báo ở đâu | Số bản sao | Giá trị mặc định | Thời điểm sống |
|---|---|---|---|---|
| Cục bộ (local) | Trong hàm/khối lệnh | Riêng mỗi lần hàm chạy | Không có, phải tự gán | Từ lúc khai báo tới hết khối `{ }` |
| Instance | Trong class, ngoài hàm, không có `static` | Mỗi object (đối tượng) một bản riêng | Có (`0`, `null`, `false`...) | Từ lúc tạo object tới lúc object bị dọn rác (garbage collected) |
| Static | Trong class, có từ khóa `static` | Một bản **duy nhất** dùng chung cho cả class | Có | Từ lúc class được nạp (loaded) tới khi chương trình kết thúc |

- Biến cục bộ nằm trên **stack**, biến instance/static nằm trên **heap** (là một phần của object hoặc class).
- Sửa biến static ở một object sẽ ảnh hưởng tới tất cả object khác, vì chúng cùng dùng chung một ô nhớ.

</details>

**2. Vì sao biến cục bộ bắt buộc phải gán giá trị trước khi dùng, còn biến instance và biến static thì Java tự gán giá trị mặc định?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Biến cục bộ** nằm trên stack, compiler không có bước "khởi tạo mặc định" cho stack — nếu cho phép dùng biến chưa gán, giá trị đọc được sẽ là rác bộ nhớ còn sót lại, dẫn tới lỗi khó lường. Vì vậy Java bắt compiler kiểm tra **definite assignment** (phải chắc chắn đã gán trước khi dùng) và báo lỗi biên dịch nếu chưa.
- **Biến instance/static** nằm trên heap. Khi JVM cấp phát vùng nhớ cho object hoặc nạp class, nó luôn dọn vùng nhớ đó về giá trị mặc định trước (`0` cho số, `false` cho `boolean`, `null` cho kiểu tham chiếu) — đây là hành vi được đảm bảo bởi JVM, nên không bắt buộc lập trình viên phải tự gán.
- Đây cũng là lý do lỗi "variable might not have been initialized" chỉ xảy ra với biến cục bộ, không xảy ra với field của class.

</details>

**3. Từ khóa `var` (Java 10+) hoạt động thế nào? Dùng `var` có làm Java trở thành ngôn ngữ kiểu động (dynamically typed) không?**

<details className="qa">
<summary>Xem đáp án</summary>

- `var` là **type inference** (suy luận kiểu tại thời điểm biên dịch): compiler nhìn vào giá trị khởi tạo để tự xác định kiểu, rồi "khắc cứng" kiểu đó vào biến — giống hệt như bạn tự gõ kiểu ra.
- Java **vẫn là ngôn ngữ kiểu tĩnh (statically typed)**: kiểu được quyết định lúc biên dịch, không đổi được sau đó, và compiler vẫn bắt lỗi gán sai kiểu.

```java
var soLuong = 10;      // compiler suy ra kiểu int
soLuong = 20;          // OK
// soLuong = "abc";    // Lỗi biên dịch: incompatible types
```

- Hạn chế: chỉ dùng được cho **biến cục bộ** có gán giá trị ngay (không dùng cho field, tham số hàm, kiểu trả về, hay `var x;` không gán).
- Dùng `var` hợp lý khi kiểu đã rõ ràng từ vế phải (ví dụ `var list = new ArrayList<String>();`); nên tránh khi làm giảm khả năng đọc code (ví dụ `var result = xuLy();` mà không rõ `xuLy` trả về gì).

</details>

**4. Khai báo `final List<String> ds = new ArrayList<>();` rồi gọi `ds.add("A")` có hợp lệ không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hợp lệ.** `final` trên một biến kiểu tham chiếu chỉ khóa **tham chiếu** (reference — địa chỉ mà biến đang trỏ tới), không khóa **nội dung bên trong object** mà nó trỏ tới.

```java
final List<String> ds = new ArrayList<>();
ds.add("A");       // OK — sửa nội dung object, không đổi tham chiếu
// ds = new ArrayList<>(); // LỖI — không được gán lại tham chiếu khác
```

- Muốn danh sách thực sự không đổi được, phải bọc bằng `List.copyOf(...)` hoặc `Collections.unmodifiableList(...)`, gọi `.add()` trên đó sẽ ném `UnsupportedOperationException`.
- Đây là điểm hay bị hỏi để phân biệt "final reference" và "immutable object" — hai khái niệm khác nhau.

</details>

**5. Đoạn code dưới đây in ra gì? Nếu bỏ comment dòng cuối thì lỗi gì xảy ra?**

```java
public class Test {
    public static void main(String[] args) {
        int x = 5;
        if (x > 0) {
            int y = 10;
            System.out.println(x + y);
        }
        // System.out.println(y);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

- Chương trình in ra `15` (`x + y` = `5 + 10`).
- Nếu bỏ comment `System.out.println(y);`, chương trình **không biên dịch được** — lỗi `cannot find symbol` vì `y` chỉ tồn tại trong **scope** của khối `if`, đã "biến mất" khi ra khỏi cặp `{ }` đó.
- Đây là ví dụ điển hình của nguyên tắc: biến chỉ sống trong khối lệnh khai báo ra nó.

</details>

**6. Cho đoạn code sau, `Counter.count` in ra giá trị bao nhiêu? Giải thích.**

```java
public class Counter {
    static int count = 0;
    Counter() {
        count++;
    }
}

public class Main {
    public static void main(String[] args) {
        new Counter();
        new Counter();
        new Counter();
        System.out.println(Counter.count);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả in ra là **`3`**.

- `count` là biến **static** — chỉ có **một bản duy nhất** thuộc về class `Counter`, không phải thuộc về từng object.
- Mỗi lần `new Counter()` chạy, constructor tăng `count` lên 1, và vì cả ba object cùng chia sẻ một ô nhớ `count`, giá trị cộng dồn qua cả ba lần khởi tạo.
- Đây chính là kỹ thuật thường dùng để đếm số lượng object đã được tạo ra từ một class.

</details>

**7. "Effectively final" là gì? Vì sao lambda expression hoặc anonymous inner class chỉ được truy cập biến cục bộ effectively final (hoặc `final`) từ scope bao ngoài?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Effectively final** (hiệu quả như final): một biến cục bộ tuy không khai báo `final` nhưng **không hề bị gán lại giá trị** sau khi khởi tạo — Java coi nó tương đương biến `final`.

```java
int soLuong = 10; // không có final, nhưng không đổi -> effectively final
Runnable r = () -> System.out.println(soLuong); // OK
```

- Lý do kỹ thuật: lambda/anonymous class không thực sự "dùng chung" biến cục bộ của method bao ngoài — chúng **copy giá trị** tại thời điểm tạo ra (vì biến cục bộ nằm trên stack, có thể bị hủy khi method kết thúc trong khi lambda vẫn còn sống, ví dụ khi trả về hoặc chạy ở thread khác). Nếu cho phép sửa biến gốc sau đó, giá trị bên trong lambda và bên ngoài sẽ lệch nhau mà lập trình viên không hay biết — vì vậy Java bắt buộc biến phải bất biến trong toàn bộ scope chứa lambda.

</details>

**8. Bạn cần đếm số lượng object đã tạo ra từ một class (ví dụ số `User` đã đăng ký). Bạn dùng biến instance hay biến static? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **biến static**, vì đây là thông tin thuộc về **cả class** (tổng số lượng), không phải thông tin riêng của từng object.

```java
public class User {
    static int soLuongDaTao = 0;
    String ten;

    User(String ten) {
        this.ten = ten;
        soLuongDaTao++;
    }
}
```

- Nếu dùng biến instance, mỗi `User` sẽ có một bộ đếm riêng, luôn bằng `1` hoặc không phản ánh đúng tổng số — sai mục đích.
- Lưu ý thực tế: nếu chương trình đa luồng (multi-thread), tăng biến static kiểu `count++` không an toàn (không phải thao tác nguyên tử — atomic), cần dùng `AtomicInteger` hoặc đồng bộ hóa (`synchronized`) để tránh đếm sai.

</details>

**9. Khi truyền một biến kiểu nguyên thủy (`int`) và một biến kiểu tham chiếu (object) vào method, thay đổi bên trong method có ảnh hưởng tới biến gốc bên ngoài không? Java truyền tham số theo kiểu gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Java **luôn truyền tham số theo giá trị (pass-by-value)** — kể cả với object.

```java
static void doiSo(int x) { x = 100; }
static void doiTen(StringBuilder sb) { sb.append(" - da doi"); }

int a = 5;
doiSo(a);
System.out.println(a); // vẫn là 5 — giá trị int được copy, đổi bản copy không ảnh hưởng bản gốc

StringBuilder sb = new StringBuilder("Ten");
doiTen(sb);
System.out.println(sb); // "Ten - da doi" — vì cái được copy là THAM CHIẾU (địa chỉ),
                          // cả bản copy và bản gốc cùng trỏ tới MỘT object trên heap
```

- Với kiểu nguyên thủy: giá trị được copy, method sửa bản copy, không ảnh hưởng biến gốc.
- Với kiểu tham chiếu: **tham chiếu** (địa chỉ) được copy, không phải object. Sửa **nội dung** object qua tham chiếu đó sẽ thấy thay đổi ở ngoài; nhưng nếu gán tham chiếu tham số sang object khác (`sb = new StringBuilder("Khac");`) thì biến gốc bên ngoài **không** đổi theo, vì chỉ bản copy tham chiếu trong method bị đổi hướng.

</details>

---

## 5. Ép kiểu (Type Casting)

Bài học: [5. Ép kiểu (Type Casting)](../../java/01-learn-the-basics/5_ep-kieu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt widening (ép kiểu mở rộng) và narrowing (ép kiểu thu hẹp). Vì sao Java cho widening chạy tự động còn narrowing bắt buộc phải viết `(kiểu)`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Widening**: chuyển từ kiểu có phạm vi giá trị nhỏ sang kiểu có phạm vi lớn hơn (ví dụ `int → long → double`). Kiểu đích luôn chứa được mọi giá trị của kiểu nguồn nên **không thể mất dữ liệu** — Java cho phép tự động, không cần cast.
- **Narrowing**: chuyển từ kiểu phạm vi lớn sang kiểu phạm vi nhỏ hơn (ví dụ `double → int`, `int → byte`). Kiểu đích có thể **không chứa nổi** giá trị nguồn, dẫn tới mất phần thập phân hoặc tràn số (overflow). Java bắt buộc viết `(kiểuĐích)` để lập trình viên **chủ động xác nhận** mình chấp nhận rủi ro mất dữ liệu, thay vì để lỗi âm thầm xảy ra.

</details>

**2. Thứ tự mở rộng kiểu số trong Java là gì? Ép `char` sang `int` có phải là widening không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự widening giữa các kiểu số: `byte → short → int → long → float → double`.

- `char` không nằm hẳn trong chuỗi trên nhưng vẫn widening được sang `int` (và các kiểu lớn hơn), vì `char` được lưu trữ nội bộ như một số nguyên không dấu 16-bit (giá trị Unicode của ký tự).

```java
char c = 'A';
int ma = c;             // widening tự động: ma = 65 (mã ASCII/Unicode của 'A')
System.out.println(ma); // 65
```

- Chiều ngược lại (`int → char`) là narrowing, phải ép tường minh: `char c2 = (char) 66; // 'B'`.

</details>

**3. So sánh ép kiểu giữa các kiểu số (numeric casting) và ép kiểu giữa các đối tượng (object casting, ví dụ `(String) obj`). Vì sao object casting có thể ném ra `ClassCastException` lúc runtime?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Numeric casting | Object casting |
|---|---|---|
| Chuyển đổi gì | Biểu diễn nhị phân của giá trị số | Chỉ đổi **kiểu nhìn nhận** (view) của compiler với cùng một object, không tạo object mới |
| Rủi ro | Mất phần thập phân, tràn số (âm thầm, không ném exception) | Ném `ClassCastException` (`ép kiểu sai lớp`) ngay lúc chạy nếu object thực sự không phải kiểu đó |
| Cách phòng tránh | Kiểm tra phạm vi giá trị trước khi ép | Kiểm tra `instanceof` trước khi ép |

```java
Object obj = "xin chao";
Integer so = (Integer) obj; // biên dịch OK, nhưng ném ClassCastException lúc chạy
                              // vì obj thực chất là String, không phải Integer

if (obj instanceof String) {
    String s = (String) obj; // an toàn, vì đã kiểm tra trước
}
```

Object casting không chuyển đổi dữ liệu — object trên heap giữ nguyên kiểu thật của nó, cast chỉ cho compiler biết "hãy coi biến này như kiểu X"; JVM kiểm tra thật ở runtime và ném lỗi nếu sai.

</details>

**4. Output của đoạn code sau là gì?**

```java
public class Test {
    public static void main(String[] args) {
        int a = 130;
        byte b = (byte) a;
        System.out.println(b);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả in ra là **`-126`**.

- `byte` trong Java chỉ lưu được từ `-128` đến `127` (8-bit, có dấu).
- `130` vượt phạm vi này, nên khi ép kiểu thu hẹp, JVM chỉ giữ lại 8-bit thấp nhất của giá trị nhị phân rồi diễn giải lại theo `byte` có dấu, gây ra hiện tượng **tràn số (overflow)** — kết quả "quay vòng" thành một số âm bất ngờ thay vì báo lỗi.
- Đây là lý do ép kiểu thu hẹp giữa các kiểu số **không bao giờ ném exception**, chỉ âm thầm cho kết quả sai — khác hẳn với object casting.

</details>

**5. Output của đoạn code sau là gì? Giải thích vì sao có sự khác nhau.**

```java
public class Test {
    public static void main(String[] args) {
        System.out.println(5 / 2);
        System.out.println(5.0 / 2);
        System.out.println((double) 5 / 2);
        System.out.println(5 / 2.0);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả lần lượt: `2`, `2.5`, `2.5`, `2.5`.

- `5 / 2`: cả hai toán hạng là `int` → Java thực hiện **phép chia nguyên**, cắt bỏ phần thập phân → `2`.
- `5.0 / 2`, `(double) 5 / 2`, `5 / 2.0`: chỉ cần **một trong hai toán hạng** là `double`, Java tự động widening toán hạng còn lại sang `double` trước khi tính, nên phép chia trở thành chia số thực → `2.5`.
- Quy tắc chung: kiểu kết quả của phép toán hai ngôi phụ thuộc vào **kiểu "lớn" hơn** giữa hai toán hạng.

</details>

**6. `Integer.parseInt("12.5")` có chạy được không? Nếu không, lỗi gì xảy ra và cách xử lý an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không chạy được** — `Integer.parseInt` chỉ nhận chuỗi biểu diễn số nguyên hợp lệ (không có dấu chấm thập phân). Với `"12.5"`, nó ném ra `NumberFormatException` (`java.lang.NumberFormatException: For input string: "12.5"`).

Cách xử lý an toàn khi input không đáng tin (ví dụ từ người dùng nhập):

```java
String input = "12.5";
try {
    int so = Integer.parseInt(input);
    System.out.println(so);
} catch (NumberFormatException e) {
    System.out.println("Chuỗi không phải số nguyên hợp lệ: " + input);
}
```

Nếu input thực sự là số thực, dùng `Double.parseDouble(input)` rồi tự quyết định có ép sang `int` hay không.

</details>

**7. Autoboxing/unboxing là gì? Đoạn code sau tiềm ẩn lỗi gì?**

```java
Integer so = null;
int x = so;
```

<details className="qa">
<summary>Xem đáp án</summary>

- **Autoboxing**: Java tự động chuyển kiểu nguyên thủy (`int`) thành kiểu wrapper tương ứng (`Integer`) khi cần, ví dụ `Integer i = 5;` (thực chất là `Integer.valueOf(5)`).
- **Unboxing**: chiều ngược lại, tự động lấy giá trị nguyên thủy ra từ wrapper, ví dụ `int i2 = i;` (thực chất là `i.intValue()`).

Đoạn code trên ném ra **`NullPointerException`** lúc chạy: `so` đang là `null`, nhưng gán cho biến `int` (kiểu nguyên thủy không thể là `null`) buộc Java phải tự động gọi `so.intValue()` để unbox — gọi method trên một tham chiếu `null` gây lỗi ngay lập tức.

- Bài học thực tế: cẩn thận khi dùng kiểu wrapper (`Integer`, `Long`...) lấy từ Map, JSON, hoặc kết quả có thể `null` (ví dụ trường tùy chọn trong database) rồi gán trực tiếp vào biến nguyên thủy.

</details>

**8. Vì sao `(int) 9.99` cho ra `9` thay vì `10`? Muốn làm tròn đúng nghĩa thì dùng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ép kiểu narrowing từ số thực sang số nguyên trong Java chỉ đơn giản là **cắt bỏ (truncate)** phần thập phân, không quan tâm phần đó gần `0` hay gần `1` — nên `(int) 9.99` luôn ra `9`, và `(int) -9.99` ra `-9` (cắt về phía `0`, không phải làm tròn xuống).

Muốn làm tròn đúng nghĩa toán học, dùng `Math.round(...)`:

```java
System.out.println((int) 9.99);      // 9 (cắt bỏ phần thập phân)
System.out.println(Math.round(9.99)); // 10 (làm tròn tới số nguyên gần nhất)
```

Lưu ý: `Math.round(double)` trả về `long`, còn `Math.round(float)` trả về `int` — cần ép kiểu thêm nếu muốn lấy `int` từ tham số `double`.

</details>

**9. Với hai phương thức nạp chồng (overload) `void in(int x)` và `void in(long x)`, gọi `in((byte) 5)` Java chọn phiên bản nào? Giải thích cơ chế widening trong việc chọn overload.**

<details className="qa">
<summary>Xem đáp án</summary>

Java chọn **`in(int x)`**.

- Khi gọi một phương thức nạp chồng, Java tìm phiên bản khớp bằng cách **widening kiểu tham số truyền vào theo đúng thứ tự nhỏ nhất có thể** (`byte → short → int → long → float → double`), rồi chọn phiên bản đầu tiên khớp được — không tự ý "nhảy cóc" qua kiểu lớn hơn mức cần thiết nếu có phiên bản khớp gần hơn.
- Ở đây `byte` widening lên `int` là đủ để khớp `in(int x)`, nên Java dùng ngay phiên bản đó, không cần widening tiếp lên `long`.
- Nếu chỉ có `in(long x)` (không có bản `int`), Java mới widening tiếp từ `byte → ... → long` để gọi nó.
- Đây cũng là lý do cần cẩn thận khi thiết kế API có nhiều overload theo kiểu số — thứ tự widening có thể khiến lời gọi rơi vào phiên bản không như mong đợi.

</details>

---

## 6. Chuỗi (String)

Bài học: [6. Chuỗi (String)](../../java/01-learn-the-basics/6_chuoi-va-phuong-thuc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `String` trong Java được thiết kế là bất biến (immutable)? Nêu ít nhất hai lợi ích cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

- **An toàn khi chia sẻ (đa luồng)**: nhiều đối tượng/luồng có thể cùng giữ tham chiếu tới một chuỗi mà không lo bị nơi khác sửa đổi ngầm — không cần khóa (`lock`) khi đọc.
- **Dùng làm key của `HashMap`/`HashSet` an toàn**: nếu chuỗi có thể đổi nội dung sau khi đã dùng làm key, `hashCode()` của nó sẽ thay đổi, khiến việc tra cứu trong bảng băm (hash table) bị sai — vì phần tử bị "lạc" ở bucket cũ.
- **Cache được trong String Pool**: vì nội dung không đổi, Java có thể an toàn cho nhiều biến literal giống nhau dùng chung một object, tiết kiệm bộ nhớ.
- **Bảo mật**: các thông tin nhạy cảm truyền qua `String` (ví dụ tên file, URL, tham số kết nối) không thể bị đổi sau khi đã được kiểm tra (validate), tránh một dạng lỗ hổng gọi là time-of-check-to-time-of-use.

</details>

**2. String Pool là gì? Tạo chuỗi bằng literal `"Java"` khác gì so với `new String("Java")`?**

<details className="qa">
<summary>Xem đáp án</summary>

**String Pool** (còn gọi String Constant Pool) là một vùng nhớ đặc biệt trong heap, nơi Java lưu trữ và **tái sử dụng** các chuỗi literal — hai chuỗi literal giống hệt nội dung sẽ dùng chung một object duy nhất trong pool.

```java
String a = "Java";        // lấy (hoặc thêm mới) từ String Pool
String b = "Java";        // trùng nội dung -> dùng lại CHÍNH object trong pool, không tạo mới
String c = new String("Java"); // từ khóa new -> LUÔN tạo object MỚI trên heap, ngoài pool

System.out.println(a == b); // true — cùng một object trong pool
System.out.println(a == c); // false — c là object riêng, dù nội dung giống nhau
```

- Dùng literal giúp tiết kiệm bộ nhớ nhờ tái sử dụng; dùng `new String(...)` gần như không cần thiết trong code thông thường vì luôn tạo rác thêm.

</details>

**3. Output của đoạn code sau là gì? Vì sao?**

```java
public class Test {
    public static void main(String[] args) {
        String a = "Java";
        String b = "Java";
        String c = new String("Java");

        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả lần lượt: **`true`**, **`false`**, **`true`**.

- `a == b` → `true`: cả hai là literal `"Java"`, cùng trỏ tới **một object duy nhất** trong String Pool.
- `a == c` → `false`: `c` được tạo bằng `new String(...)`, ép Java tạo một object **mới** trên heap, khác object trong pool — dù nội dung ký tự giống hệt nhau, `==` so sánh **địa chỉ** nên vẫn là `false`.
- `a.equals(c)` → `true`: `equals()` của `String` so sánh **từng ký tự nội dung**, không quan tâm địa chỉ, nên trả về `true`.
- Ghi nhớ: **luôn dùng `.equals()`** để so sánh nội dung chuỗi; chỉ dùng `==` khi cố ý kiểm tra hai biến có cùng trỏ tới một object hay không.

</details>

**4. So sánh `String`, `StringBuilder` và `StringBuffer`.**

<details className="qa">
<summary>Xem đáp án</summary>

|                                | `String`                     | `StringBuilder`                                                     | `StringBuffer`                                         |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Tính chất                      | Bất biến (immutable)         | Thay đổi được (mutable)                                             | Thay đổi được (mutable)                                |
| Thread-safe (an toàn đa luồng) | Có (do bất biến)             | Không                                                               | Có (các phương thức được đồng bộ hóa — `synchronized`) |
| Hiệu năng                      | Chậm khi nối chuỗi nhiều lần | Nhanh nhất (đơn luồng)                                              | Chậm hơn `StringBuilder` do chi phí đồng bộ hóa        |
| Khi nào dùng                   | Chuỗi cố định, ít thay đổi   | Ghép/sửa chuỗi nhiều lần trong một luồng (đa số trường hợp thực tế) | Ghép/sửa chuỗi được chia sẻ giữa nhiều luồng cùng lúc  |

Trong thực tế, `StringBuilder` được dùng phổ biến hơn hẳn `StringBuffer` vì phần lớn thao tác ghép chuỗi diễn ra trong một luồng duy nhất (ví dụ bên trong một method), không cần trả chi phí đồng bộ hóa không cần thiết.

</details>

**5. Đoạn code sau in ra gì? Vì sao nhiều người mới hay nhầm lẫn ở đây?**

```java
public class Test {
    public static void main(String[] args) {
        String s = "hello";
        s.toUpperCase();
        System.out.println(s);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra **`hello`** (chữ thường, không đổi).

- Vì `String` bất biến, `s.toUpperCase()` **tạo ra một chuỗi mới** `"HELLO"` và trả về, nhưng không hề sửa `s` tại chỗ.
- Do kết quả trả về không được gán lại (`s = s.toUpperCase();`), chuỗi mới bị "rơi" mất, còn `s` vẫn giữ nguyên giá trị cũ.
- Đây là lỗi kinh điển nhất của người mới học String: quên rằng mọi phương thức "biến đổi" trên `String` đều trả về object mới, không sửa đối tượng gốc.

</details>

**6. Vì sao nối chuỗi bằng `+` trong vòng lặp lớn lại chậm? `StringBuilder` giải quyết vấn đề này như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
String s = "";
for (int i = 0; i < 10000; i++) {
    s = s + i; // mỗi vòng lặp tạo ra MỘT chuỗi mới hoàn toàn
}
```

- Vì `String` bất biến, mỗi lần `s + i` chạy, Java phải cấp phát một object `String` mới, **copy toàn bộ nội dung cũ** của `s` cộng thêm phần mới vào, rồi bỏ object cũ làm rác cho garbage collector dọn. Với vòng lặp `n` lần, tổng chi phí copy tăng theo cấp **O(n²)**.
- `StringBuilder` dùng một **mảng ký tự nội bộ (`char[]`) có thể thay đổi được**, và tự động cấp phát dư ra (capacity) để `append()` phần lớn các lần chỉ cần ghi thêm vào mảng có sẵn, không phải copy lại toàn bộ nội dung cũ mỗi lần — đưa độ phức tạp về gần **O(n)**.

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i); // sửa tại chỗ, không tạo object String mới mỗi vòng
}
String ketQua = sb.toString();
```

- Mẹo thêm: nếu biết trước số lượng ký tự cần ghép sẽ lớn, có thể khởi tạo `new StringBuilder(kichThuocDuKien)` để giảm số lần `StringBuilder` phải tự cấp phát lại mảng nội bộ khi đầy.

</details>

**7. Phương thức `intern()` của `String` làm gì? Khi nào nên cân nhắc dùng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

`intern()` trả về **bản trong String Pool** có cùng nội dung với chuỗi hiện tại — nếu pool đã có chuỗi giống hệt, trả về tham chiếu tới bản đó; nếu chưa có, thêm chuỗi hiện tại vào pool rồi trả về chính nó.

```java
String a = new String("Java").intern();
String b = "Java";
System.out.println(a == b); // true — nhờ intern(), a trỏ vào cùng object trong pool với b
```

- Cân nhắc dùng khi chương trình xử lý **rất nhiều chuỗi trùng lặp nội dung** được tạo động (ví dụ đọc hàng triệu dòng log, mỗi dòng parse ra vài chuỗi lặp lại nhiều lần) — gọi `intern()` giúp gom chúng lại dùng chung object, giảm bộ nhớ.
- Không nên lạm dụng: nếu chuỗi phần lớn là duy nhất (không lặp), `intern()` chỉ tốn thêm chi phí tra cứu pool mà không tiết kiệm được gì.

</details>

**8. `String` có phù hợp làm key cho `HashMap` không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Rất phù hợp**, và là lựa chọn phổ biến nhất cho key trong thực tế, nhờ hai đặc điểm:

- **Bất biến (immutable)**: một khi đã dùng làm key, nội dung (và do đó `hashCode()`) không thể bị thay đổi ngầm từ bên ngoài — tránh được lỗi "key bị đổi sau khi đưa vào Map khiến tra cứu sai bucket", vốn là rủi ro lớn nếu dùng một object mutable làm key.
- **`equals()` và `hashCode()` đã được cài đặt đúng đắn (well-defined)**: hai chuỗi có nội dung giống nhau luôn cho `hashCode()` giống nhau và `equals()` trả về `true` — đúng hợp đồng (contract) mà `HashMap` yêu cầu ở key.
- Thêm lợi thế hiệu năng: `String` **cache lại giá trị `hashCode()`** đã tính (tính một lần, lưu lại trong field nội bộ), nên các lần tra cứu Map sau không phải tính lại từ đầu.

</details>

**9. Đoạn code sau in ra `true`/`false` như thế nào ở mỗi dòng? Giải thích khái niệm compile-time constant liên quan tới String Pool.**

```java
public class Test {
    public static void main(String[] args) {
        String s1 = "ab";
        String s2 = "a" + "b";

        String x = "a";
        String s3 = x + "b";

        System.out.println(s1 == s2);
        System.out.println(s1 == s3);
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả: `s1 == s2` là **`true`**, `s1 == s3` là **`false`**.

- `"a" + "b"` khi cả hai vế đều là **literal cố định** (compile-time constant) được compiler **tính sẵn ngay lúc biên dịch** thành `"ab"`, rồi đưa thẳng vào String Pool — nên `s2` trỏ tới **cùng object** với `s1` trong pool.
- `x + "b"` thì `x` là một **biến**, giá trị của nó (dù không đổi lúc chạy) vẫn được compiler coi là chỉ biết ở **runtime**, nên phép nối chuỗi này được thực hiện thật lúc chương trình chạy (thường qua `StringBuilder` ẩn), tạo ra một object **mới trên heap**, không nằm trong pool — vì vậy `s1 == s3` là `false` dù nội dung hai chuỗi giống hệt nhau.
- Đây là lý do nhiều câu hỏi phỏng vấn dùng ví dụ này để kiểm tra hiểu biết sâu về String Pool, chứ không chỉ dừng ở "literal thì bằng nhau, `new String` thì không".

</details>

**10. `substring()` trong các bản Java cũ (trước Java 7u6) từng gây rò rỉ bộ nhớ (memory leak) như thế nào? Java hiện tại (7u6 trở lên) đã khắc phục ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Trước Java 7u6**: `String` lưu dữ liệu trong một mảng `char[]` dùng chung, cùng với hai chỉ số `offset` (điểm bắt đầu) và `count` (độ dài). Khi gọi `substring()`, chuỗi con **không copy mảng ký tự mới** mà chỉ tạo object `String` mới trỏ vào **cùng mảng gốc**, chỉ đổi `offset`/`count`. Hệ quả: nếu bạn cắt ra một chuỗi con rất ngắn từ một chuỗi gốc rất dài (ví dụ đọc một file text khổng lồ rồi chỉ giữ lại vài ký tự), toàn bộ mảng ký tự khổng lồ của chuỗi gốc **vẫn bị giữ trong bộ nhớ** chỉ vì chuỗi con nhỏ xíu còn tham chiếu tới nó — gây rò rỉ bộ nhớ âm thầm, khó phát hiện.
- **Từ Java 7u6 trở đi (và Java 8+)**: `substring()` được đổi cách cài đặt — luôn **copy** ra một mảng ký tự mới, độc lập với chuỗi gốc. Chuỗi con giờ chỉ chiếm đúng bộ nhớ tương ứng với độ dài của nó, không còn giữ cả mảng gốc.
- Đánh đổi: cách mới tốn thêm chi phí copy mỗi lần gọi `substring()`, nhưng đổi lại tránh được lớp lỗi rò rỉ bộ nhớ khó chẩn đoán — được đánh giá là đánh đổi hợp lý hơn cho đa số ứng dụng.

</details>

**11. Text block (Java 15+) là gì? Cho ví dụ cú pháp và nêu lợi ích so với nối chuỗi nhiều dòng bằng `+`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Text block** là cú pháp viết chuỗi nhiều dòng gọn gàng, được chính thức đưa vào từ **Java 15**, dùng ba dấu nháy kép `"""` để mở và đóng.

```java
// Trước đây: nối chuỗi nhiều dòng bằng +, khó đọc
String html1 = "<html>\n" +
               "  <body>\n" +
               "    <p>Xin chao</p>\n" +
               "  </body>\n" +
               "</html>\n";

// Từ Java 15: text block, giữ nguyên định dạng, dễ đọc hơn hẳn
String html2 = """
        <html>
          <body>
            <p>Xin chao</p>
          </body>
        </html>
        """;
```

Lợi ích:

- Không cần escape dấu nháy kép bên trong (`\"`) hay nối `+` giữa các dòng, giảm lỗi cú pháp.
- Java tự xử lý thụt lề (indentation) hợp lý dựa trên dòng đóng `"""`, giữ code nguồn dễ đọc mà không làm lệch định dạng chuỗi kết quả.
- Rất hữu ích khi viết chuỗi JSON, SQL, HTML mẫu ngay trong code Java mà không mất công escape.
- Kết quả trả về vẫn là một `String` bình thường (vẫn bất biến, vẫn dùng được mọi phương thức của `String`) — chỉ là cú pháp viết gọn hơn.

</details>

---

## 7. Toán tử và phép toán

Bài học: [7. Toán tử và phép toán](../../java/01-learn-the-basics/7_toan-tu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt "toán tử" (operator) và "toán hạng" (operand). Cho một ví dụ minh họa.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Toán tử**: ký hiệu thực hiện một phép tính hoặc thao tác, ví dụ `+`, `-`, `>`, `&&`.
- **Toán hạng**: giá trị hoặc biến mà toán tử tác động lên.

Ví dụ trong biểu thức `a + b * c`:
- `+` và `*` là toán tử.
- `a`, `b`, `c` là toán hạng.

Một số toán tử chỉ cần 1 toán hạng (toán tử một ngôi, ví dụ `!x`, `-x`, `x++`), số khác cần 2 toán hạng (toán tử hai ngôi, ví dụ `a + b`).

</details>

**2. `=` và `==` khác nhau thế nào? Vì sao nhầm lẫn hai toán tử này lại nguy hiểm?**

<details className="qa">
<summary>Xem đáp án</summary>

- `=` là **toán tử gán** — gán giá trị bên phải cho biến bên trái.
- `==` là **toán tử so sánh bằng** — trả về `boolean` (`true`/`false`) khi so sánh hai giá trị.

```java
int a = 5;      // gán 5 cho a
boolean b = (a == 5); // so sánh: true
```

Nguy hiểm vì với biến `boolean`, viết nhầm `if (dangDangNhap = true)` (gán) thay vì `if (dangDangNhap == true)` (so sánh) làm biến bị **ghi đè giá trị** và điều kiện luôn đúng — Java may mắn báo lỗi biên dịch trong trường hợp này vì kiểu không khớp (`int` gán cho `boolean`), nhưng nếu cả hai vế đều là `boolean` thì code vẫn biên dịch được và gây bug âm thầm rất khó phát hiện.

</details>

**3. Toán tử `%` (modulo) hoạt động thế nào? Với số âm, kết quả mang dấu của số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`%` trả về **phần dư** của phép chia nguyên. Trong Java, dấu của kết quả `%` luôn theo dấu của **số bị chia** (toán hạng bên trái), không theo số chia:

```java
System.out.println(7 % 3);   // 1
System.out.println(-7 % 3);  // -1 (theo dấu của -7)
System.out.println(7 % -3);  // 1  (theo dấu của 7)
```

Ứng dụng phổ biến: kiểm tra chẵn/lẻ (`n % 2 == 0`), lấy phần tử theo vòng (circular index: `i % array.length`).

</details>

**4. Toán tử đoản mạch (`&&`, `||`) khác gì với `&`, `|` khi dùng cho `boolean`? Cho một tình huống thực tế nơi đoản mạch giúp tránh lỗi.**

<details className="qa">
<summary>Xem đáp án</summary>

- `&&`, `||` là **đoản mạch** (short-circuit): dừng đánh giá ngay khi biết chắc kết quả — với `&&`, vế đầu sai thì không xét vế sau; với `||`, vế đầu đúng thì bỏ qua vế sau.
- `&`, `|` (khi dùng với `boolean`) luôn đánh giá **cả hai vế**, dù kết quả vế đầu đã đủ để quyết định.

Tình huống thực tế: tránh `NullPointerException` khi kiểm tra null trước rồi mới gọi method:

```java
String ten = null;
if (ten != null && ten.length() > 0) {
    // an toàn: vì ten != null sai nên && dừng lại, không gọi ten.length()
}
```

Nếu dùng `&` thay `&&`, Java vẫn sẽ đánh giá `ten.length()` dù `ten` là `null`, gây `NullPointerException` ngay lập tức.

</details>

**5. Output của đoạn code sau là gì? Giải thích từng bước.**

```java
int x = 5;
int y = x++ + ++x;
System.out.println(x + " " + y);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output: `x = 7, y = 12`**

Diễn giải từng bước:
1. `x++` (hậu tố): lấy giá trị **cũ** của `x` là `5` để tính, sau đó `x` tăng lên `6`.
2. `++x` (tiền tố): tăng `x` từ `6` lên `7` **trước**, rồi lấy giá trị mới `7` để tính.
3. `y = 5 + 7 = 12`.
4. Cuối cùng `x` bằng `7` (đã tăng hai lần: `5 → 6 → 7`).

Đây là lỗi rất dễ mắc khi trộn `x++`/`++x` nhiều lần trong cùng một biểu thức — nên tránh viết code kiểu này trong thực tế vì khó đọc.

</details>

**6. Output của đoạn code sau là gì?**

```java
int ketQua = 10 - 2 * 3 + 4 / 2;
System.out.println(ketQua);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output: `6`**

Theo thứ tự ưu tiên, `*` và `/` được tính trước `+` và `-`, sau đó Java tính từ trái sang phải giữa các toán tử cùng cấp:

1. `2 * 3 = 6`
2. `4 / 2 = 2`
3. `10 - 6 + 2` → tính từ trái sang phải: `10 - 6 = 4`, rồi `4 + 2 = 6`.

Trong thực tế phỏng vấn, câu này thường được hỏi tiếp: nếu đổi thành `10 - (2 * 3 + 4) / 2` thì kết quả khác hẳn — minh chứng vì sao nên dùng `()` khi biểu thức phức tạp.

</details>

**7. Vì sao `0.1 + 0.2 == 0.3` trả về `false` trong Java? Nên so sánh hai số `double` thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `double` lưu số thực dưới dạng **dấu phẩy động nhị phân** (binary floating-point) theo chuẩn IEEE 754, và nhiều số thập phân (như `0.1`, `0.2`) **không biểu diễn chính xác tuyệt đối** ở hệ nhị phân — giống như `1/3` không viết hết được ở hệ thập phân. Kết quả thực tế của `0.1 + 0.2` là `0.30000000000000004`, khác với giá trị literal `0.3`.

Cách so sánh đúng: dùng một **sai số cho phép** (epsilon):

```java
double a = 0.1 + 0.2;
double b = 0.3;
boolean ganBang = Math.abs(a - b) < 1e-9; // true
```

Nếu cần độ chính xác tuyệt đối (ví dụ tính tiền), nên dùng `BigDecimal` thay vì `double`/`float`.

</details>

**8. Số nguyên `int` bị tràn (overflow) khi tính toán thì điều gì xảy ra? Cho ví dụ và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

`int` trong Java chiếm 32 bit, có giới hạn từ `Integer.MIN_VALUE` (`-2147483648`) đến `Integer.MAX_VALUE` (`2147483647`). Khi phép tính vượt giới hạn này, Java **không báo lỗi** mà **quay vòng** (wrap around) sang phía đối diện:

```java
int max = Integer.MAX_VALUE;
System.out.println(max + 1); // -2147483648 (tràn xuống MIN_VALUE)
```

Cách phòng tránh:
- Dùng `long` nếu giá trị có thể lớn hơn phạm vi `int`.
- Dùng `Math.addExact`, `Math.multiplyExact`... (ném `ArithmeticException` khi tràn) để phát hiện sớm thay vì để lỗi âm thầm.
- Với số cực lớn, cân nhắc `BigInteger`.

</details>

**9. Tình huống: bạn viết điều kiện kiểm tra đơn hàng hợp lệ là `soLuong > 0 && soLuong <= tonKho && giaTien >= 0`. Vì sao nên đặt các điều kiện rẻ/dễ sai trước, và thứ tự này có ảnh hưởng gì tới hiệu năng và độ an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhờ cơ chế **đoản mạch** của `&&`, Java đánh giá từ trái sang phải và dừng ngay khi gặp điều kiện sai — nên:

- **Hiệu năng**: nên đặt điều kiện **rẻ và dễ sai nhất** lên trước (ví dụ kiểm tra `soLuong > 0` trước khi làm phép tính hay gọi hàm tốn kém), để tránh tính toán không cần thiết ở các vế sau.
- **An toàn**: nếu một điều kiện phía sau phụ thuộc vào điều kiện phía trước để không bị lỗi (ví dụ kiểm tra `obj != null` trước khi gọi method trên `obj`), thứ tự **bắt buộc** phải đúng — đảo ngược thứ tự có thể gây `NullPointerException` hoặc lỗi runtime khác.

Ví dụ thực tế:

```java
if (gioHang != null && !gioHang.isEmpty() && gioHang.get(0).getGiaTien() >= 0) {
    // an toàn: kiểm tra null trước, rồi mới truy cập phần tử
}
```

</details>

---

## 8. Mảng (Arrays)

Bài học: [8. Mảng (Arrays)](../../java/01-learn-the-basics/8_mang.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mảng (array) là gì? Đặc điểm quan trọng nhất phân biệt mảng với các cấu trúc dữ liệu khác như `ArrayList` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Mảng** là một dãy các phần tử **cùng kiểu dữ liệu**, được đánh **chỉ số** (index) liên tục bắt đầu từ `0`, lưu trong một vùng nhớ liền kề.

Đặc điểm quan trọng nhất: **kích thước cố định** (fixed size) — một khi đã tạo mảng với `new int[5]`, bạn không thể thêm/bớt phần tử, chỉ có thể đọc/ghi giá trị vào các ô có sẵn. Ngược lại, `ArrayList` (học ở phần Collection) có thể co giãn kích thước linh hoạt khi thêm/xóa phần tử.

</details>

**2. Phân biệt `.length` (trên mảng) và `.length()` (trên `String`).**

<details className="qa">
<summary>Xem đáp án</summary>

- `array.length` — là một **thuộc tính** (field), không có dấu ngoặc, dùng cho mảng.
- `str.length()` — là một **phương thức** (method), có dấu ngoặc, dùng cho `String`.

```java
int[] so = {1, 2, 3};
String ten = "Java";

System.out.println(so.length);   // 3  — không có ()
System.out.println(ten.length()); // 4  — bắt buộc có ()
```

Nhầm lẫn hai cú pháp này (viết `so.length()` hoặc `ten.length`) sẽ gây lỗi biên dịch.

</details>

**3. Khi khai báo `int[] a = new int[5];` và `String[] b = new String[5];`, các phần tử có giá trị mặc định là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Java tự động khởi tạo giá trị mặc định theo kiểu dữ liệu:

| Kiểu phần tử | Giá trị mặc định |
|---|---|
| Số nguyên (`int`, `long`...) | `0` |
| Số thực (`double`, `float`) | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` (ký tự rỗng) |
| Kiểu tham chiếu (`String`, object...) | `null` |

Với `String[] b = new String[5]`, mỗi phần tử là `null` chứ **không phải** chuỗi rỗng `""` — gọi `b[0].length()` sẽ ném `NullPointerException`.

</details>

**4. So sánh vòng `for` thường và vòng `for-each` khi duyệt mảng. Khi nào bắt buộc phải dùng `for` thường?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `for` thường | `for-each` |
|---|---|---|
| Biết chỉ số phần tử | Có (`i`) | Không |
| Sửa được giá trị phần tử | Có (`a[i] = ...`) | Không (biến lặp chỉ là bản sao giá trị) |
| Độ gọn | Dài hơn | Ngắn gọn hơn |
| Duyệt ngược, bỏ qua phần tử | Dễ dàng | Khó/không làm được |

`for-each` chỉ phù hợp khi **chỉ cần đọc** giá trị lần lượt. Khi cần **ghi đè phần tử**, biết **vị trí** (ví dụ để in "phần tử thứ mấy"), hoặc duyệt theo thứ tự đặc biệt (ngược, cách quãng), bắt buộc phải dùng `for` thường với chỉ số.

</details>

**5. Đoạn code sau chạy có vấn đề gì? Giải thích lỗi và cách sửa.**

```java
int[] so = {10, 20, 30, 40};
for (int i = 0; i <= so.length; i++) {
    System.out.println(so[i]);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi ở điều kiện `i <= so.length` — mảng có `4` phần tử với chỉ số hợp lệ từ `0` đến `3` (`so.length - 1`), nhưng vòng lặp cho phép `i` chạy tới `4` (bằng `so.length`). Khi `i = 4`, `so[4]` không tồn tại nên chương trình ném ra `ArrayIndexOutOfBoundsException` lúc chạy.

Cách sửa: đổi điều kiện thành `i < so.length` (dùng `<` thay vì `<=`).

</details>

**6. Output của đoạn code duyệt mảng hai chiều sau là gì?**

```java
int[][] bang = {
    {1, 2, 3},
    {4, 5, 6}
};

int tong = 0;
for (int h = 0; h < bang.length; h++) {
    for (int c = 0; c < bang[h].length; c++) {
        tong += bang[h][c];
    }
}
System.out.println(tong);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output: `21`**

`bang.length` là số hàng (`2`), `bang[h].length` là số cột của hàng `h` (ở đây đều là `3`). Vòng lặp cộng dồn toàn bộ phần tử: `1+2+3+4+5+6 = 21`.

Lưu ý mở rộng: với mảng hai chiều **không đều** (jagged array — mỗi hàng có số cột khác nhau), `bang[h].length` vẫn đúng vì nó lấy độ dài của **hàng thứ h**, không phải một giá trị cố định chung cho cả bảng.

</details>

**7. Mảng có phải là một object trong Java không? Khi truyền mảng vào một method, sửa đổi bên trong method có ảnh hưởng ra ngoài không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, **mảng là object** trong Java (kể cả mảng kiểu nguyên thủy như `int[]`), được cấp phát trên heap và biến mảng chỉ lưu **tham chiếu** (địa chỉ) tới vùng nhớ đó.

Java luôn truyền tham trị (pass-by-value), nhưng với object/mảng, giá trị được truyền là **tham chiếu**, nên:

```java
static void sua(int[] a) {
    a[0] = 999;      // SỬA nội dung qua tham chiếu → ảnh hưởng ra ngoài
    a = new int[3];  // GÁN LẠI biến cục bộ a trỏ tới mảng mới → không ảnh hưởng ra ngoài
}
```

- Thay đổi **nội dung phần tử** của mảng (`a[0] = 999`) sẽ ảnh hưởng tới mảng gốc bên ngoài, vì cả hai biến cùng trỏ tới một vùng nhớ.
- Gán lại biến `a` để trỏ sang một mảng khác chỉ thay đổi tham chiếu cục bộ bên trong method, không ảnh hưởng biến gốc bên ngoài.

</details>

**8. Vì sao `mang1 == mang2` thường cho kết quả `false` dù hai mảng có nội dung giống hệt nhau? Nên so sánh nội dung mảng bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Toán tử `==` trên mảng (là object) so sánh **địa chỉ tham chiếu**, không so sánh nội dung. Hai mảng được tạo riêng biệt dù chứa cùng giá trị vẫn là hai object khác nhau trong bộ nhớ:

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(a == b);              // false — khác địa chỉ
System.out.println(Arrays.equals(a, b)); // true  — so sánh nội dung
```

Muốn so sánh **nội dung từng phần tử**, dùng `Arrays.equals(a, b)` (mảng một chiều) hoặc `Arrays.deepEquals(a, b)` (mảng nhiều chiều).

</details>

**9. `int[] b = a;` và `int[] b = Arrays.copyOf(a, a.length);` khác nhau thế nào? Vì sao sự khác biệt này quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

- `int[] b = a;` — chỉ **sao chép tham chiếu**, `b` và `a` cùng trỏ tới **một** mảng trong bộ nhớ. Sửa `b[0]` cũng làm `a[0]` thay đổi theo.
- `Arrays.copyOf(a, a.length)` (hoặc `a.clone()`) — tạo ra một **mảng mới** với nội dung được sao chép, `b` và `a` là hai vùng nhớ độc lập.

```java
int[] a = {1, 2, 3};
int[] b = a;
b[0] = 99;
System.out.println(a[0]); // 99 — a cũng bị đổi!

int[] c = Arrays.copyOf(a, a.length);
c[0] = 5;
System.out.println(a[0]); // 99 — a không đổi
```

Quan trọng vì bug loại này rất khó phát hiện: code tưởng đang làm việc trên "bản sao" nhưng thực chất đang sửa trực tiếp dữ liệu gốc, gây tác dụng phụ (side effect) ngoài ý muốn — nhất là khi truyền mảng qua nhiều method.

</details>

**10. Tình huống: bạn cần lưu danh sách tên sản phẩm nhưng số lượng sản phẩm thay đổi liên tục (thêm/xóa trong lúc chạy). Dùng mảng có phù hợp không? Nên chọn cấu trúc dữ liệu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mảng **không phù hợp** cho trường hợp này vì kích thước cố định — muốn "thêm" một phần tử thực chất phải tạo mảng mới lớn hơn rồi copy toàn bộ dữ liệu cũ sang (tốn kém và dễ lỗi nếu tự cài đặt thủ công).

Nên dùng `ArrayList<String>` (thuộc Java Collections Framework, sẽ học ở bài sau): hỗ trợ sẵn `add`, `remove`, tự động co giãn kích thước bên trong, code gọn và an toàn hơn nhiều so với tự quản lý mảng động.

Mảng vẫn nên dùng khi: biết trước và **cố định** số lượng phần tử, cần hiệu năng tối đa (không có overhead của Collection), hoặc làm việc với dữ liệu kiểu nguyên thủy số lượng lớn (ví dụ xử lý ảnh, ma trận số).

</details>

---

## 9. Câu điều kiện

Bài học: [9. Câu điều kiện](../../java/01-learn-the-basics/9_cau-dieu-kien.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Câu điều kiện (conditional statement) là gì? Biểu thức bên trong `if (...)` bắt buộc phải trả về kiểu dữ liệu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Câu điều kiện** là câu lệnh cho phép chương trình rẽ nhánh — chạy khối lệnh khác nhau tùy vào một điều kiện đúng hay sai, thay vì luôn chạy tuần tự từ trên xuống.

Biểu thức trong `if (...)` bắt buộc phải là kiểu **`boolean`** (`true` hoặc `false`). Khác với C/C++ (cho phép số nguyên khác `0` được coi là đúng), Java **không tự động** coi số khác `0` là `true` — viết `if (x)` với `x` là `int` sẽ báo lỗi biên dịch, phải viết rõ `if (x != 0)`.

</details>

**2. Toán tử ba ngôi (`?:`) nên dùng khi nào và nên tránh khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng khi:
- Chỉ cần **chọn một trong hai giá trị đơn giản** để gán hoặc trả về, ví dụ `String loai = (tuoi >= 18) ? "Nguoi lon" : "Tre em";`.
- Biểu thức ngắn, đọc một lần là hiểu ngay.

Nên tránh khi:
- Logic phức tạp, có nhiều điều kiện lồng nhau (`a ? (b ? x : y) : z`) — rất khó đọc.
- Cần thực hiện **nhiều câu lệnh** (side effect) chứ không chỉ trả về một giá trị — lúc này `if-else` rõ ràng hơn.

Quy tắc chung: ba ngôi phục vụ việc **gán giá trị**, còn `if-else` phục vụ việc **rẽ nhánh hành động**.

</details>

**3. Fall-through trong `switch` (kiểu cũ) là gì? Vì sao nó xảy ra và cách tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

**Fall-through** (rơi xuyên case) là hiện tượng khi một `case` khớp nhưng không có `break`, chương trình **tiếp tục chạy** cả các `case` phía dưới nó, bất kể chúng có khớp giá trị hay không — cho tới khi gặp `break` hoặc hết `switch`.

```java
int thu = 2;
switch (thu) {
    case 2:
        System.out.println("Thu Hai");
        // thiếu break!
    case 3:
        System.out.println("Thu Ba"); // vẫn chạy dù thu != 3
        break;
}
// In ra CẢ HAI dòng "Thu Hai" và "Thu Ba"
```

Cách tránh: luôn thêm `break` (hoặc `return`) cuối mỗi `case`, hoặc chuyển hẳn sang dùng **switch expression** (`->`) vì kiểu mới không bị fall-through.

</details>

**4. So sánh chi tiết `switch` statement (kiểu cũ, dùng `:`) và `switch` expression (kiểu mới, dùng `->`, Java 14+).**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | switch statement (cũ) | switch expression (mới, Java 14+) |
|---|---|---|
| Cú pháp nhánh | `case x:` | `case x ->` |
| Cần `break` | Có, bắt buộc để tránh fall-through | Không cần, mỗi nhánh tự dừng |
| Fall-through | Có thể xảy ra nếu quên `break` | Không xảy ra |
| Trả về giá trị trực tiếp | Không (phải gán biến trong từng case) | Có (`switch` là một biểu thức) |
| Nhiều giá trị trong 1 nhánh | Viết nhiều `case` liên tiếp | Gộp bằng dấu phẩy: `case 1, 7 ->` |
| Thân nhánh nhiều lệnh | Bình thường trong khối `{ }` | Dùng `{ ... yield giá_trị; }` |

Cả hai vẫn cùng tồn tại trong Java hiện đại; switch expression được khuyến khích dùng khi cần **gán/trả về giá trị** vì an toàn và ngắn gọn hơn.

</details>

**5. Output của đoạn code sau là gì?**

```java
int diem = 68;
String xepLoai;

if (diem >= 90) {
    xepLoai = "Gioi";
} else if (diem >= 70) {
    xepLoai = "Kha";
} else if (diem >= 50) {
    xepLoai = "Trung binh";
} else {
    xepLoai = "Yeu";
}

System.out.println(xepLoai);
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output: `Trung binh`**

Java xét điều kiện từ trên xuống, dừng ở điều kiện đúng **đầu tiên**:
- `68 >= 90` → sai, bỏ qua.
- `68 >= 70` → sai, bỏ qua.
- `68 >= 50` → **đúng** → gán `xepLoai = "Trung binh"` rồi thoát khỏi toàn bộ chuỗi `if/else if/else`, không xét tiếp `else`.

</details>

**6. Đoạn code sau in ra gì? Chỉ ra lỗi (nếu có).**

```java
int thu = 5;
switch (thu) {
    case 2:
        System.out.println("Thu Hai");
        break;
    case 5:
        System.out.println("Thu Sau");
    case 6:
        System.out.println("Thu Bay");
        break;
    default:
        System.out.println("Khong xac dinh");
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Output:**
```
Thu Sau
Thu Bay
```

Lỗi: `case 5` khớp và in `"Thu Sau"`, nhưng **thiếu `break`** nên chương trình **rơi tiếp** (fall-through) xuống `case 6`, in luôn `"Thu Bay"`, rồi mới gặp `break` và dừng lại. Đây chính là bug fall-through kinh điển — nếu ý định ban đầu chỉ muốn in một dòng cho `thu == 5`, cần thêm `break;` ngay sau dòng `System.out.println("Thu Sau");`.

</details>

**7. Vì sao so sánh hai chuỗi bằng `==` trong `if` thường gây lỗi logic? Nên dùng gì thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

`String` là kiểu tham chiếu (object), nên `==` so sánh **địa chỉ trong bộ nhớ**, không so sánh **nội dung** ký tự. Hai chuỗi có cùng nội dung nhưng được tạo ra ở hai vị trí bộ nhớ khác nhau (ví dụ một chuỗi tạo bằng `new String(...)`) sẽ cho `==` trả về `false` dù "nhìn giống hệt nhau":

```java
String a = new String("abc");
String b = "abc";
System.out.println(a == b);        // false — khác địa chỉ
System.out.println(a.equals(b));   // true  — so sánh nội dung
```

Luôn dùng `.equals()` (hoặc `.equalsIgnoreCase()`) để so sánh **nội dung** chuỗi trong điều kiện `if`.

*Lưu ý:* hai literal string như `"abc" == "abc"` thường ra `true` nhờ cơ chế **string pool** (Java tái sử dụng chuỗi hằng giống nhau), nhưng đây là chi tiết cài đặt không nên dựa vào — vẫn luôn dùng `.equals()` cho an toàn.

</details>

**8. Từ Java 21, `switch` có thể xử lý `case null` trực tiếp. Khác biệt với switch truyền thống khi biến là `null` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `switch` truyền thống (cả kiểu cũ lẫn switch expression trước khi có tính năng này), nếu biến đem `switch` là **kiểu tham chiếu** (`String`, enum, wrapper class...) và giá trị đang là `null`, chương trình sẽ ném **`NullPointerException`** ngay khi vào `switch`, vì Java phải "mở hộp"/gọi `equals`/`hashCode` trên giá trị null.

Từ **Java 21** (phần của pattern matching for switch, JEP 441), có thể khai báo riêng `case null` để xử lý tường minh, tránh phải kiểm tra `null` bằng `if` riêng bên ngoài:

```java
String ten = null;
String ketQua = switch (ten) {
    case null -> "Khong co ten";
    case "Admin" -> "Quan tri vien";
    default -> "Nguoi dung thuong";
};
System.out.println(ketQua); // "Khong co ten"
```

</details>

**9. Tình huống thiết kế: một method có tới 6 tầng `if-else if` lồng nhau để xử lý xếp loại/phân luồng nghiệp vụ, code trở nên khó đọc và khó bảo trì. Bạn refactor thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vài hướng refactor phổ biến, thường kết hợp nhiều cách:

- **Early return** (trả về sớm): với mỗi điều kiện, `return` ngay thay vì lồng thêm một tầng `else` — giảm độ sâu lồng nhau đáng kể.
- **Chuyển sang `switch` expression** nếu các nhánh so sánh cùng một biến với các giá trị rời rạc — vừa gọn vừa tránh fall-through.
- **Trích xuất phương thức riêng** cho từng nhánh logic phức tạp, giữ hàm chính ngắn và dễ đọc (tên hàm thay cho comment).
- **Bảng tra cứu (lookup table/`Map`)**: khi mỗi nhánh chỉ ánh xạ điều kiện sang một hành động/giá trị cố định, dùng `Map<Điều_kiện, Hành_động>` thay vì chuỗi if-else dài.
- **Strategy pattern**: khi mỗi nhánh là cả một khối xử lý phức tạp khác nhau về hành vi (không chỉ trả về giá trị đơn giản), tách mỗi nhánh thành một class/implementation riêng.

Nguyên tắc chung: giữ độ sâu lồng nhau không quá 3-4 cấp, ưu tiên đọc từ trên xuống dễ hiểu hơn là tối ưu số dòng code.

</details>

**10. Pattern matching cho switch (Java 21) khác gì so với switch truyền thống? Cho ví dụ minh họa lợi ích của nó.**

<details className="qa">
<summary>Xem đáp án</summary>

**Pattern matching for switch** (JEP 441, chính thức từ Java 21) cho phép mỗi `case` không chỉ so khớp **giá trị cố định** mà còn so khớp theo **kiểu dữ liệu** (type pattern) và trích xuất biến ngay tại chỗ, kèm điều kiện lọc thêm (**guarded pattern** dùng `when`):

```java
Object obj = 42;

String ketQua = switch (obj) {
    case Integer i when i > 100 -> "So nguyen lon: " + i;
    case Integer i -> "So nguyen: " + i;
    case String s -> "Chuoi: " + s;
    case null -> "Gia tri null";
    default -> "Kieu khac";
};
System.out.println(ketQua); // "So nguyen: 42"
```

Lợi ích: thay thế được chuỗi `if (obj instanceof Integer) { Integer i = (Integer) obj; ... }` dài dòng và dễ quên ép kiểu, giúp code xử lý theo kiểu dữ liệu (đặc biệt hữu ích với `sealed` class/interface) ngắn gọn, an toàn kiểu và dễ đọc hơn hẳn.

</details>

---

## 10. Vòng lặp (Loops)

Bài học: [10. Vòng lặp (Loops)](../../java/01-learn-the-basics/10_vong-lap.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vòng lặp (loop) là gì và Java có những loại vòng lặp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Vòng lặp** là cấu trúc điều khiển cho phép lặp lại một khối lệnh nhiều lần thay vì viết tay từng dòng lặp lại. Java có 4 loại chính:

- `for` — dùng khi biết trước số lần lặp, gồm 3 phần: khởi tạo, điều kiện, bước nhảy.
- `while` — lặp chừng nào điều kiện còn đúng, kiểm tra điều kiện **trước**.
- `do-while` — giống `while` nhưng kiểm tra điều kiện **sau**, nên luôn chạy thân vòng ít nhất 1 lần.
- `for-each` (enhanced for) — duyệt từng phần tử của mảng/collection mà không cần quản lý chỉ số.

</details>

**2. So sánh `for` và `while`. Khi nào nên dùng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `for` | `while` |
|---|---|---|
| Số lần lặp | Biết trước (hoặc tính được) | Không biết trước, phụ thuộc điều kiện |
| Cấu trúc | Khởi tạo + điều kiện + bước nhảy gọn trong 1 dòng | Chỉ có điều kiện; khởi tạo/cập nhật viết rời |
| Ví dụ điển hình | Duyệt mảng theo chỉ số, đếm từ 1 đến n | Đọc dữ liệu tới khi hết, chờ nhập đúng |

Hai vòng lặp này có thể chuyển đổi qua lại về bản chất — khác biệt chủ yếu là **cách trình bày** giúp code dễ đọc theo đúng ý định. Dùng `for` khi số lần lặp rõ ràng ngay từ đầu; dùng `while` khi điều kiện dừng phụ thuộc trạng thái lúc chạy (ví dụ đọc file tới khi hết dòng).

</details>

**3. Phân biệt `while` và `do-while`. Cho một tình huống thực tế nên dùng `do-while`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `while`: kiểm tra điều kiện **trước** khi chạy thân vòng → có thể chạy 0 lần nếu điều kiện sai ngay từ đầu.
- `do-while`: chạy thân vòng **trước**, kiểm tra điều kiện **sau** → luôn chạy tối thiểu 1 lần dù điều kiện sai ngay từ đầu.

Tình huống phù hợp: hiển thị menu và đọc lựa chọn của người dùng — luôn cần hiện menu ít nhất 1 lần trước khi biết người dùng có muốn thoát hay không:

```java
int luaChon;
do {
    System.out.println("1. Xem so du | 2. Nap tien | 0. Thoat");
    luaChon = docLuaChon(); // giả định hàm đọc input
} while (luaChon != 0);
```

</details>

**4. `for-each` hoạt động thế nào? Ưu điểm và hạn chế so với `for` truyền thống?**

<details className="qa">
<summary>Xem đáp án</summary>

`for-each` (`for (Kieu bien : mang)`) tự động duyệt qua từng phần tử mà không cần khai báo và quản lý chỉ số.

Ưu điểm:
- Code ngắn gọn, ít khả năng sai chỉ số (off-by-one, tràn mảng).
- Đọc dễ hiểu: "với mỗi phần tử trong tập hợp, làm việc X".

Hạn chế:
- Không có sẵn chỉ số của phần tử đang duyệt.
- Không thể sửa trực tiếp phần tử theo vị trí trong mảng nguyên thủy qua biến lặp (biến lặp chỉ là bản sao giá trị).
- Không duyệt ngược hay nhảy cách phần tử được.

→ Dùng `for-each` khi chỉ cần **đọc** tuần tự; dùng `for` khi cần chỉ số hoặc sửa phần tử theo vị trí.

</details>

**5. `break` và `continue` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `break`: thoát **hẳn** khỏi vòng lặp đang chạy, nhảy ra ngoài ngay lập tức, các lần lặp còn lại không chạy nữa.
- `continue`: bỏ qua phần **còn lại** của lần lặp hiện tại, nhảy thẳng tới bước kiểm tra/tăng biến để bắt đầu lần lặp kế tiếp.

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) break;     // dừng hẳn khi i = 3 -> in 1, 2
    System.out.println(i);
}
for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;  // bỏ qua i = 3 -> in 1, 2, 4, 5
    System.out.println(i);
}
```

</details>

**6. Đoạn code sau in ra gì?**

```java
int tong = 0;
for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) {
        continue;
    }
    tong += i;
}
System.out.println("Tong: " + tong);
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả: `Tong: 9`.

Vòng lặp chạy `i` từ 1 đến 5; `continue` bỏ qua các số chẵn (2 và 4), chỉ cộng các số lẻ vào `tong`: `1 + 3 + 5 = 9`.

</details>

**7. Đoạn code sau có bug gì? Sửa lại cho đúng.**

```java
int[] diem = {8, 9, 7};
for (int i = 0; i <= diem.length; i++) {
    System.out.println(diem[i]);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là lỗi **lệch một đơn vị** (off-by-one): điều kiện dùng `i <= diem.length` (tức chạy tới `i = 3`) trong khi chỉ số hợp lệ của mảng chỉ chạy từ `0` đến `length - 1` (tức `0, 1, 2`). Khi `i = 3`, `diem[3]` không tồn tại → ném `ArrayIndexOutOfBoundsException` lúc chạy.

Sửa lại bằng cách đổi thành `i < diem.length`:

```java
for (int i = 0; i < diem.length; i++) {
    System.out.println(diem[i]);
}
```

Hoặc dùng `for-each` để tránh hoàn toàn lỗi chỉ số:

```java
for (int d : diem) {
    System.out.println(d);
}
```

</details>

**8. Đoạn code sau chạy có vấn đề gì?**

```java
int dem = 1;
while (dem <= 5) {
    System.out.println("Dem = " + dem);
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Đây là **vòng lặp vô hạn** (infinite loop): thân vòng quên cập nhật biến `dem`, nên điều kiện luôn đúng mãi mãi, chương trình không bao giờ dừng và sẽ in `Dem = 1` liên tục cho tới khi bị dừng thủ công (hoặc hết tài nguyên).

Sửa lại bằng cách thêm bước cập nhật biến điều kiện trong thân vòng:

```java
int dem = 1;
while (dem <= 5) {
    System.out.println("Dem = " + dem);
    dem++;
}
```

</details>

**9. Trong vòng lặp lồng nhau, `break` ở vòng trong sẽ thoát khỏi vòng nào? Làm sao thoát cả hai vòng cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

`break` chỉ thoát khỏi vòng lặp **gần nhất** chứa nó — tức vòng trong; vòng ngoài vẫn tiếp tục chạy các lần lặp còn lại.

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (j == 2) break; // chỉ thoát vòng j, vòng i vẫn tiếp tục
        System.out.println(i + "-" + j);
    }
}
```

Để thoát cả hai vòng cùng lúc, Java hỗ trợ **nhãn** (labeled break) — đặt tên trước vòng ngoài rồi `break` kèm tên nhãn:

```java
ngoai:
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (i == 2 && j == 2) break ngoai; // thoát hẳn cả 2 vòng
        System.out.println(i + "-" + j);
    }
}
```

</details>

**10. Bạn cần viết vòng lặp thử kết nối lại một dịch vụ tối đa 3 lần, dừng sớm nếu kết nối thành công. Nên dùng loại vòng lặp nào và thiết kế ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng `for` vì đã biết trước giới hạn số lần thử tối đa (3 lần), kết hợp `break` để dừng sớm ngay khi thành công:

```java
boolean thanhCong = false;
for (int lanThu = 1; lanThu <= 3; lanThu++) {
    thanhCong = ketNoi(); // giả định trả về true/false
    if (thanhCong) {
        System.out.println("Ket noi thanh cong o lan " + lanThu);
        break; // không cần thử tiếp
    }
    System.out.println("Lan " + lanThu + " that bai, thu lai...");
}
if (!thanhCong) {
    System.out.println("Khong the ket noi sau 3 lan thu");
}
```

Nếu số lần thử không cố định (ví dụ thử cho tới khi thành công hoặc hết thời gian timeout), `while` sẽ phù hợp hơn vì điều kiện dừng phụ thuộc trạng thái lúc chạy chứ không phải một con số cố định trước.

</details>

---

## 11. Giới thiệu về OOP

Bài học: [11. Giới thiệu về OOP](../../java/01-learn-the-basics/11_gioi-thieu-oop.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. OOP là gì? Nêu bốn trụ cột của OOP.**

<details className="qa">
<summary>Xem đáp án</summary>

**OOP** (Object-Oriented Programming — lập trình hướng đối tượng) là cách tổ chức chương trình xoay quanh các **đối tượng** (object), mỗi đối tượng gói chung **dữ liệu** (thuộc tính) và **hành vi** (phương thức) mô phỏng một thực thể trong đời thực.

Bốn trụ cột của OOP:

- **Đóng gói** (Encapsulation) — ẩn dữ liệu, kiểm soát truy cập qua phương thức.
- **Kế thừa** (Inheritance) — lớp con tái sử dụng thuộc tính/hành vi của lớp cha.
- **Đa hình** (Polymorphism) — cùng một hành động nhưng hành vi khác nhau tùy đối tượng.
- **Trừu tượng** (Abstraction) — chỉ phơi bày những gì cần thiết, ẩn chi tiết phức tạp.

</details>

**2. Phân biệt lớp (`class`) và đối tượng (object). Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Lớp** (`class`) là **bản thiết kế/khuôn mẫu** mô tả một loại đối tượng: khai báo có những thuộc tính gì, làm được những hành vi gì, nhưng bản thân lớp không chiếm bộ nhớ cho dữ liệu thật.
- **Đối tượng** (object) là **thực thể cụ thể** được tạo ra từ lớp bằng từ khóa `new`, tồn tại thật trong bộ nhớ với giá trị riêng.

```java
class SinhVien {       // lớp: bản thiết kế
    String ten;
    int tuoi;
}

SinhVien sv1 = new SinhVien(); // đối tượng thứ nhất
sv1.ten = "An";
SinhVien sv2 = new SinhVien(); // đối tượng thứ hai, độc lập với sv1
sv2.ten = "Binh";
```

Từ một lớp `SinhVien` có thể tạo ra vô số đối tượng khác nhau, giống như từ một bản vẽ nhà có thể xây nhiều căn nhà.

</details>

**3. Vì sao OOP ra đời? So sánh với lập trình thủ tục (procedural).**

<details className="qa">
<summary>Xem đáp án</summary>

Lập trình thủ tục viết chương trình như một dãy hàm xử lý dữ liệu **rời rạc** — dữ liệu (thường là biến toàn cục) và hàm xử lý tách biệt nhau, ai cũng có thể sửa dữ liệu ở bất kỳ đâu, dẫn tới khó kiểm soát và khó mở rộng khi chương trình lớn dần.

| Tiêu chí | Thủ tục (procedural) | OOP |
|---|---|---|
| Tổ chức | Hàm xử lý dữ liệu rời rạc | Dữ liệu + hành vi gói chung trong đối tượng |
| Kiểm soát truy cập | Biến toàn cục, sửa tự do | Đóng gói, kiểm soát qua phương thức |
| Tái sử dụng | Sao chép hàm | Kế thừa, đa hình |
| Mô phỏng thực tế | Khó, phải tự quy ước | Tự nhiên hơn (đối tượng ánh xạ sự vật) |

OOP giải quyết vấn đề trên bằng cách gom dữ liệu và hành vi vào **đối tượng**, dựa trên 4 trụ cột giúp code dễ bảo trì, mở rộng và mô phỏng đúng nghiệp vụ hơn.

</details>

**4. Đóng gói (Encapsulation) là gì? Vì sao nên khai báo thuộc tính `private` thay vì để công khai?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đóng gói** là việc giấu dữ liệu bên trong đối tượng (`private`), chỉ cho phép truy cập/thay đổi thông qua các phương thức công khai (`public`) đã được kiểm soát.

Nếu để thuộc tính `public`, bất kỳ đoạn code nào cũng có thể gán giá trị bừa bãi, phá vỡ tính hợp lệ của dữ liệu:

```java
class TaiKhoan {
    public double soDu; // KHÔNG kiểm soát được
}
tk.soDu = -1000; // gán âm tùy ý -> sai nghiệp vụ, không ai ngăn được
```

Với `private` cộng phương thức kiểm soát, mọi thay đổi đều phải đi qua logic kiểm tra:

```java
class TaiKhoan {
    private double soDu;
    public void napTien(double tien) {
        if (tien > 0) soDu += tien; // chỉ nạp được số dương
    }
}
```

Lợi ích: bảo vệ tính toàn vẹn dữ liệu, dễ thay đổi cách lưu trữ bên trong mà không ảnh hưởng code bên ngoài đang dùng lớp.

</details>

**5. Kế thừa (Inheritance) hoạt động thế nào trong Java? Cho ví dụ với `extends`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Kế thừa** cho phép một lớp con (subclass) tự động nhận lại thuộc tính và phương thức của lớp cha (superclass) bằng từ khóa `extends`, giúp tái sử dụng code và mô hình hóa quan hệ "là một" (is-a).

```java
class DongVat {
    void an() {
        System.out.println("Dang an");
    }
}

class Cho extends DongVat { // Cho LA MOT DongVat
    void sua() {
        System.out.println("Gau gau");
    }
}

Cho c = new Cho();
c.an();  // kế thừa từ DongVat -> "Dang an"
c.sua(); // hành vi riêng -> "Gau gau"
```

Java chỉ hỗ trợ **đơn kế thừa** (một lớp chỉ `extends` được một lớp cha), khác với một số ngôn ngữ khác cho phép đa kế thừa từ nhiều class.

</details>

**6. Đa hình (Polymorphism) là gì? `@Override` liên quan thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đa hình** là khả năng cùng một lời gọi phương thức nhưng cho ra hành vi khác nhau tùy loại đối tượng thực sự đứng sau tham chiếu.

`@Override` là **annotation** (chú thích) đánh dấu một phương thức trong lớp con đang **ghi đè** (override) phương thức cùng tên/cùng tham số của lớp cha — giúp trình biên dịch kiểm tra và báo lỗi nếu viết sai chữ ký, tránh gõ nhầm tạo ra một phương thức mới thay vì ghi đè.

```java
class DongVat {
    void keu() {
        System.out.println("Tieng keu chung");
    }
}
class Meo extends DongVat {
    @Override
    void keu() {
        System.out.println("Meo meo");
    }
}

DongVat dv = new Meo(); // tham chiếu kiểu cha, đối tượng thực là Meo
dv.keu(); // in "Meo meo" -> quyết định bởi đối tượng thực sự, không phải kiểu tham chiếu
```

</details>

**7. Trừu tượng (Abstraction) khác gì với đóng gói (Encapsulation)? Đây là hai khái niệm hay bị nhầm lẫn.**

<details className="qa">
<summary>Xem đáp án</summary>

Hai khái niệm dễ nhầm vì đều liên quan tới việc "ẩn" một thứ gì đó, nhưng ẩn ở mức độ khác nhau:

- **Đóng gói**: ẩn **dữ liệu** (trạng thái bên trong) khỏi bên ngoài, kiểm soát truy cập bằng `private`/`public`. Trả lời câu hỏi "ai được phép đụng vào dữ liệu này?".
- **Trừu tượng**: ẩn **độ phức tạp của cách thực hiện**, chỉ phơi bày "làm được gì" chứ không lộ "làm như thế nào". Trả lời câu hỏi "người dùng cần biết gì để sử dụng?".

Ví dụ: lái xe chỉ cần đạp ga/phanh (trừu tượng — ẩn cơ chế động cơ), còn số dư tài khoản chỉ đọc/sửa được qua phương thức `napTien()`/`xemSoDu()` chứ không truy cập biến trực tiếp (đóng gói — ẩn dữ liệu). Trong Java, trừu tượng thường được hiện thực bằng lớp trừu tượng (`abstract class`) và giao diện (`interface`).

</details>

**8. Đoạn code sau in ra gì? Vì sao?**

```java
class DongVat {
    void keu() {
        System.out.println("...");
    }
}
class Meo extends DongVat {
    @Override
    void keu() {
        System.out.println("Meo meo");
    }
}
class Cho extends DongVat {
    @Override
    void keu() {
        System.out.println("Gau gau");
    }
}

public class ViDu {
    public static void main(String[] args) {
        DongVat[] danhSach = { new Meo(), new Cho() };
        for (DongVat dv : danhSach) {
            dv.keu();
        }
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả in ra:

```
Meo meo
Gau gau
```

Dù mảng khai báo kiểu `DongVat[]`, mỗi phần tử thực chất là đối tượng `Meo` hoặc `Cho`. Nhờ **đa hình**, lời gọi `dv.keu()` chạy đúng phiên bản đã bị `@Override` ở lớp con tương ứng với đối tượng thực sự — chứ không chạy phiên bản của `DongVat`. Đây chính là giá trị cốt lõi của đa hình: xử lý nhiều loại đối tượng khác nhau bằng cùng một đoạn code (`for-each` cộng `dv.keu()`).

</details>

**9. Đoạn code sau có lỗi gì?**

```java
class TaiKhoan {
    private double soDu;
}

public class ViDu {
    public static void main(String[] args) {
        TaiKhoan tk = new TaiKhoan();
        tk.soDu = 5000;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗi biên dịch**: `soDu` được khai báo `private` trong `TaiKhoan`, nghĩa là chỉ code **bên trong chính lớp `TaiKhoan`** mới truy cập được. Dòng `tk.soDu = 5000;` nằm ở lớp `ViDu` khác, nên trình biên dịch báo lỗi kiểu "soDu has private access in TaiKhoan".

Đây chính là mục đích của đóng gói — ngăn code bên ngoài sửa dữ liệu trực tiếp. Cách sửa đúng là bổ sung phương thức công khai để thao tác có kiểm soát:

```java
class TaiKhoan {
    private double soDu;
    public void napTien(double tien) {
        if (tien > 0) soDu += tien;
    }
}
// bên ngoài gọi: tk.napTien(5000);
```

</details>

**10. Thiết kế một lớp `TaiKhoanNganHang` áp dụng đóng gói: thuộc tính nào nên `private`, phương thức nào nên `public`?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: thuộc tính lưu **trạng thái nội bộ** nên `private`; chỉ mở `public` các phương thức thể hiện **hành vi hợp lệ** mà đối tượng cho phép thực hiện.

```java
class TaiKhoanNganHang {
    private String chuTaiKhoan; // trạng thái nội bộ - không cho sửa trực tiếp
    private double soDu;        // trạng thái nội bộ - không cho sửa trực tiếp

    public TaiKhoanNganHang(String chuTaiKhoan) {
        this.chuTaiKhoan = chuTaiKhoan;
        this.soDu = 0;
    }

    public void napTien(double tien) {           // hành vi hợp lệ
        if (tien > 0) soDu += tien;
    }

    public boolean rutTien(double tien) {        // hành vi hợp lệ, có kiểm tra
        if (tien > 0 && tien <= soDu) {
            soDu -= tien;
            return true;
        }
        return false; // rút vượt số dư -> từ chối
    }

    public double xemSoDu() {                    // chỉ đọc, không cho ghi trực tiếp
        return soDu;
    }
}
```

Nhờ vậy, mọi thay đổi số dư đều đi qua `napTien`/`rutTien` với điều kiện kiểm tra, không thể gán số âm tùy tiện như khi để `soDu` là `public`.

</details>

**11. Khi nào nên dùng kế thừa (is-a), khi nào nên ưu tiên composition — "has-a" (gộp đối tượng làm thuộc tính) thay vì kế thừa?**

<details className="qa">
<summary>Xem đáp án</summary>

- Dùng **kế thừa** khi quan hệ thực sự là **"là một"** (is-a) và lớp con có thể dùng thay thế lớp cha ở mọi nơi: ví dụ `Cho extends DongVat` — một con Chó **là một** Động vật.
- Dùng **composition** (has-a — một lớp chứa đối tượng của lớp khác làm thuộc tính) khi quan hệ chỉ là **"có một"/"sử dụng"**: ví dụ một `Xe` **có một** `DongCo`, chứ `Xe` không phải là một `DongCo`.

```java
// Sai: kế thừa dùng cho quan hệ has-a
class Xe extends DongCo { }

// Đúng: composition
class Xe {
    private DongCo dongCo; // Xe "có một" DongCo
}
```

Kinh nghiệm phỏng vấn thường nhắc câu **"ưu tiên composition hơn kế thừa"** (favor composition over inheritance) vì kế thừa tạo ràng buộc chặt giữa lớp con và lớp cha (thay đổi lớp cha dễ ảnh hưởng dây chuyền tới mọi lớp con), trong khi composition linh hoạt hơn, dễ thay đổi hành vi bằng cách hoán đổi đối tượng thành phần.

</details>
