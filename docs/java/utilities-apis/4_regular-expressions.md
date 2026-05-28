---
sidebar_position: 4
title: "4. Regular Expressions (Regex)"
---

# Regular Expressions -- Biểu thức chính quy

**Regex** là **"công cụ tìm kiếm siêu năng lực"** trong xử lý chuỗi. Thay vì viết hàng chục dòng `if`, bạn dùng một **pattern** ngắn gọn để tìm, thay thế, hoặc validate text.

**Tương tự đơn giản:** Hãy tưởng tượng bạn đang sàng vàng. **Regex** là cái sàng -- bạn định nghĩa kích thước lỗ (pattern), đổ cát vào, vàng sẽ rớt ra (kết quả khớp). Cùng một cái sàng, bạn dùng được cho nhiều mẻ cát khác nhau.

---

## Mục lục

- [1. Pattern và Matcher trong Java](#1-pattern-và-matcher-trong-java)
- [2. Cú pháp Regex cơ bản](#2-cú-pháp-regex-cơ-bản)
- [3. Quantifier (số lần lặp)](#3-quantifier-số-lần-lặp)
- [4. Anchor và Boundary](#4-anchor-và-boundary)
- [5. Group và Capture](#5-group-và-capture)
- [6. Ví dụ thực tế](#6-ví-dụ-thực-tế)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Pattern và Matcher trong Java

Trong Java, regex nằm trong `java.util.regex` với 2 class chính:

- **`Pattern`**: Biên dịch regex thành đối tượng (immutable, thread-safe)
- **`Matcher`**: Đối chiếu input với pattern

```java
import java.util.regex.*;

public class RegexDemo {
    public static void main(String[] args) {
        Pattern pattern = Pattern.compile("\\d+");      // 1 hoac nhieu chu so
        Matcher matcher = pattern.matcher("Toi 25 tuoi, sinh nam 2001");

        while (matcher.find()) {
            System.out.println("Tim thay: " + matcher.group());
        }
        // Output:
        // Tim thay: 25
        // Tim thay: 2001
    }
}
```

### String API (cách ngắn gọn)

```java
"abc123".matches("[a-z]+\\d+");                  // true
"abc 123".replaceAll("\\d+", "***");             // "abc ***"
"a,b;c d".split("[,;\\s]");                      // [a, b, c, d]
```

**Lưu ý:** Trong Java string, `\\` đại diện cho `\` -- regex `\d` phải viết là `"\\d"`.

---

## 2. Cú pháp Regex cơ bản

### Character class

| Ký hiệu     | Khớp với                              |
| ----------- | ------------------------------------- |
| `.`         | Bất kỳ ký tự nào (trừ newline)        |
| `\d`        | Chữ số 0-9                            |
| `\D`        | Không phải chữ số                     |
| `\w`        | Chữ cái, số, gạch dưới `[a-zA-Z0-9_]` |
| `\W`        | Không phải `\w`                       |
| `\s`        | Khoảng trắng (space, tab, newline)    |
| `\S`        | Không phải khoảng trắng               |
| `[abc]`     | a hoặc b hoặc c                       |
| `[^abc]`    | Không phải a, b, c                    |
| `[a-z]`     | Chữ thường a-z                        |
| `[a-zA-Z]`  | Chữ cái                               |

### Ví dụ

```java
"abc".matches("...");      // true (3 ky tu bat ky)
"a1".matches("\\w\\d");    // true (1 chu, 1 so)
"!@#".matches("[^\\w]+");  // true (khong phai chu/so)
```

---

## 3. Quantifier (số lần lặp)

| Ký hiệu  | Số lần lặp           |
| -------- | -------------------- |
| `*`      | 0 hoặc nhiều         |
| `+`      | 1 hoặc nhiều         |
| `?`      | 0 hoặc 1             |
| `{n}`    | Đúng n lần           |
| `{n,}`   | Ít nhất n lần        |
| `{n,m}`  | Từ n đến m lần       |

```java
"".matches("a*");         // true (0 lan)
"aaa".matches("a+");      // true (1+)
"color".matches("colou?r"); // true (colour hoac color)
"2026".matches("\\d{4}"); // true (dung 4 so)
"12345".matches("\\d{2,4}"); // false (qua 4)
```

### Greedy vs Lazy

- **Greedy** (mặc định): khớp **càng nhiều càng tốt**
- **Lazy** (thêm `?`): khớp **càng ít càng tốt**

```java
String s = "<b>hello</b><i>world</i>";

// Greedy -- bat ca chuoi
s.replaceAll("<.+>", "X");   // X

// Lazy -- bat tung the
s.replaceAll("<.+?>", "X");  // XhelloXXworldX
```

---

## 4. Anchor và Boundary

| Ký hiệu  | Ý nghĩa                  |
| -------- | ------------------------ |
| `^`      | Đầu chuỗi (hoặc dòng)    |
| `$`      | Cuối chuỗi               |
| `\b`     | Ranh giới từ (word)      |
| `\B`     | Không phải ranh giới từ  |

```java
"Hello".matches("^Hello$");      // true (dung chuoi "Hello")
"Hello world".matches("^Hello"); // false (matches phai khop het, neu muon chi tim phai dung find())

// find() voi anchor
Pattern p = Pattern.compile("^Hello");
Matcher m = p.matcher("Hello world");
System.out.println(m.find()); // true

// Word boundary
"hello world".replaceAll("\\bworld\\b", "Vietnam"); // hello Vietnam
```

**Lưu ý:** `matches()` của Java **luôn khớp toàn bộ chuỗi** -- khác `find()` chỉ tìm substring.

---

## 5. Group và Capture

Đặt trong dấu `()` để **bắt** phần khớp.

```java
import java.util.regex.*;

public class GroupDemo {
    public static void main(String[] args) {
        Pattern p = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})");
        Matcher m = p.matcher("Hom nay la 28/05/2026");

        if (m.find()) {
            System.out.println("Full: " + m.group(0));   // 28/05/2026
            System.out.println("Day: " + m.group(1));    // 28
            System.out.println("Month: " + m.group(2));  // 05
            System.out.println("Year: " + m.group(3));   // 2026
        }
    }
}
```

### Named Group

```java
Pattern p = Pattern.compile("(?<day>\\d{2})/(?<month>\\d{2})/(?<year>\\d{4})");
Matcher m = p.matcher("28/05/2026");
if (m.find()) {
    System.out.println(m.group("day"));   // 28
    System.out.println(m.group("year"));  // 2026
}
```

### Non-capturing Group `(?:...)`

```java
// Group de gom nhom, khong bat
Pattern.compile("(?:abc|def)\\d+");
```

### Backreference

```java
// Tim ky tu lap lien tiep
"aabbcc".replaceAll("(.)\\1", "X"); // "XXX"

// Trong replacement, dung $1, $2
"John Smith".replaceAll("(\\w+) (\\w+)", "$2, $1"); // "Smith, John"
```

---

## 6. Ví dụ thực tế

### Validate email (đơn giản)

```java
String emailRegex = "^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$";
"alice@example.com".matches(emailRegex); // true
"alice@@example".matches(emailRegex);    // false
```

### Validate số điện thoại Việt Nam

```java
String phoneRegex = "^(0[3|5|7|8|9])[0-9]{8}$";
"0901234567".matches(phoneRegex); // true
```

### Extract URL

```java
Pattern p = Pattern.compile("https?://[\\w.-]+(?:/[\\w./?=&-]*)?");
Matcher m = p.matcher("Xem tai https://example.com/page?id=1 hoac http://abc.com");
while (m.find()) {
    System.out.println(m.group());
}
```

### Mask thẻ tín dụng

```java
"4111-1111-1111-1234".replaceAll("\\d(?=\\d{4})", "*");
// **** **** **** 1234
```

### Tách câu

```java
"Cau 1. Cau 2! Cau 3?".split("(?<=[.!?])\\s+");
// ["Cau 1.", "Cau 2!", "Cau 3?"]
```

---

## Khi nào dùng?

- **Dùng Regex khi:**
  - Validate format (email, phone, postal code)
  - Tìm/thay thế theo pattern
  - Parse log file
  - Extract dữ liệu có cấu trúc
- **KHÔNG dùng Regex khi:**
  - Parse HTML/XML/JSON (dùng parser chuyên dụng)
  - Logic quá phức tạp -> code thường dễ đọc hơn
- **Best practice:**
  - **Compile Pattern một lần** -- tái sử dụng (Pattern là thread-safe)
  - Dùng **named group** cho rõ nghĩa
  - Comment regex phức tạp
  - Test kỹ với edge case
  - Cẩn thận **ReDoS** (regex denial of service)

---

## Lỗi thường gặp

### Lỗi 1: Compile Pattern mỗi lần dùng

```java
// SAI -- ton hieu nang
for (String s : list) {
    if (s.matches("\\d+")) { ... }
}

// DUNG -- compile mot lan
Pattern p = Pattern.compile("\\d+");
for (String s : list) {
    if (p.matcher(s).matches()) { ... }
}
```

### Lỗi 2: Quên escape ký tự đặc biệt

```java
// SAI -- "." la bat ky ky tu
"abc.def".matches("abc.def"); // true (du . la dau cham hay khac)

// DUNG -- escape
"abc.def".matches("abc\\.def"); // true chi khi co dau cham
```

### Lỗi 3: ReDoS (Regex Denial of Service)

```java
// SAI -- pattern catastrophic backtracking
"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab".matches("(a+)+b"); // chay rat lau

// DUNG -- tranh nested quantifier
"aaaaaaab".matches("a+b");
```

### Lỗi 4: `matches()` vs `find()`

```java
// SAI -- matches() yeu cau khop ca chuoi
"hello123world".matches("\\d+"); // false

// DUNG -- find() tim substring
Matcher m = Pattern.compile("\\d+").matcher("hello123world");
m.find(); // true, group = "123"
```

---

## Câu hỏi phỏng vấn

### Câu 1: `matches()` và `find()` khác gì?

**Trả lời:** `matches()` yêu cầu pattern khớp **toàn bộ chuỗi**. `find()` tìm **substring** khớp đầu tiên (có thể gọi nhiều lần để tìm tiếp). `find()` linh hoạt hơn cho việc trích xuất dữ liệu.

### Câu 2: Tại sao nên compile Pattern một lần?

**Trả lời:** Việc compile regex thành state machine khá tốn. Compile một lần và tái sử dụng tiết kiệm CPU. `Pattern` là immutable và thread-safe, có thể dùng chung cho nhiều thread. Chỉ `Matcher` mới không thread-safe.

### Câu 3: Greedy và Lazy khác nhau thế nào?

**Trả lời:**

- **Greedy** (mặc định): Khớp **càng nhiều ký tự càng tốt** -- `.+` ăn hết
- **Lazy** (thêm `?`): Khớp **càng ít càng tốt** -- `.+?` dừng sớm

Ví dụ với `<.+>` trên `<a><b>`: greedy khớp `<a><b>`, lazy khớp `<a>`.

### Câu 4: Named group có lợi gì?

**Trả lời:**

- **Dễ đọc** -- `m.group("year")` rõ hơn `m.group(3)`
- **Bảo trì** -- thêm/xóa group không vỡ chỉ số
- **Refactor an toàn** -- IDE refactor được tên

### Câu 5: ReDoS là gì? Cách tránh?

**Trả lời:** **Regex Denial of Service** -- pattern có **catastrophic backtracking** khiến CPU chạy chậm cực kỳ. Ví dụ `(a+)+b` với input `aaaaaaaaaX`. Cách tránh:

- Tránh **nested quantifier** (`(a+)+`)
- Test với input lớn
- Dùng **possessive quantifier** `(a++)b` (Java hỗ trợ)
- Giới hạn input length trước khi chạy regex
