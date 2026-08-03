---
sidebar_position: 1
title: "1. Java Core & Cú pháp"
---

# Java Core & Cú pháp

> *Phần Java Core là "vòng gửi xe" của mọi buổi phỏng vấn intern. Trả lời chắc chắn các câu nền tảng dưới đây giúp bạn tạo ấn tượng tốt ngay từ những phút đầu và mở đường cho các câu hỏi khó hơn.*

:::note[Ghi nhớ nhanh]

- ⭐ **`JDK` ⊃ `JRE` ⊃ `JVM`** — `JVM` chạy bytecode, `JRE` thêm thư viện để chạy app, `JDK` thêm công cụ (`javac`) để lập trình.
- ⭐ **Biên dịch + thông dịch** — `javac` dịch mã nguồn ra bytecode, `JVM` dịch tiếp sang mã máy; nhờ bytecode chung nên "write once, run anywhere".
- **8 kiểu nguyên thủy** — primitive lưu trực tiếp giá trị, không `null`; reference lưu địa chỉ trỏ tới object trên heap.
- **Ép kiểu** — widening (nhỏ→lớn) tự động, an toàn; narrowing (lớn→nhỏ) phải ép thủ công, có thể mất dữ liệu.
- **`==` vs `.equals()`** — `==` so địa chỉ với object, `.equals()` so nội dung; `main` phải `public static void`.
- **`var`** — suy luận kiểu cho biến cục bộ (Java 10+), nhưng Java vẫn là ngôn ngữ tĩnh.

:::

---

## Câu 1: JDK, JRE, JVM khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Em hãy phân biệt giúp anh ba khái niệm JDK, JRE và JVM. Khi chỉ muốn **chạy** một ứng dụng Java thì cần cái nào, còn khi muốn **viết code** thì cần cái nào?"*

### Giải thích lý thuyết

Đây là ba khái niệm lồng nhau, từ trong ra ngoài:

- **JVM (Java Virtual Machine — máy ảo Java)**: bộ phận thực thi **bytecode**. JVM đọc file `.class` và dịch nó sang mã máy (machine code) phù hợp với hệ điều hành đang chạy. JVM là lý do Java chạy được trên nhiều nền tảng.
- **JRE (Java Runtime Environment — môi trường chạy Java)**: gồm **JVM + thư viện chuẩn** (các class có sẵn như `String`, `ArrayList`...). JRE đủ để **chạy** một ứng dụng Java, nhưng **không** biên dịch được code.
- **JDK (Java Development Kit — bộ công cụ phát triển Java)**: gồm **JRE + các công cụ lập trình** như trình biên dịch `javac`, trình gỡ lỗi `jdb`, công cụ đóng gói `jar`... JDK dùng để **vừa viết, vừa biên dịch, vừa chạy**.

Quan hệ bao hàm: **JDK ⊃ JRE ⊃ JVM**.

### Code minh hoạ

```java
// File: Hello.java  → đây là MÃ NGUỒN (source code)

public class Hello {
    public static void main(String[] args) {
        System.out.println("Xin chào Java!");
    }
}

// Quy trình:
// 1) javac Hello.java   → cần JDK (dùng trình biên dịch javac)
//                          tạo ra file Hello.class chứa bytecode
// 2) java Hello         → cần JRE/JVM (chạy bytecode, in ra màn hình)
```

### Đáp án mẫu

> "JVM là máy ảo thực thi bytecode, nó là phần lo việc chạy code. JRE bao gồm JVM cộng thêm thư viện chuẩn, đủ để chạy ứng dụng. Còn JDK là JRE cộng thêm công cụ phát triển như javac để biên dịch. Nên nếu chỉ chạy app thì cần JRE, còn để lập trình thì phải cài JDK."

---

## Câu 2: Java là ngôn ngữ biên dịch hay thông dịch? Bytecode là gì? `[Basic]`

### Câu hỏi

> *"Java là ngôn ngữ biên dịch (compiled) hay thông dịch (interpreted)? Bytecode là gì, và slogan 'Write once, run anywhere' nghĩa là sao?"*

### Giải thích lý thuyết

Java thực ra là **cả hai** — đây là điểm hay khiến nhiều bạn intern trả lời sai:

