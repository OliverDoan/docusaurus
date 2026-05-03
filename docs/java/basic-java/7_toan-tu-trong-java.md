---
sidebar_position: 7
title: "7. Toán tử trong Java"
---

# Toán tử trong Java

**Toán tử (Operator)** trong Java là các ký hiệu đặc biệt dùng để thực hiện phép toán trên một hoặc nhiều **toán hạng (operand)**. Toán tử là nền tảng để xây dựng mọi biểu thức tính toán, so sánh và logic trong chương trình.

Hãy hình dung toán tử giống như **các phép tính trong toán học** mà bạn đã học từ nhỏ: cộng, trừ, nhân, chia. Nhưng trong lập trình, ngoài các phép tính số học, còn có thêm các phép so sánh, phép logic, phép gán... giúp chương trình "suy nghĩ" và đưa ra quyết định.

---

## Mục lục

- [Nội dung](#nội-dung)
- [1. Toán tử số học (Arithmetic)](#1-toán-tử-số-học-arithmetic)
- [2. Toán tử gán (Assignment)](#2-toán-tử-gán-assignment)
- [3. Toán tử so sánh (Comparison)](#3-toán-tử-so-sánh-comparison)
- [4. Toán tử logic (Logical)](#4-toán-tử-logic-logical)
- [5. Toán tử bitwise](#5-toán-tử-bitwise)
- [6. Toán tử tăng giảm (Increment/Decrement)](#6-toán-tử-tăng-giảm-incrementdecrement)
- [7. Toán tử điều kiện - Ternary](#7-toán-tử-điều-kiện-ternary)
- [8. Toán tử instanceof](#8-toán-tử-instanceof)
- [9. Thứ tự ưu tiên toán tử](#9-thứ-tự-ưu-tiên-toán-tử)
- [10. Khi nào dùng?](#10-khi-nào-dùng)
- [11. Lỗi thường gặp](#11-lỗi-thường-gặp)
- [12. Câu hỏi phỏng vấn](#12-câu-hỏi-phỏng-vấn)

---

## Nội dung

1. [Toán tử số học (Arithmetic)](#1-toán-tử-số-học-arithmetic)
2. [Toán tử gán (Assignment)](#2-toán-tử-gán-assignment)
3. [Toán tử so sánh (Comparison)](#3-toán-tử-so-sánh-comparison)
4. [Toán tử logic (Logical)](#4-toán-tử-logic-logical)
5. [Toán tử bitwise](#5-toán-tử-bitwise)
6. [Toán tử tăng giảm (Increment/Decrement)](#6-toán-tử-tăng-giảm-incrementdecrement)
7. [Toán tử điều kiện - Ternary](#7-toán-tử-điều-kiện---ternary)
8. [Toán tử instanceof](#8-toán-tử-instanceof)
9. [Thứ tự ưu tiên toán tử](#9-thứ-tự-ưu-tiên-toán-tử)
10. [Khi nào dùng?](#10-khi-nào-dùng)
11. [Lỗi thường gặp](#11-lỗi-thường-gặp)
12. [Câu hỏi phỏng vấn](#12-câu-hỏi-phỏng-vấn)

---

## 1. Toán tử số học (Arithmetic)

Dùng để thực hiện các phép tính toán cơ bản trên số.

| Toán tử | Ý nghĩa     | Ví dụ    | Kết quả           |
| ------- | ----------- | -------- | ----------------- |
| `+`     | Cộng        | `10 + 3` | `13`              |
| `-`     | Trừ         | `10 - 3` | `7`               |
| `*`     | Nhân        | `10 * 3` | `30`              |
| `/`     | Chia        | `10 / 3` | `3` (chia nguyên) |
| `%`     | Chia lấy dư | `10 % 3` | `1`               |

```java
public class ArithmeticDemo {
    public static void main(String[] args) {
        int a = 10, b = 3;

        System.out.println("a + b = " + (a + b));   // 13
        System.out.println("a - b = " + (a - b));   // 7
        System.out.println("a * b = " + (a * b));   // 30
        System.out.println("a / b = " + (a / b));   // 3 (chia nguyên, bỏ phần dư)
        System.out.println("a % b = " + (a % b));   // 1 (phần dư)

        // Chia số thực
        double c = 10.0, d = 3.0;
        System.out.println("c / d = " + (c / d));   // 3.3333333333333335
    }
}
```

**Lưu ý quan trọng**: Khi chia hai số nguyên (`int / int`), Java sẽ **bỏ phần thập phân**, chỉ giữ phần nguyên. Muốn kết quả chính xác, ít nhất một toán hạng phải là `double` hoặc `float`.

---

## 2. Toán tử gán (Assignment)

Dùng để gán giá trị cho biến. Ngoài phép gán cơ bản `=`, Java còn có các toán tử gán kết hợp giúp viết code ngắn gọn hơn.

| Toán tử | Ý nghĩa           | Tương đương  |
| ------- | ----------------- | ------------ |
| `=`     | Gán               | `x = 5`      |
| `+=`    | Cộng rồi gán      | `x = x + 5`  |
| `-=`    | Trừ rồi gán       | `x = x - 5`  |
| `*=`    | Nhân rồi gán      | `x = x * 5`  |
| `/=`    | Chia rồi gán      | `x = x / 5`  |
| `%=`    | Chia dư rồi gán   | `x = x % 5`  |
| `&=`    | AND bit rồi gán   | `x = x & 5`  |
| `\|=`   | OR bit rồi gán    | `x = x \| 5` |
| `^=`    | XOR bit rồi gán   | `x = x ^ 5`  |
| `<<=`   | Dịch trái rồi gán | `x = x << 2` |
| `>>=`   | Dịch phải rồi gán | `x = x >> 2` |

```java
public class AssignmentDemo {
    public static void main(String[] args) {
        int x = 10;

        x += 5;   // x = 10 + 5 = 15
        System.out.println("x += 5 -> " + x);

        x -= 3;   // x = 15 - 3 = 12
        System.out.println("x -= 3 -> " + x);

        x *= 2;   // x = 12 * 2 = 24
        System.out.println("x *= 2 -> " + x);

        x /= 4;   // x = 24 / 4 = 6
        System.out.println("x /= 4 -> " + x);

        x %= 4;   // x = 6 % 4 = 2
        System.out.println("x %= 4 -> " + x);
    }
}
```

---

## 3. Toán tử so sánh (Comparison)

So sánh hai giá trị, luôn trả về kiểu `boolean` (`true` hoặc `false`).

| Toán tử | Ý nghĩa           | Ví dụ    | Kết quả |
| ------- | ----------------- | -------- | ------- |
| `==`    | Bằng nhau         | `5 == 5` | `true`  |
| `!=`    | Khác nhau         | `5 != 3` | `true`  |
| `>`     | Lớn hơn           | `5 > 3`  | `true`  |
| `<`     | Nhỏ hơn           | `5 < 3`  | `false` |
| `>=`    | Lớn hơn hoặc bằng | `5 >= 5` | `true`  |
| `<=`    | Nhỏ hơn hoặc bằng | `3 <= 5` | `true`  |

```java
public class ComparisonDemo {
    public static void main(String[] args) {
        int a = 10, b = 20;

        System.out.println("a == b: " + (a == b));   // false
        System.out.println("a != b: " + (a != b));   // true
        System.out.println("a > b: " + (a > b));     // false
        System.out.println("a < b: " + (a < b));     // true
        System.out.println("a >= 10: " + (a >= 10)); // true
        System.out.println("b <= 15: " + (b <= 15)); // false

        // Lưu ý: == so sánh giá trị với primitive,
        // nhưng so sánh tham chiếu (reference) với object
        String s1 = new String("hello");
        String s2 = new String("hello");
        System.out.println("s1 == s2: " + (s1 == s2));         // false (khác reference)
        System.out.println("s1.equals(s2): " + s1.equals(s2)); // true (cùng giá trị)
    }
}
```

---

## 4. Toán tử logic (Logical)

Dùng để kết hợp nhiều điều kiện boolean.

| Toán tử | Ý nghĩa         | Mô tả                                       |
| ------- | --------------- | ------------------------------------------- |
| `&&`    | AND (ngắn mạch) | `true` nếu **cả hai** điều kiện đều `true`  |
| `\|\|`  | OR (ngắn mạch)  | `true` nếu **ít nhất một** điều kiện `true` |
| `!`     | NOT             | Đảo ngược giá trị boolean                   |

**Short-circuit (ngắn mạch)**: Với `&&`, nếu vế trái là `false`, Java **không kiểm tra** vế phải. Với `||`, nếu vế trái là `true`, Java **không kiểm tra** vế phải.

```java
public class LogicalDemo {
    public static void main(String[] args) {
        int age = 25;
        boolean hasLicense = true;

        // AND: cả hai điều kiện phải đúng
        if (age >= 18 && hasLicense) {
            System.out.println("Được phép lái xe");
        }

        // OR: ít nhất một điều kiện đúng
        boolean isWeekend = false;
        boolean isHoliday = true;
        if (isWeekend || isHoliday) {
            System.out.println("Ngày nghỉ!");
        }

        // NOT: đảo ngược
        boolean isRaining = false;
        if (!isRaining) {
            System.out.println("Trời không mưa, đi chơi thôi!");
        }

        // Short-circuit: vế phải không được kiểm tra
        String name = null;
        if (name != null && name.length() > 0) {
            // An toàn! Nếu name == null, vế phải không chạy
            System.out.println("Name: " + name);
        }
    }
}
```

---

## 5. Toán tử bitwise

Thao tác trực tiếp trên từng **bit** của số nguyên. Ít dùng trong lập trình thông thường nhưng rất quan trọng trong xử lý hệ thống, mạng, mã hóa.

| Toán tử | Ý nghĩa               | Mô tả                                 |
| ------- | --------------------- | ------------------------------------- |
| `&`     | AND bit               | Cả hai bit đều 1 thì kết quả là 1     |
| `\|`    | OR bit                | Ít nhất một bit là 1 thì kết quả là 1 |
| `^`     | XOR bit               | Hai bit khác nhau thì kết quả là 1    |
| `~`     | NOT bit               | Đảo ngược tất cả bit                  |
| `<<`    | Dịch trái             | Nhân với 2^n                          |
| `>>`    | Dịch phải (có dấu)    | Chia cho 2^n, giữ bit dấu             |
| `>>>`   | Dịch phải (không dấu) | Chia cho 2^n, thêm 0 ở đầu            |

```java
public class BitwiseDemo {
    public static void main(String[] args) {
        int a = 5;  // nhị phân: 0101
        int b = 3;  // nhị phân: 0011

        System.out.println("a & b = " + (a & b));   // 0001 = 1
        System.out.println("a | b = " + (a | b));   // 0111 = 7
        System.out.println("a ^ b = " + (a ^ b));   // 0110 = 6
        System.out.println("~a = " + (~a));          // -6

        // Dịch bit
        System.out.println("a << 1 = " + (a << 1)); // 1010 = 10 (nhân 2)
        System.out.println("a >> 1 = " + (a >> 1)); // 0010 = 2  (chia 2)

        // Ứng dụng: kiểm tra số chẵn/lẻ bằng AND bit
        int num = 7;
        if ((num & 1) == 0) {
            System.out.println(num + " là số chẵn");
        } else {
            System.out.println(num + " là số lẻ");
        }
    }
}
```

---

## 6. Toán tử tăng giảm (Increment/Decrement)

| Toán tử | Ý nghĩa        | Mô tả                        |
| ------- | -------------- | ---------------------------- |
| `++x`   | Pre-increment  | Tăng trước, rồi dùng giá trị |
| `x++`   | Post-increment | Dùng giá trị trước, rồi tăng |
| `--x`   | Pre-decrement  | Giảm trước, rồi dùng giá trị |
| `x--`   | Post-decrement | Dùng giá trị trước, rồi giảm |

```java
public class IncrementDemo {
    public static void main(String[] args) {
        int a = 5;

        // Post-increment: dùng giá trị CŨ rồi mới tăng
        int b = a++;
        System.out.println("a++ -> b = " + b + ", a = " + a); // b = 5, a = 6

        // Pre-increment: tăng TRƯỚC rồi mới dùng
        int c = ++a;
        System.out.println("++a -> c = " + c + ", a = " + a); // c = 7, a = 7

        // Minh họa rõ hơn
        int x = 10;
        System.out.println(x++);  // In ra 10, sau đó x = 11
        System.out.println(++x);  // x tăng lên 12, rồi in ra 12
    }
}
```

---

## 7. Toán tử điều kiện - Ternary

Toán tử ba ngôi (`?:`) là cách viết ngắn gọn của `if-else` đơn giản.

**Cú pháp**:

```
biến = (điều_kiện) ? giá_trị_nếu_true : giá_trị_nếu_false;
```

```java
public class TernaryDemo {
    public static void main(String[] args) {
        int age = 20;

        // Thay vì if-else dài dòng
        String status = (age >= 18) ? "Người lớn" : "Trẻ em";
        System.out.println(status); // Người lớn

        // Tìm số lớn nhất
        int a = 10, b = 20;
        int max = (a > b) ? a : b;
        System.out.println("Max = " + max); // 20

        // Có thể lồng nhau (nhưng nên hạn chế)
        int score = 85;
        String grade = (score >= 90) ? "A"
                     : (score >= 80) ? "B"
                     : (score >= 70) ? "C"
                     : "D";
        System.out.println("Grade: " + grade); // B
    }
}
```

---

## 8. Toán tử instanceof

Kiểm tra xem một đối tượng có thuộc một kiểu dữ liệu cụ thể hay không. Trả về `boolean`.

```java
public class InstanceOfDemo {
    public static void main(String[] args) {
        String text = "Hello";
        Integer number = 42;
        Object obj = "Java";

        System.out.println(text instanceof String);  // true
        System.out.println(number instanceof Integer); // true
        System.out.println(obj instanceof String);     // true

        // Thường dùng trước khi ép kiểu để tránh ClassCastException
        Object data = "Hello World";
        if (data instanceof String) {
            String str = (String) data;
            System.out.println("Độ dài: " + str.length());
        }

        // null instanceof bất kỳ kiểu nào đều là false
        String nullStr = null;
        System.out.println(nullStr instanceof String); // false
    }
}
```

---

## 9. Thứ tự ưu tiên toán tử

Khi một biểu thức có nhiều toán tử, Java sẽ thực hiện theo thứ tự ưu tiên từ **cao xuống thấp**:

| Thứ tự | Toán tử                            | Mô tả                 |
| ------ | ---------------------------------- | --------------------- |
| 1      | `()`                               | Ngoặc tròn (cao nhất) |
| 2      | `++`, `--`, `!`, `~`               | Unary (một ngôi)      |
| 3      | `*`, `/`, `%`                      | Nhân, chia, chia dư   |
| 4      | `+`, `-`                           | Cộng, trừ             |
| 5      | `<<`, `>>`, `>>>`                  | Dịch bit              |
| 6      | `<`, `<=`, `>`, `>=`, `instanceof` | So sánh               |
| 7      | `==`, `!=`                         | Bằng, khác            |
| 8      | `&`                                | AND bit               |
| 9      | `^`                                | XOR bit               |
| 10     | `\|`                               | OR bit                |
| 11     | `&&`                               | AND logic             |
| 12     | `\|\|`                             | OR logic              |
| 13     | `? :`                              | Ternary               |
| 14     | `=`, `+=`, `-=`, ...               | Gán (thấp nhất)       |

```java
public class PrecedenceDemo {
    public static void main(String[] args) {
        // * có ưu tiên cao hơn +
        int result1 = 2 + 3 * 4;
        System.out.println(result1); // 14 (không phải 20)

        // Dùng () để thay đổi thứ tự
        int result2 = (2 + 3) * 4;
        System.out.println(result2); // 20

        // && có ưu tiên cao hơn ||
        boolean result3 = true || false && false;
        System.out.println(result3); // true (vì && chạy trước)

        // Khuyến nghị: LUÔN dùng () để code rõ ràng
        boolean result4 = true || (false && false);
        System.out.println(result4); // true - rõ ràng hơn
    }
}
```

**Khuyến nghị**: Khi không chắc thứ tự ưu tiên, hãy **luôn dùng ngoặc tròn `()`** để code dễ đọc và tránh sai sót.

---

## 10. Khi nào dùng?

| Nhóm toán tử                         | Khi nào dùng                                          |
| ------------------------------------ | ----------------------------------------------------- |
| Arithmetic (`+`, `-`, `*`, `/`, `%`) | Tính toán số học, xử lý dữ liệu số                    |
| Assignment (`=`, `+=`, `-=`...)      | Gán và cập nhật giá trị biến                          |
| Comparison (`==`, `!=`, `<`, `>`...) | Viết điều kiện trong `if`, `while`, `for`             |
| Logical (`&&`, `\|\|`, `!`)          | Kết hợp nhiều điều kiện phức tạp                      |
| Bitwise (`&`, `\|`, `^`, `<<`, `>>`) | Xử lý cấp bit: flag, permission, mã hóa               |
| Ternary (`? :`)                      | Thay thế `if-else` đơn giản, gán giá trị có điều kiện |
| `instanceof`                         | Kiểm tra kiểu trước khi ép kiểu (casting)             |

**Best practices**:

- Luôn dùng `()` khi biểu thức phức tạp để tránh nhầm ưu tiên.
- Dùng `equals()` thay vì `==` khi so sánh **giá trị** của object (String, Integer...).
- Cẩn thận phép chia nguyên (`int / int`) sẽ bỏ phần thập phân.
- Tận dụng short-circuit (`&&`, `||`) để kiểm tra null an toàn.
- Không lồng ternary quá sâu, dùng `if-else` nếu logic phức tạp.

---

## 11. Lỗi thường gặp

### Lỗi 1: Nhầm `==` với `equals()` khi so sánh String

```java
// ❌ Sai: dùng == so sánh nội dung String
String a = new String("hello");
String b = new String("hello");
if (a == b) { // false! So sánh reference, không phải giá trị
    System.out.println("Bằng nhau");
}

// ✅ Đúng: dùng equals()
if (a.equals(b)) { // true! So sánh giá trị
    System.out.println("Bằng nhau");
}
```

### Lỗi 2: Chia nguyên cho kết quả sai

```java
// ❌ Sai: kỳ vọng kết quả thập phân nhưng dùng chia nguyên
int a = 7, b = 2;
double result = a / b;
System.out.println(result); // 3.0 (không phải 3.5!)

// ✅ Đúng: ép kiểu một trong hai toán hạng
double result2 = (double) a / b;
System.out.println(result2); // 3.5
```

### Lỗi 3: Nhầm `=` (gán) với `==` (so sánh)

```java
// ❌ Sai: dùng = trong điều kiện
int x = 5;
// if (x = 10) { }  // Lỗi biên dịch! Vì x = 10 trả về int, không phải boolean

// ✅ Đúng: dùng ==
if (x == 10) {
    System.out.println("x bằng 10");
}
```

### Lỗi 4: Không hiểu short-circuit

```java
// ❌ Sai: dùng & thay vì && (không có short-circuit)
String name = null;
// if (name != null & name.length() > 0) { }  // NullPointerException!

// ✅ Đúng: dùng && (short-circuit, an toàn với null)
if (name != null && name.length() > 0) {
    System.out.println("Name hợp lệ");
}
```

### Lỗi 5: Nhầm lẫn `i++` và `++i` trong biểu thức

```java
// ❌ Sai: không hiểu thứ tự thực hiện
int i = 5;
int result = i++ * 2;
System.out.println(result); // 10 (dùng 5 rồi mới tăng i thành 6)

// ✅ Đúng: nếu muốn tăng trước
int j = 5;
int result2 = ++j * 2;
System.out.println(result2); // 12 (tăng j thành 6 rồi mới nhân)
```

---

## 12. Câu hỏi phỏng vấn

### Q1: `==` và `equals()` khác nhau như thế nào?

**A**: `==` so sánh **tham chiếu** (reference) - tức kiểm tra hai biến có trỏ đến cùng một object trong bộ nhớ hay không. `equals()` so sánh **giá trị** (content) bên trong object. Với kiểu primitive, `==` so sánh giá trị trực tiếp. Với kiểu object (String, Integer...), nên dùng `equals()` để so sánh nội dung.

```java
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);        // false (khác reference)
System.out.println(a.equals(b));   // true  (cùng nội dung)
```

---

### Q2: Giải thích short-circuit evaluation. `&&` khác `&` ở điểm nào?

**A**: **Short-circuit evaluation** là cơ chế bỏ qua việc đánh giá vế phải nếu vế trái đã đủ xác định kết quả.

- `&&` (short-circuit AND): nếu vế trái là `false`, **không** đánh giá vế phải (vì kết quả chắc chắn `false`).
- `&` (non-short-circuit AND): **luôn** đánh giá cả hai vế.

Short-circuit rất hữu ích khi kiểm tra null: `if (obj != null && obj.method())` -- nếu `obj` là `null`, vế phải không chạy nên tránh được `NullPointerException`.

---

### Q3: Toán tử ternary là gì? Khi nào nên dùng?

**A**: Toán tử ternary (`? :`) là toán tử ba ngôi, viết tắt của `if-else` đơn giản.

```java
// Cú pháp: điều_kiện ? giá_trị_true : giá_trị_false
int max = (a > b) ? a : b;
```

Nên dùng khi logic đơn giản (gán giá trị có điều kiện). Không nên lồng ternary nhiều cấp vì code sẽ khó đọc -- trong trường hợp đó nên dùng `if-else` thông thường.

---

### Q4: `i++` và `++i` khác nhau thế nào?

**A**:

- `i++` (post-increment): **dùng giá trị hiện tại** của `i` trong biểu thức, **sau đó** mới tăng `i` lên 1.
- `++i` (pre-increment): **tăng `i` lên 1 trước**, rồi mới dùng giá trị mới trong biểu thức.

```java
int i = 5;
System.out.println(i++); // In ra 5, sau đó i = 6
System.out.println(++i); // i tăng lên 7, in ra 7
```

Khi đứng một mình (`i++;` hoặc `++i;`), cả hai cho kết quả giống nhau.

---

### Q5: Chia lấy dư (`%`) dùng để làm gì trong thực tế?

**A**: Toán tử `%` (modulus) trả về phần dư của phép chia. Ứng dụng phổ biến:

- **Kiểm tra chẵn/lẻ**: `if (n % 2 == 0)` -- số chẵn.
- **Kiểm tra chia hết**: `if (n % 3 == 0)` -- n chia hết cho 3.
- **Xoay vòng chỉ số**: `index = (index + 1) % size` -- quay vòng trong mảng.
- **Lấy chữ số cuối**: `lastDigit = n % 10`.
