---
sidebar_position: 1
title: "1. Biểu thức chính quy (Regular Expressions)"
---

# 1. Biểu thức chính quy (Regular Expressions)

Biểu thức chính quy (regex) là một chuỗi ký tự đặc biệt dùng để mô tả khuôn mẫu của văn bản, từ đó kiểm tra hoặc tìm kiếm chuỗi. Đây là công cụ rất hay dùng để xác thực dữ liệu nhập như email, số điện thoại hay định dạng ngày tháng. Bài này giới thiệu các ký tự cơ bản, hai lớp `Pattern` và `Matcher`, kèm ví dụ thực tế; chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có regex?](#vì-sao-có-regex)
- [Regex là gì?](#regex-là-gì)
- [Hai lớp quan trọng: Pattern và Matcher](#hai-lớp-quan-trọng-pattern-và-matcher)
- [Các ký tự đặc biệt cơ bản](#các-ký-tự-đặc-biệt-cơ-bản)
- [Các phương thức matches, find, group](#các-phương-thức-matches-find-group)
- [Ví dụ thực tế: kiểm tra email](#ví-dụ-thực-tế-kiểm-tra-email)
- [Ví dụ thực tế: kiểm tra số điện thoại](#ví-dụ-thực-tế-kiểm-tra-số-điện-thoại)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có regex?

**Vấn đề:** Khi cần kiểm tra, tìm hoặc thay chuỗi theo một **mẫu** (email hợp lệ, số điện thoại, tách dòng log), nếu viết bằng vòng lặp và so từng ký tự thủ công thì code rất dài, khó đọc và dễ sai.

```java
// Kiểm tra "đúng 10 chữ số" bằng vòng lặp thủ công
public static boolean laSoDienThoai(String s) {
    if (s.length() != 10) return false;
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (c < '0' || c > '9') return false; // không phải chữ số
    }
    return true;
}
// Mỗi quy tắc mới (bắt đầu bằng 0, có dấu +, dấu cách...) lại thêm một đống if
```

**Giải pháp:** Dùng **Regular Expression** (`Pattern`/`Matcher` trong `java.util.regex`) — một **ngôn ngữ mô tả mẫu** ngắn gọn để match/find/replace. Một biểu thức thay cho hàng chục dòng so khớp tay.

```java
// Cùng yêu cầu trên, viết bằng regex
public static boolean laSoDienThoai(String s) {
    return s.matches("\\d{10}"); // đúng 10 chữ số
}
```

:::tip[Dùng thực tế]

- **Validate dữ liệu nhập**: kiểm tra email, số điện thoại đúng định dạng trước khi lưu.
- **Trích xuất thông tin**: lấy mã lỗi, IP, thời gian từ một dòng log.
- **Tách chuỗi theo mẫu**: dùng `split` để cắt chuỗi theo dấu phẩy, khoảng trắng, hay nhiều dấu phân cách.
- **Tìm – thay thế nâng cao**: dùng `replaceAll` để chuẩn hóa văn bản (gộp nhiều khoảng trắng, xóa ký tự thừa).

:::

---

## Regex là gì?

**Regex** (Regular Expression — biểu thức chính quy) là một chuỗi ký tự đặc biệt dùng để **mô tả một khuôn mẫu (pattern) của văn bản**.

Hãy tưởng tượng bạn đang tìm một người trong đám đông qua đặc điểm: "mặc áo đỏ, đội mũ trắng". Câu mô tả đó chính là một "khuôn mẫu". Regex cũng vậy, nhưng dùng để mô tả khuôn mẫu của **chữ và số**.

Ví dụ đời thường:
- "Một dãy gồm đúng 10 chữ số" → dùng kiểm tra số điện thoại.
- "Có ký tự @ ở giữa và có dấu chấm phía sau" → dùng kiểm tra email.

Trong Java, regex nằm trong gói (package) `java.util.regex`.

---

## Hai lớp quan trọng: Pattern và Matcher

Để làm việc với regex, Java cung cấp hai lớp chính:

- **`Pattern`** (khuôn mẫu): đại diện cho chính cái khuôn mẫu regex đã được "biên dịch" (compile) sẵn để dùng nhanh.
- **`Matcher`** (bộ so khớp): dùng khuôn mẫu đó để kiểm tra một chuỗi cụ thể có khớp hay không.

```java
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class RegexBasic {
    public static void main(String[] args) {
        // Bước 1: Tạo khuôn mẫu — ở đây là "một hoặc nhiều chữ số"
        Pattern pattern = Pattern.compile("\\d+");

        // Bước 2: Tạo bộ so khớp với chuỗi cần kiểm tra
        Matcher matcher = pattern.matcher("Tôi 25 tuổi");

        // Bước 3: Tìm xem có đoạn nào khớp không
        if (matcher.find()) {
            // group() trả về đoạn văn bản đã khớp
            System.out.println("Tìm thấy số: " + matcher.group()); // In ra: 25
        }
    }
}
```

> **Lưu ý dấu `\\`**: Trong Java, ký tự `\` phải viết thành `\\` trong chuỗi. Vì vậy regex `\d` (chữ số) phải viết là `"\\d"` trong code Java.

---

## Các ký tự đặc biệt cơ bản

Đây là những "viên gạch" để xây regex. Bạn nên thuộc lòng các ký tự này:

| Ký hiệu | Ý nghĩa | Ví dụ khớp |
|---------|---------|------------|
| `\d` | Một chữ số (digit) 0–9 | `5`, `0` |
| `\w` | Một ký tự "từ" (word): chữ cái, số, gạch dưới | `a`, `9`, `_` |
| `\s` | Một khoảng trắng (space, tab...) | dấu cách |
| `.` | Một ký tự bất kỳ (trừ xuống dòng) | `a`, `7`, `@` |
| `*` | Lặp 0 lần trở lên | `\d*` khớp `""`, `12` |
| `+` | Lặp 1 lần trở lên | `\d+` khớp `1`, `123` |
| `?` | Lặp 0 hoặc 1 lần (tùy chọn) | `colou?r` khớp `color` |
| `[]` | Tập hợp ký tự cho phép | `[abc]` khớp `a` hoặc `b` |
| `()` | Nhóm (group) các ký tự lại | `(ab)+` khớp `abab` |

Vài ký hiệu mở rộng hữu ích:

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `{n}` | Lặp đúng `n` lần (ví dụ `\d{4}` = đúng 4 chữ số) |
| `{n,m}` | Lặp từ `n` đến `m` lần |
| `^` | Bắt đầu chuỗi |
| `$` | Kết thúc chuỗi |
| `[a-z]` | Một chữ cái thường từ a đến z |

```java
// Ví dụ minh họa các ký tự
Pattern p1 = Pattern.compile("[a-z]+");   // Một hoặc nhiều chữ thường
Pattern p2 = Pattern.compile("\\d{3}");   // Đúng 3 chữ số
Pattern p3 = Pattern.compile("a.c");      // a, một ký tự bất kỳ, rồi c
// "abc", "axc", "a9c" đều khớp p3
```

---

## Các phương thức matches, find, group

Ba phương thức bạn dùng nhiều nhất:

- **`matches()`**: kiểm tra **toàn bộ** chuỗi có khớp khuôn mẫu hay không. Phải khớp từ đầu đến cuối.
- **`find()`**: tìm xem **có một phần** nào trong chuỗi khớp không (không cần khớp hết).
- **`group()`**: lấy ra đoạn văn bản vừa khớp sau khi gọi `find()`.

```java
public class RegexMethods {
    public static void main(String[] args) {
        Pattern pattern = Pattern.compile("\\d+");

        // matches(): toàn bộ chuỗi phải là số
        Matcher m1 = pattern.matcher("12345");
        System.out.println(m1.matches()); // true — cả chuỗi là số

        Matcher m2 = pattern.matcher("abc123");
        System.out.println(m2.matches()); // false — có chữ "abc"

        // find(): chỉ cần một phần khớp
        Matcher m3 = pattern.matcher("abc123");
        System.out.println(m3.find());    // true — tìm thấy "123"
        System.out.println(m3.group());   // 123 — đoạn vừa khớp
    }
}
```

Cách viết nhanh: dùng `String.matches()` cho trường hợp đơn giản:

```java
// Kiểm tra nhanh chuỗi có phải toàn chữ số không
boolean ketQua = "12345".matches("\\d+"); // true
```

---

## Ví dụ thực tế: kiểm tra email

Một email cơ bản gồm: phần tên + `@` + tên miền + `.` + đuôi (như `.com`).

```java
public class EmailValidator {

    // Khuôn mẫu email đơn giản, dễ hiểu cho người mới
    private static final String EMAIL_REGEX =
            "^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$";
    // Giải thích:
    // ^                bắt đầu chuỗi
    // [\w.+-]+         một hoặc nhiều ký tự chữ/số/. /+ /- (phần tên)
    // @                bắt buộc có dấu @
    // [\w-]+           tên miền (chữ, số, gạch ngang)
    // \.               dấu chấm (phải escape vì . là ký tự đặc biệt)
    // [a-z]{2,}        đuôi tối thiểu 2 chữ cái (com, net, org...)
    // $                kết thúc chuỗi

    public static boolean isValid(String email) {
        // Pattern.CASE_INSENSITIVE: không phân biệt hoa/thường
        Pattern pattern = Pattern.compile(EMAIL_REGEX, Pattern.CASE_INSENSITIVE);
        return pattern.matcher(email).matches();
    }

    public static void main(String[] args) {
        System.out.println(isValid("nam@gmail.com"));   // true
        System.out.println(isValid("an.le@cong-ty.vn")); // true
        System.out.println(isValid("sai@@gmail.com"));   // false
        System.out.println(isValid("khong-co-at.com"));  // false (thiếu @)
    }
}
```

---

## Ví dụ thực tế: kiểm tra số điện thoại

Số điện thoại Việt Nam thường bắt đầu bằng `0` và có 10 chữ số.

```java
public class PhoneValidator {

    // Bắt đầu bằng 0, theo sau là đúng 9 chữ số => tổng 10 số
    private static final String PHONE_REGEX = "^0\\d{9}$";
    // ^0       bắt đầu bằng số 0
    // \d{9}    đúng 9 chữ số tiếp theo
    // $        kết thúc

    public static boolean isValidPhone(String phone) {
        return phone.matches(PHONE_REGEX);
    }

    public static void main(String[] args) {
        System.out.println(isValidPhone("0901234567")); // true (10 số)
        System.out.println(isValidPhone("123456"));      // false (không bắt đầu bằng 0)
        System.out.println(isValidPhone("09012345"));    // false (thiếu số)
        System.out.println(isValidPhone("0901234abc"));  // false (có chữ)
    }
}
```

---

## Lỗi thường gặp

1. **Quên `\\` trong Java**: Viết `"\d"` sẽ báo lỗi biên dịch. Phải viết `"\\d"`.
2. **Nhầm `matches()` và `find()`**: `matches()` yêu cầu khớp toàn bộ chuỗi; nhiều người mong nó tìm "một phần" giống `find()`.
3. **Quên escape dấu `.`**: Trong regex `.` nghĩa là "ký tự bất kỳ". Muốn khớp dấu chấm thật phải viết `\\.`.
4. **Gọi `group()` trước `find()`**: Sẽ ném ngoại lệ `IllegalStateException`. Luôn gọi `find()` (và kiểm tra `true`) trước.
5. **Regex quá phức tạp**: Người mới nên giữ regex đơn giản, dễ đọc thay vì cố nhồi mọi quy tắc vào một dòng.

---

## Tóm tắt

- **Regex** là khuôn mẫu mô tả văn bản, dùng để kiểm tra và tìm kiếm chuỗi.
- Dùng **`Pattern.compile()`** tạo khuôn mẫu, rồi **`pattern.matcher()`** tạo bộ so khớp.
- Ký tự cơ bản cần nhớ: `\d` (số), `\w` (chữ/số), `.` (bất kỳ), `*` `+` `?` (lặp), `[]` (tập hợp), `()` (nhóm).
- **`matches()`** khớp toàn bộ, **`find()`** khớp một phần, **`group()`** lấy đoạn vừa khớp.
- Ứng dụng phổ biến: kiểm tra email, số điện thoại, định dạng dữ liệu nhập.