1. **Bước biên dịch (compile)**: `javac` biên dịch mã nguồn `.java` thành **bytecode** trong file `.class`. Bytecode **không phải** mã máy, mà là một dạng mã trung gian (intermediate code) mà JVM hiểu được.
2. **Bước thông dịch / chạy (run)**: JVM đọc bytecode rồi dịch tiếp sang mã máy của hệ điều hành cụ thể. Phần này có cả thông dịch (interpret) lẫn biên dịch nóng bằng **JIT (Just-In-Time compiler)** để tăng tốc.

**"Write once, run anywhere" (viết một lần, chạy mọi nơi — WORA)** nghĩa là: bytecode là chung cho mọi nền tảng. Bạn biên dịch một lần ra `.class`, rồi file đó chạy được trên Windows, macOS, Linux... miễn là máy đó có JVM phù hợp. Sự khác biệt giữa các hệ điều hành được JVM "che" đi.

### Code minh hoạ

```java
// Cùng MỘT file Hello.class (bytecode) này...
// chạy được trên mọi máy có JVM:
//
//   Windows  → JVM cho Windows  → mã máy Windows
//   macOS    → JVM cho macOS    → mã máy macOS
//   Linux    → JVM cho Linux    → mã máy Linux
//
// Lập trình viên KHÔNG cần biên dịch lại cho từng hệ điều hành.

public class Hello {
    public static void main(String[] args) {
        // Dòng này cho ra kết quả y hệt trên mọi nền tảng
        System.out.println("Chạy ở đâu cũng giống nhau!");
    }
}
```

### Đáp án mẫu

> "Java vừa biên dịch vừa thông dịch. Đầu tiên javac biên dịch code ra bytecode trong file .class. Bytecode là mã trung gian, không phải mã máy. Sau đó JVM đọc bytecode và dịch sang mã máy của hệ điều hành. Nhờ bytecode chung, mình chỉ cần biên dịch một lần là chạy được mọi nơi có JVM — đó chính là 'write once, run anywhere'."

---

## Câu 3: 8 kiểu dữ liệu nguyên thủy là gì? Khác kiểu tham chiếu ra sao? `[Basic]`

### Câu hỏi

> *"Java có bao nhiêu kiểu dữ liệu nguyên thủy (primitive)? Em kể tên giúp anh, và phân biệt nó với kiểu tham chiếu (reference)."*

### Giải thích lý thuyết

Java có đúng **8 kiểu nguyên thủy (primitive types)**:

| Kiểu | Kích thước | Mô tả |
|------|-----------|-------|
| `byte` | 8 bit | số nguyên rất nhỏ (-128 đến 127) |
| `short` | 16 bit | số nguyên nhỏ |
| `int` | 32 bit | số nguyên thông dụng nhất |
| `long` | 64 bit | số nguyên lớn (hậu tố `L`) |
| `float` | 32 bit | số thực (hậu tố `f`) |
| `double` | 64 bit | số thực thông dụng nhất |
| `char` | 16 bit | một ký tự Unicode |
| `boolean` | (JVM tự quản) | `true` hoặc `false` |

**Khác biệt cốt lõi**:

- **Primitive**: biến lưu **trực tiếp giá trị**, thường nằm ở vùng nhớ stack, không thể là `null`, có giá trị mặc định (ví dụ `int` mặc định là `0`).
- **Reference (tham chiếu)**: ví dụ `String`, mảng, hay object do mình tạo. Biến **không lưu giá trị thật** mà lưu **địa chỉ** trỏ tới object nằm trên heap. Có thể là `null`, mặc định cũng là `null`.

### Code minh hoạ

```java
// --- Kiểu nguyên thủy: biến chứa trực tiếp giá trị ---
int tuoi = 25;            // biến tuoi lưu trực tiếp số 25
double diem = 8.5;        // lưu trực tiếp 8.5
char loai = 'A';          // lưu trực tiếp ký tự A
boolean ok = true;        // lưu trực tiếp true

// --- Kiểu tham chiếu: biến chứa địa chỉ trỏ tới object ---
String ten = "An";        // biến ten lưu địa chỉ tới object "An" trên heap
int[] mang = {1, 2, 3};   // biến mang lưu địa chỉ tới mảng trên heap

String chuaGan = null;    // hợp lệ: reference có thể null
// int soNull = null;     // SAI: primitive không thể null
```

