---
sidebar_position: 13
title: "Mệnh đề Switch-case"
---
# Mệnh đề Switch-case

## 1. Giới thiệu

Trong Java, **mệnh đề switch-case** là một cấu trúc điều khiển luồng chương trình, cho phép bạn **so sánh giá trị của một biểu thức với nhiều trường hợp (case) cụ thể** và thực thi khối lệnh tương ứng.

**Tại sao cần switch-case?** Khi bạn có nhiều lựa chọn rẽ nhánh rõ ràng (ví dụ: menu chọn chức năng, xử lý ngày trong tuần, phân loại vai trò người dùng...), việc dùng chuỗi `if - else if` dài sẽ làm code khó đọc và khó bảo trì. `switch-case` giúp code **gọn gàng, dễ đọc và dễ bảo trì hơn**.

Hãy hình dung `switch-case` như một **bảng điều khiển thang máy**:
- Bạn nhấn số tầng (giá trị)
- Thang máy đi đến đúng tầng đó (case tương ứng)
- Nếu số tầng không tồn tại, thang máy dừng ở tầng mặc định (default)

---

## Nội dung

1. [Giới thiệu](#1-gioi-thieu)
2. [Cú pháp cơ bản](#2-cu-phap-co-ban)
3. [Từ khóa break và hiện tượng fall-through](#3-tu-khoa-break-va-hien-tuong-fall-through)
4. [Default case](#4-default-case)
5. [Case gộp (Multiple case)](#5-case-gop-multiple-case)
6. [Kiểu dữ liệu hỗ trợ trong switch](#6-kieu-du-lieu-ho-tro-trong-switch)
7. [Switch với String (Java 7+)](#7-switch-voi-string-java-7)
8. [Switch với enum](#8-switch-voi-enum)
9. [Switch Expression (Java 12+ arrow syntax)](#9-switch-expression-java-12-arrow-syntax)
10. [Từ khóa yield (Java 13+)](#10-tu-khoa-yield-java-13)
11. [So sánh switch vs if-else](#11-so-sanh-switch-vs-if-else)
12. [Khi nào dùng?](#12-khi-nao-dung)
13. [Lỗi thường gặp](#13-loi-thuong-gap)
14. [Câu hỏi phỏng vấn](#14-cau-hoi-phong-van)

---

## 2. Cú pháp cơ bản

```java
switch (expression) {
    case value1:
        // code khi expression == value1
        break;
    case value2:
        // code khi expression == value2
        break;
    // ... thêm các case khác
    default:
        // code khi không khớp case nào
}
```

Trong đó:
- **`expression`**: biểu thức cần so sánh (phải trả về kiểu dữ liệu được hỗ trợ)
- **`case value`**: giá trị cụ thể để so sánh
- **`break`**: kết thúc nhánh hiện tại, thoát khỏi switch
- **`default`**: nhánh mặc định khi không có case nào khớp

**Ví dụ cơ bản:**

```java
public class SwitchDemo {
    public static void main(String[] args) {
        int day = 3;

        switch (day) {
            case 1:
                System.out.println("Thu Hai");
                break;
            case 2:
                System.out.println("Thu Ba");
                break;
            case 3:
                System.out.println("Thu Tu");
                break;
            case 4:
                System.out.println("Thu Nam");
                break;
            case 5:
                System.out.println("Thu Sau");
                break;
            case 6:
                System.out.println("Thu Bay");
                break;
            case 7:
                System.out.println("Chu Nhat");
                break;
            default:
                System.out.println("Ngay khong hop le");
        }
    }
}
```

**Kết quả:**
```
Thu Tu
```

---

## 3. Từ khóa break và hiện tượng fall-through

### 3.1 Fall-through là gì?

Nếu bạn **quên đặt `break`** sau một case, chương trình sẽ **tiếp tục chạy xuyên qua các case bên dưới** cho đến khi gặp `break` hoặc hết switch. Đây gọi là **fall-through**.

```java
public class FallThroughDemo {
    public static void main(String[] args) {
        int x = 1;

        switch (x) {
            case 1:
                System.out.println("One");
                // Không có break! -> Fall-through
            case 2:
                System.out.println("Two");
                // Không có break! -> Fall-through
            case 3:
                System.out.println("Three");
                break;
            default:
                System.out.println("Default");
        }
    }
}
```

**Kết quả:**
```
One
Two
Three
```

Mặc dù `x == 1`, chương trình vẫn chạy tiếp case 2 và case 3 vì thiếu `break`.

### 3.2 Khi nào fall-through có ích?

Fall-through **có thể được sử dụng có ý** khi nhiều case có cùng xử lý:

```java
public class FallThroughUseful {
    public static void main(String[] args) {
        int month = 2;

        switch (month) {
            case 12:
            case 1:
            case 2:
                System.out.println("Mua Dong");
                break;
            case 3:
            case 4:
            case 5:
                System.out.println("Mua Xuan");
                break;
            default:
                System.out.println("Mua khac");
        }
    }
}
```

**Kết quả:**
```
Mua Dong
```

---

## 4. Default case

`default` là nhánh **mặc định**, chạy khi không có case nào khớp với giá trị của expression.

```java
public class DefaultDemo {
    public static void main(String[] args) {
        int color = 99;

        switch (color) {
            case 1:
                System.out.println("Do");
                break;
            case 2:
                System.out.println("Xanh");
                break;
            default:
                System.out.println("Mau khong xac dinh");
        }
    }
}
```

**Kết quả:**
```
Mau khong xac dinh
```

**Lưu ý:**
- `default` không bắt buộc phải ở cuối, nhưng đặt ở cuối là **quy ước chuẩn** giúp code dễ đọc
- `default` không cần `break` nếu đặt ở cuối cùng

---

## 5. Case gộp (Multiple case)

Khi nhiều case có cùng xử lý, bạn có thể gộp chúng:

```java
public class MultipleCaseDemo {
    public static void main(String[] args) {
        char grade = 'B';

        switch (grade) {
            case 'A':
            case 'B':
                System.out.println("Gioi");
                break;
            case 'C':
                System.out.println("Kha");
                break;
            case 'D':
                System.out.println("Trung binh");
                break;
            case 'F':
                System.out.println("Yeu");
                break;
            default:
                System.out.println("Diem khong hop le");
        }
    }
}
```

**Kết quả:**
```
Gioi
```

---

## 6. Kiểu dữ liệu hỗ trợ trong switch

Java hỗ trợ các kiểu dữ liệu sau trong `switch`:

| Kiểu dữ liệu | Hỗ trợ | Ghi chú |
|-------------|--------|---------|
| `byte` | Có | Kiểu nguyên thủy |
| `short` | Có | Kiểu nguyên thủy |
| `int` | Có | Kiểu nguyên thủy |
| `char` | Có | Kiểu nguyên thủy |
| `String` | Có | Từ Java 7 |
| `enum` | Có | Từ Java 5 |
| `Byte`, `Short`, `Integer`, `Character` | Có | Wrapper class (auto-unboxing) |
| `long` | **Không** | Kiểu quá lớn |
| `float`, `double` | **Không** | Kiểu thực không chính xác |
| `boolean` | **Không** | Chỉ có 2 giá trị, dùng if-else |

---

## 7. Switch với String (Java 7+)

Từ Java 7, bạn có thể dùng `String` trong switch:

```java
public class SwitchStringDemo {
    public static void main(String[] args) {
        String role = "admin";

        switch (role) {
            case "admin":
                System.out.println("Quan tri vien - Quyen cao nhat");
                break;
            case "editor":
                System.out.println("Bien tap vien - Quyen chinh sua");
                break;
            case "viewer":
                System.out.println("Nguoi xem - Chi xem");
                break;
            default:
                System.out.println("Vai tro khong xac dinh");
        }
    }
}
```

**Kết quả:**
```
Quan tri vien - Quyen cao nhat
```

**Lưu ý:** Java sử dụng `equals()` để so sánh String trong switch, nên **phân biệt chữ hoa/chữ thường** và **cần xử lý null trước khi truyền vào switch** (tránh `NullPointerException`).

---

## 8. Switch với enum

```java
public class SwitchEnumDemo {
    enum Season { SPRING, SUMMER, AUTUMN, WINTER }

    public static void main(String[] args) {
        Season season = Season.SUMMER;

        switch (season) {
            case SPRING:
                System.out.println("Mua Xuan - Hoa no");
                break;
            case SUMMER:
                System.out.println("Mua Ha - Nang nong");
                break;
            case AUTUMN:
                System.out.println("Mua Thu - La rung");
                break;
            case WINTER:
                System.out.println("Mua Dong - Lanh gia");
                break;
        }
    }
}
```

**Kết quả:**
```
Mua Ha - Nang nong
```

**Lưu ý:** Trong switch với enum, **không cần ghi tên enum trước giá trị** (viết `case SUMMER` thay vì `case Season.SUMMER`).

---

## 9. Switch Expression (Java 12+ arrow syntax)

Từ Java 12 (preview) và chính thức từ **Java 14**, Java hỗ trợ **switch expression** với cú pháp mũi tên (`->`):

```java
public class SwitchExpressionDemo {
    public static void main(String[] args) {
        int day = 5;

        String dayType = switch (day) {
            case 1, 2, 3, 4, 5 -> "Ngay lam viec";
            case 6, 7 -> "Ngay nghi";
            default -> "Ngay khong hop le";
        };

        System.out.println(dayType);
    }
}
```

**Kết quả:**
```
Ngay lam viec
```

**Ưu điểm của switch expression:**
- **Không cần `break`** - mỗi nhánh tự động kết thúc
- **Không bị fall-through**
- Có thể **gán kết quả vào biến** (switch trả về giá trị)
- **Gộp nhiều case** bằng dấu phẩy: `case 1, 2, 3 ->`
- Code **ngắn gọn và an toàn hơn**

### Switch expression với khối lệnh:

```java
public class SwitchExpressionBlockDemo {
    public static void main(String[] args) {
        int score = 85;

        String result = switch (score / 10) {
            case 10, 9 -> {
                System.out.println("Tuyet voi!");
                yield "Xuat sac";
            }
            case 8 -> {
                System.out.println("Rat tot!");
                yield "Gioi";
            }
            case 7 -> "Kha";
            case 6 -> "Trung binh";
            default -> "Yeu";
        };

        System.out.println("Xep loai: " + result);
    }
}
```

**Kết quả:**
```
Rat tot!
Xep loai: Gioi
```

---

## 10. Từ khóa yield (Java 13+)

Từ khóa `yield` được dùng trong switch expression khi bạn cần **thực thi nhiều dòng code** trong một case và **trả về giá trị**:

```java
public class YieldDemo {
    public static void main(String[] args) {
        int month = 8;

        int daysInMonth = switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;
            case 4, 6, 9, 11 -> 30;
            case 2 -> {
                // Giả sử năm không nhuận
                System.out.println("Thang 2 (nam khong nhuan)");
                yield 28;
            }
            default -> {
                throw new IllegalArgumentException("Thang khong hop le: " + month);
            }
        };

        System.out.println("So ngay: " + daysInMonth);
    }
}
```

**Kết quả:**
```
So ngay: 31
```

**Lưu ý:**
- `yield` chỉ dùng trong **switch expression** (không dùng trong switch statement truyền thống)
- `yield` tương tự `return` nhưng dành cho switch expression

---

## 11. So sánh switch vs if-else

| Tiêu chí | switch-case | if-else |
|---------|-------------|---------|
| Khi nào dùng | So sánh **một biến** với **nhiều giá trị cụ thể** | Điều kiện **phức tạp**, khoảng giá trị |
| Kiểu dữ liệu | byte, short, int, char, String, enum | Bất kỳ biểu thức boolean |
| Độ đọc | **Gọn gàng** khi nhiều nhánh | Có thể dài và khó đọc |
| Hiệu năng | Có thể được tối ưu (jump table) | Kiểm tra tuần tự |
| Điều kiện phức tạp | Không hỗ trợ (vd: `x > 10`) | Hỗ trợ đầy đủ |
| Khoảng giá trị | Không hỗ trợ (vd: `1-100`) | Hỗ trợ (`x >= 1 && x <= 100`) |

**Quy tắc chọn:**
- Dùng **switch** khi: so sánh một biến với **các giá trị rời rạc, cụ thể** (1, 2, 3, "admin", "user",...)
- Dùng **if-else** khi: điều kiện **phức tạp**, **khoảng giá trị**, hoặc **nhiều biến khác nhau**

---

## 12. Khi nào dùng?

### Nên dùng switch-case khi:
- So sánh **một biến duy nhất** với **nhiều giá trị cụ thể**
- Xử lý **menu lựa chọn** (chọn chức năng 1, 2, 3,...)
- Phân loại **trạng thái** (status code, role, enum state...)
- **Thay thế chuỗi if-else if dài** khi điều kiện là giá trị rời rạc

### Best practices:
- **Luôn đặt `break`** sau mỗi case (trừ khi có chủ đích fall-through)
- **Luôn có `default`** để xử lý trường hợp ngoài dự kiến
- **Ưu tiên switch expression** (Java 14+) để tránh lỗi fall-through
- **Xử lý null trước** khi truyền String vào switch
- **Comment rõ ràng** nếu có chủ đích sử dụng fall-through

---

## 13. Lỗi thường gặp

### Lỗi 1: Quên `break` gây fall-through ngoài ý muốn

```java
// Sai: Thiếu break
int x = 1;
switch (x) {
    case 1:
        System.out.println("Mot");
    case 2:
        System.out.println("Hai"); // Chạy cả dòng này!
}
```

```java
// Đúng: Có break
int x = 1;
switch (x) {
    case 1:
        System.out.println("Mot");
        break;
    case 2:
        System.out.println("Hai");
        break;
}
```

### Lỗi 2: Truyền null vào switch với String

```java
// Sai: NullPointerException
String name = null;
switch (name) { // Lỗi NullPointerException ở đây!
    case "Java":
        break;
}
```

```java
// Đúng: Kiểm tra null trước
String name = null;
if (name != null) {
    switch (name) {
        case "Java":
            System.out.println("Ngon ngu Java");
            break;
        default:
            System.out.println("Ngon ngu khac");
    }
} else {
    System.out.println("Ten khong duoc de trong");
}
```

### Lỗi 3: Dùng kiểu dữ liệu không hỗ trợ

```java
// Sai: long không được hỗ trợ
long value = 100L;
switch (value) { // Lỗi biên dịch!
    case 100L:
        break;
}
```

```java
// Đúng: Ép kiểu về int nếu giá trị nằm trong phạm vi
long value = 100L;
switch ((int) value) {
    case 100:
        System.out.println("Gia tri 100");
        break;
}
```

### Lỗi 4: Case trùng giá trị

```java
// Sai: Hai case cùng giá trị -> Lỗi biên dịch
switch (x) {
    case 1:
        System.out.println("A");
        break;
    case 1: // Lỗi: duplicate case label
        System.out.println("B");
        break;
}
```

### Lỗi 5: Dùng biến (không phải hằng số) trong case

```java
// Sai: Case phải là hằng số (compile-time constant)
int a = 1;
switch (x) {
    case a: // Lỗi biên dịch! 'a' không phải hằng số
        break;
}
```

```java
// Đúng: Dùng hằng số (final) hoặc literal
final int A = 1;
switch (x) {
    case A: // OK vì A là compile-time constant
        break;
    case 2: // OK vì 2 là literal
        break;
}
```

---

## 14. Câu hỏi phỏng vấn

### Câu 1: Switch có hỗ trợ kiểu `long` không? Tại sao?

**Trả lời:** Không. Java **không hỗ trợ `long`** trong switch. Lý do là switch được thiết kế để làm việc với **jump table** (bảng nhảy) hoặc **lookup table** để tối ưu hiệu năng. Các bảng này sử dụng chỉ mục kiểu `int`, nên các kiểu lớn hơn như `long` không được hỗ trợ. Các kiểu `byte`, `short`, `char` được hỗ trợ vì chúng có thể **tự động mở rộng (widening)** lên `int`.

### Câu 2: Fall-through là gì? Cho ví dụ.

**Trả lời:** Fall-through là hiện tượng khi **thiếu `break`** trong một case, chương trình sẽ **tiếp tục chạy xuyên xuống các case bên dưới** mà không kiểm tra điều kiện. Ví dụ:
```java
int x = 1;
switch (x) {
    case 1: System.out.println("A");
    case 2: System.out.println("B");
    case 3: System.out.println("C"); break;
}
// Kết quả: A, B, C (dù x chỉ bằng 1)
```
Fall-through có thể được **sử dụng có ý** khi nhiều case có cùng xử lý (case gộp), nhưng thường là **lỗi** nếu quên break.

### Câu 3: Switch expression trong Java 14 khác gì switch statement truyền thống?

**Trả lời:**

| Tiêu chí | Switch statement | Switch expression (Java 14+) |
|---------|-----------------|------------------------------|
| Trả về giá trị | Không | Có (gán vào biến) |
| Cú pháp | `case X:` với `break` | `case X ->` (arrow) |
| Fall-through | Có thể xảy ra | **Không có** |
| `yield` | Không dùng | Dùng để trả về giá trị từ block |
| An toàn | Dễ bị lỗi fall-through | An toàn hơn |
| Exhaustiveness | Không bắt buộc | Bắt buộc xử lý hết các case (compiler kiểm tra) |

### Câu 4: Tại sao switch không hỗ trợ `float` và `double`?

**Trả lời:** Vì `float` và `double` là kiểu dữ liệu **số thực dấu phẩy động**, có vấn đề về **độ chính xác**. Hai giá trị có vẻ bằng nhau (`0.1 + 0.2` và `0.3`) có thể không thực sự bằng nhau trong bộ nhớ. Việc so sánh chính xác (`==`) với số thực là **không đáng tin cậy**, nên Java không cho phép dùng chúng trong switch.

### Câu 5: Có thể dùng switch với null không?

**Trả lời:** Trong **switch truyền thống (trước Java 21)**, truyền `null` vào switch sẽ gây **`NullPointerException`** ngay tại dòng `switch(expression)`. Bạn phải kiểm tra null trước khi vào switch. Từ **Java 21 (preview)**, Java hỗ trợ **pattern matching for switch** cho phép xử lý null trực tiếp:
```java
// Java 21+ (preview)
switch (str) {
    case null -> System.out.println("Null!");
    case "hello" -> System.out.println("Hello!");
    default -> System.out.println("Other");
}
```