### Đáp án mẫu

> "Java có 8 kiểu nguyên thủy: byte, short, int, long, float, double, char và boolean. Khác biệt chính là biến primitive lưu trực tiếp giá trị và không thể null, còn biến reference như String hay object thì chỉ lưu địa chỉ trỏ tới object trên heap và có thể bằng null."

---

## Câu 4: Ép kiểu — widening và narrowing khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Em giải thích giúp anh ép kiểu (type casting) trong Java. Widening và narrowing khác nhau ra sao? Khi nào thì có nguy cơ mất dữ liệu?"*

### Giải thích lý thuyết

Ép kiểu là chuyển một giá trị từ kiểu này sang kiểu khác. Có hai chiều:

- **Widening (nới rộng / ép kiểu ngầm)**: chuyển từ kiểu **nhỏ sang kiểu lớn hơn** (ví dụ `int` → `long` → `double`). Java tự làm, **không cần ép thủ công** và **không mất dữ liệu** vì kiểu đích chứa được trọn vẹn giá trị.
- **Narrowing (thu hẹp / ép kiểu tường minh)**: chuyển từ kiểu **lớn sang kiểu nhỏ hơn** (ví dụ `double` → `int`). Java **bắt buộc viết ép kiểu thủ công** trong ngoặc, và **có thể mất dữ liệu** (mất phần thập phân, hoặc tràn số).

### Code minh hoạ

```java
// --- Widening: tự động, an toàn ---
int i = 100;
long l = i;        // int → long, không cần ép, không mất dữ liệu
double d = l;      // long → double, tự động
System.out.println(d);   // 100.0

// --- Narrowing: phải ép thủ công, có thể mất dữ liệu ---
double diem = 9.7;
int diemNguyen = (int) diem;   // ép thủ công: cắt phần thập phân
System.out.println(diemNguyen); // 9  (mất phần .7!)

// Ví dụ tràn số khi thu hẹp
int lon = 300;
byte nho = (byte) lon;         // byte chỉ chứa -128..127
System.out.println(nho);       // 44  (giá trị sai do tràn!)
```

### Đáp án mẫu

> "Widening là ép kiểu từ nhỏ sang lớn, ví dụ int sang double, Java tự làm và không mất dữ liệu. Narrowing là từ lớn sang nhỏ, ví dụ double sang int, mình phải tự ép trong ngoặc và có thể mất dữ liệu — như khi ép 9.7 sang int thì mất phần thập phân thành 9, hoặc ép số quá lớn sang byte thì bị tràn ra giá trị sai."

---

## Câu 5: Giải thích từng từ khóa trong `public static void main(String[] args)` `[Basic]`

### Câu hỏi

> *"Đây là dòng đầu tiên của mọi chương trình Java. Em giải thích giúp anh ý nghĩa của từng từ khóa: `public`, `static`, `void`, `main`, và `String[] args`."*

### Giải thích lý thuyết

`main` là **điểm bắt đầu (entry point)** mà JVM gọi để chạy chương trình. Phân tích từng phần:

- **`public`**: phạm vi truy cập (access modifier). Phải là `public` để JVM — vốn nằm ngoài class của bạn — có thể gọi được.
- **`static`**: phương thức **thuộc về class**, không thuộc về object cụ thể. Nhờ vậy JVM gọi `main` được mà **không cần tạo object** trước.
- **`void`**: kiểu trả về. `main` **không trả về giá trị** nào cho JVM.
- **`main`**: tên cố định mà JVM tìm để chạy. Đặt tên khác là JVM không tìm thấy điểm bắt đầu.
- **`String[] args`**: tham số — một **mảng String** chứa các **đối số dòng lệnh (command-line arguments)** mà người dùng truyền vào khi chạy chương trình.

### Code minh hoạ

```java
public class App {

    // public : JVM ở ngoài gọi được
    // static : gọi mà không cần tạo object App
    // void   : không trả về gì
    // main   : tên cố định JVM tìm để bắt đầu
    // String[] args : các đối số dòng lệnh
    public static void main(String[] args) {

        // Nếu chạy: java App Xin Chao
        // thì args[0] = "Xin", args[1] = "Chao"
        if (args.length > 0) {
            System.out.println("Đối số đầu tiên: " + args[0]);
        } else {
            System.out.println("Không có đối số nào được truyền vào.");
        }
    }
}
```

### Đáp án mẫu

> "public để JVM bên ngoài gọi được. static để JVM gọi mà không cần tạo object. void nghĩa là không trả về giá trị. main là tên cố định mà JVM tìm để bắt đầu chạy. Còn String[] args là mảng chứa các đối số dòng lệnh người dùng truyền vào lúc chạy chương trình."

---

## Câu 6: Toán tử `==` so sánh gì với primitive và với object? `[Intermediate]`

### Câu hỏi

> *"Khi em dùng `==` để so sánh hai biến kiểu nguyên thủy thì nó so sánh cái gì? Còn khi so sánh hai object, ví dụ hai String, thì sao? Tại sao nên dùng `.equals()`?"*

### Giải thích lý thuyết

Toán tử `==` luôn so sánh **giá trị được lưu trong biến**, nhưng ý nghĩa khác nhau tùy kiểu:

- **Với primitive**: biến lưu trực tiếp giá trị, nên `==` so sánh **giá trị thực**. `5 == 5` là `true`. Đây là cách dùng đúng.
- **Với object (reference)**: biến lưu **địa chỉ**, nên `==` so sánh **xem hai biến có trỏ tới cùng một object hay không**, chứ **không** so sánh nội dung. Để so sánh **nội dung**, ta dùng phương thức **`.equals()`**.

Một bẫy hay gặp với `String`: chuỗi viết literal (`"abc"`) có thể được tái sử dụng trong **String pool** nên `==` đôi khi ra `true`, nhưng chuỗi tạo bằng `new String(...)` lại là object khác nên `==` ra `false`. Vì vậy luôn dùng `.equals()` cho String.

### Code minh hoạ

```java
// --- Primitive: == so sánh giá trị ---
int a = 5;
int b = 5;
System.out.println(a == b);          // true  (so sánh giá trị)

// --- Object: == so sánh địa chỉ, .equals() so sánh nội dung ---
String s1 = new String("hello");
String s2 = new String("hello");

System.out.println(s1 == s2);        // false (hai object khác địa chỉ)
System.out.println(s1.equals(s2));   // true  (cùng nội dung)

// Bẫy với String literal (dùng chung String pool)
String s3 = "hi";
String s4 = "hi";
System.out.println(s3 == s4);        // true  (cùng object trong pool) — KHÔNG nên dựa vào!
```

### Đáp án mẫu

> "Với kiểu nguyên thủy, biến lưu trực tiếp giá trị nên == so sánh giá trị thật. Với object, biến lưu địa chỉ nên == chỉ kiểm tra hai biến có trỏ tới cùng một object hay không, chứ không so nội dung. Muốn so sánh nội dung, ví dụ hai String, thì phải dùng .equals(). Đây là lỗi rất hay gặp khi mới học."

---

## Câu 7: `++i` và `i++` khác nhau thế nào? Phép chia số nguyên và phép `%`? `[Basic]`

### Câu hỏi

> *"Em phân biệt giúp anh `++i` (tiền tố) và `i++` (hậu tố). Ngoài ra, khi chia hai số nguyên trong Java thì kết quả ra sao, và toán tử `%` dùng để làm gì?"*

### Giải thích lý thuyết

**Tăng trước (pre-increment) `++i` vs tăng sau (post-increment) `i++`**:

- `++i`: **tăng giá trị trước**, rồi mới trả về giá trị mới để dùng trong biểu thức.
- `i++`: **trả về giá trị cũ trước** để dùng, **sau đó** mới tăng.
- Nếu đứng một mình trên một dòng (`i++;` hay `++i;`) thì kết quả như nhau; khác biệt chỉ xuất hiện khi nằm trong biểu thức.

**Phép chia số nguyên (integer division)**: chia hai `int` cho nhau ra kết quả `int` — phần thập phân **bị cắt bỏ** (không làm tròn). Muốn lấy kết quả thực phải có ít nhất một toán hạng là số thực.

**Phép `%` (modulo / lấy phần dư)**: trả về **phần dư** của phép chia. Rất hay dùng để kiểm tra số chẵn/lẻ hoặc tính chia hết.

### Code minh hoạ

```java
// --- Pre-increment vs Post-increment ---
int i = 5;
int x = ++i;   // i tăng lên 6 TRƯỚC, rồi gán x = 6
System.out.println(i + " " + x);  // 6 6

int j = 5;
int y = j++;   // gán y = 5 (giá trị cũ) TRƯỚC, rồi j tăng lên 6
System.out.println(j + " " + y);  // 6 5

// --- Chia số nguyên: cắt phần thập phân ---
System.out.println(7 / 2);        // 3   (KHÔNG phải 3.5)
System.out.println(7.0 / 2);      // 3.5 (có số thực thì ra thực)

// --- Toán tử % (phần dư) ---
System.out.println(7 % 2);        // 1   (7 chia 2 dư 1)
System.out.println(10 % 2 == 0);  // true (kiểm tra số chẵn)
```

### Đáp án mẫu

> "++i tăng giá trị trước rồi mới dùng, còn i++ dùng giá trị cũ trước rồi mới tăng — khác biệt chỉ thấy rõ khi nằm trong biểu thức. Khi chia hai số nguyên như 7/2 thì Java cắt phần thập phân và ra 3, muốn ra 3.5 phải có một số thực. Còn % là lấy phần dư, hay dùng để kiểm tra số chẵn lẻ, ví dụ n % 2 == 0 là số chẵn."

---

## Câu 8: `var` (Java 10+) là gì? Java có thành ngôn ngữ động không? `[Intermediate]`

### Câu hỏi

> *"Từ Java 10 có từ khóa `var`. Em hiểu `var` là gì? Dùng `var` có biến Java thành ngôn ngữ động (dynamically typed) như JavaScript hay Python không?"*

### Giải thích lý thuyết

`var` là tính năng **suy luận kiểu cho biến cục bộ (local variable type inference)**, thêm từ **Java 10**. Khi viết `var`, **trình biên dịch tự suy ra kiểu** từ giá trị bên phải tại thời điểm biên dịch.

Điểm mấu chốt: **Java VẪN là ngôn ngữ tĩnh (statically typed)**. `var` chỉ giúp viết ngắn gọn hơn, **kiểu vẫn được cố định lúc biên dịch** và không thể đổi sau đó. Đây khác hoàn toàn với ngôn ngữ động, nơi một biến có thể đổi kiểu lúc chạy.

Một số giới hạn của `var`:

- Chỉ dùng cho **biến cục bộ** (trong method), **không** dùng cho thuộc tính class, tham số method hay kiểu trả về.
- **Bắt buộc khởi tạo ngay** — vì cần giá trị để suy ra kiểu.
- **Không** dùng được với `var x = null;` vì không suy ra được kiểu.

### Code minh hoạ

```java
// var: trình biên dịch tự suy ra kiểu lúc COMPILE
var ten = "An";          // suy ra String
var tuoi = 25;           // suy ra int
var diem = 8.5;          // suy ra double
var ds = new java.util.ArrayList<String>();  // suy ra ArrayList<String>

// Kiểu đã cố định — KHÔNG đổi được như ngôn ngữ động:
var so = 10;
// so = "mười";          // LỖI BIÊN DỊCH: so là int, không gán String được

// Các trường hợp KHÔNG hợp lệ:
// var chuaGan;          // SAI: phải khởi tạo ngay
// var rong = null;      // SAI: không suy ra được kiểu
```

### Đáp án mẫu

> "var là tính năng suy luận kiểu cho biến cục bộ từ Java 10 — trình biên dịch tự đoán kiểu dựa vào giá trị khởi tạo. Nhưng Java vẫn là ngôn ngữ tĩnh: kiểu được cố định lúc biên dịch và không đổi được, nên var hoàn toàn không biến Java thành ngôn ngữ động như JavaScript. Nó chỉ giúp code gọn hơn thôi, và chỉ dùng cho biến cục bộ có khởi tạo ngay."
