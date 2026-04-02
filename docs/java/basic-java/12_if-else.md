---
sidebar_position: 12
title: "Mệnh đề if-else"
---

# Mệnh đề if-else trong Java

**Mệnh đề if-else** là cấu trúc điều khiển luồng cơ bản nhất trong Java, dùng để **ra quyết định**: nếu điều kiện đúng thì thực hiện hành động này, ngược lại thì thực hiện hành động khác. Đây là nền tảng để chương trình có thể "suy nghĩ" và phản hồi khác nhau tùy theo tình huống.

Hãy hình dung `if-else` giống như **ngã rẽ trên đường**: khi bạn đến ngã ba, bạn phải quyết định rẽ trái hay rẽ phải dựa trên điều kiện (biển chỉ đường, tình trạng giao thông...). Chương trình cũng vậy -- gặp `if`, nó kiểm tra điều kiện rồi chọn hướng đi phù hợp.

---

## Nội dung

1. [if đơn giản](#1-if-đơn-giản)
2. [if-else](#2-if-else)
3. [if-else if-else (Ladder)](#3-if-else-if-else-ladder)
4. [Nested if (if lồng nhau)](#4-nested-if-if-lồng-nhau)
5. [Toán tử Ternary thay thế if-else](#5-toán-tử-ternary-thay-thế-if-else)
6. [Ví dụ thực tế](#6-ví-dụ-thực-tế)
7. [Best Practices](#7-best-practices)
8. [Khi nào dùng?](#8-khi-nào-dùng)
9. [Lỗi thường gặp](#9-lỗi-thường-gặp)
10. [Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## 1. if đơn giản

Cú pháp cơ bản: thực hiện khối code **nếu điều kiện là `true`**.

```java
if (điều_kiện) {
    // Code chạy khi điều kiện = true
}
```

Điều kiện trong `if` **bắt buộc** phải là biểu thức kiểu `boolean` (trả về `true` hoặc `false`).

```java
public class IfSimpleDemo {
    public static void main(String[] args) {
        int age = 20;

        if (age >= 18) {
            System.out.println("Bạn đã đủ tuổi trưởng thành");
        }

        // Kiểm tra nhiều điều kiện
        int temperature = 38;
        if (temperature > 37.5) {
            System.out.println("Cảnh báo: Nhiệt độ cơ thể cao!");
        }

        // Điều kiện boolean trực tiếp
        boolean isLoggedIn = true;
        if (isLoggedIn) {
            System.out.println("Chào mừng bạn quay lại!");
        }
    }
}
```

---

## 2. if-else

Thực hiện **khối code thay thế** khi điều kiện là `false`.

```java
if (điều_kiện) {
    // Code khi true
} else {
    // Code khi false
}
```

```java
public class IfElseDemo {
    public static void main(String[] args) {
        int number = 7;

        // Kiểm tra chẵn/lẻ
        if (number % 2 == 0) {
            System.out.println(number + " là số chẵn");
        } else {
            System.out.println(number + " là số lẻ");
        }

        // Kiểm tra đậu/rớt
        double score = 4.5;
        if (score >= 5.0) {
            System.out.println("Đậu!");
        } else {
            System.out.println("Rớt! Cần cố gắng hơn.");
        }

        // Kiểm tra chuỗi rỗng
        String name = "";
        if (name.isEmpty()) {
            System.out.println("Tên không được để trống");
        } else {
            System.out.println("Xin chào, " + name);
        }
    }
}
```

---

## 3. if-else if-else (Ladder)

Khi có **nhiều điều kiện** cần kiểm tra tuần tự, dùng chuỗi `else if`. Java sẽ kiểm tra **từ trên xuống dưới** và dừng lại ở điều kiện **đúng đầu tiên**.

```java
if (điều_kiện_1) {
    // Code 1
} else if (điều_kiện_2) {
    // Code 2
} else if (điều_kiện_3) {
    // Code 3
} else {
    // Code mặc định (không điều kiện nào đúng)
}
```

```java
public class IfElseIfDemo {
    public static void main(String[] args) {
        // Xếp loại học lực
        int score = 72;

        if (score >= 90) {
            System.out.println("Xuất sắc (A)");
        } else if (score >= 80) {
            System.out.println("Giỏi (B)");
        } else if (score >= 70) {
            System.out.println("Khá (C)");
        } else if (score >= 60) {
            System.out.println("Trung bình (D)");
        } else if (score >= 50) {
            System.out.println("Yếu (E)");
        } else {
            System.out.println("Kém (F)");
        }
        // Output: Khá (C)

        // Phân loại BMI
        double bmi = 22.5;

        if (bmi < 18.5) {
            System.out.println("Thiếu cân");
        } else if (bmi < 25.0) {
            System.out.println("Bình thường");
        } else if (bmi < 30.0) {
            System.out.println("Thừa cân");
        } else {
            System.out.println("Béo phì");
        }
        // Output: Bình thường
    }
}
```

**Lưu ý**: Thứ tự điều kiện rất quan trọng! Điều kiện chặt hơn (giá trị lớn hơn) phải để trước.

---

## 4. Nested if (if lồng nhau)

Đặt `if` bên trong `if` khác để kiểm tra điều kiện phức tạp hơn.

```java
public class NestedIfDemo {
    public static void main(String[] args) {
        int age = 25;
        boolean hasLicense = true;
        boolean hasInsurance = true;

        // Nested if: kiểm tra nhiều cấp điều kiện
        if (age >= 18) {
            if (hasLicense) {
                if (hasInsurance) {
                    System.out.println("Bạn được phép lái xe");
                } else {
                    System.out.println("Bạn cần mua bảo hiểm");
                }
            } else {
                System.out.println("Bạn cần có bằng lái xe");
            }
        } else {
            System.out.println("Bạn chưa đủ tuổi lái xe");
        }
    }
}
```

**Cảnh báo**: Không nên lồng `if` quá **3 cấp** vì code sẽ rất khó đọc. Thay vào đó, dùng **guard clause** hoặc tách thành method riêng (xem phần Best Practices).

---

## 5. Toán tử Ternary thay thế if-else

Với `if-else` đơn giản (chỉ gán giá trị), có thể viết gọn hơn bằng toán tử ternary `? :`.

```java
// Cú pháp: biến = (điều_kiện) ? giá_trị_true : giá_trị_false;
```

```java
public class TernaryDemo {
    public static void main(String[] args) {
        int age = 20;

        // Thay vì if-else 5 dòng...
        String status;
        if (age >= 18) {
            status = "Người lớn";
        } else {
            status = "Trẻ em";
        }

        // ...viết gọn 1 dòng với ternary
        String status2 = (age >= 18) ? "Người lớn" : "Trẻ em";
        System.out.println(status2); // Người lớn

        // Tìm số lớn hơn
        int a = 15, b = 20;
        int max = (a > b) ? a : b;
        System.out.println("Max: " + max); // 20

        // Kiểm tra null
        String name = null;
        String displayName = (name != null) ? name : "Khách";
        System.out.println("Xin chào, " + displayName); // Xin chào, Khách

        // Kiểm tra chẵn/lẻ
        int num = 7;
        String parity = (num % 2 == 0) ? "Chẵn" : "Lẻ";
        System.out.println(num + " là số " + parity); // 7 là số Lẻ
    }
}
```

**Quy tắc**: Chỉ dùng ternary cho trường hợp **đơn giản**. Nếu logic phức tạp, dùng `if-else` thông thường cho dễ đọc.

---

## 6. Ví dụ thực tế

### 6.1. Kiểm tra tuổi

```java
public class AgeChecker {
    public static void main(String[] args) {
        int age = 16;

        if (age < 0) {
            System.out.println("Tuổi không hợp lệ!");
        } else if (age < 6) {
            System.out.println("Trẻ mầm non");
        } else if (age < 12) {
            System.out.println("Học sinh tiểu học");
        } else if (age < 15) {
            System.out.println("Học sinh THCS");
        } else if (age < 18) {
            System.out.println("Học sinh THPT");
        } else if (age < 22) {
            System.out.println("Sinh viên đại học");
        } else if (age < 60) {
            System.out.println("Người đi làm");
        } else {
            System.out.println("Người cao tuổi");
        }
        // Output: Học sinh THPT
    }
}
```

### 6.2. Kiểm tra năm nhuận

```java
public class LeapYearChecker {
    public static void main(String[] args) {
        int year = 2024;

        // Năm nhuận: chia hết 4 VÀ (không chia hết 100 HOẶC chia hết 400)
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            System.out.println(year + " là năm nhuận");
        } else {
            System.out.println(year + " không phải năm nhuận");
        }
        // Output: 2024 là năm nhuận

        // Kiểm tra thêm vài năm
        int[] years = {1900, 2000, 2024, 2025, 2100};
        for (int y : years) {
            boolean isLeap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
            System.out.println(y + ": " + (isLeap ? "Nhuận" : "Không nhuận"));
        }
        // 1900: Không nhuận (chia hết 100 nhưng không chia hết 400)
        // 2000: Nhuận (chia hết 400)
        // 2024: Nhuận (chia hết 4, không chia hết 100)
        // 2025: Không nhuận
        // 2100: Không nhuận
    }
}
```

### 6.3. Xếp loại điểm thi

```java
public class GradeClassifier {
    public static void main(String[] args) {
        double score = 7.5;

        // Validate đầu vào trước
        if (score < 0 || score > 10) {
            System.out.println("Điểm không hợp lệ! (0 <= điểm <= 10)");
            return;
        }

        // Xếp loại
        String grade;
        if (score >= 9.0) {
            grade = "Xuất sắc";
        } else if (score >= 8.0) {
            grade = "Giỏi";
        } else if (score >= 6.5) {
            grade = "Khá";
        } else if (score >= 5.0) {
            grade = "Trung bình";
        } else if (score >= 3.5) {
            grade = "Yếu";
        } else {
            grade = "Kém";
        }

        System.out.println("Điểm: " + score + " -> Xếp loại: " + grade);
        // Output: Điểm: 7.5 -> Xếp loại: Khá
    }
}
```

---

## 7. Best Practices

### 7.1. Guard Clause Pattern (Thoát sớm)

Thay vì lồng `if` nhiều cấp, hãy **kiểm tra điều kiện không hợp lệ và thoát sớm**.

```java
// ❌ Sai: nested if quá sâu
public void processOrder(Order order) {
    if (order != null) {
        if (order.getItems() != null) {
            if (!order.getItems().isEmpty()) {
                if (order.getCustomer() != null) {
                    // Logic xử lý thật sự ở đây (thụt vào quá sâu!)
                    System.out.println("Xử lý đơn hàng...");
                }
            }
        }
    }
}

// ✅ Đúng: Guard Clause - thoát sớm
public void processOrder(Order order) {
    if (order == null) {
        System.out.println("Order null");
        return;
    }
    if (order.getItems() == null || order.getItems().isEmpty()) {
        System.out.println("Không có sản phẩm");
        return;
    }
    if (order.getCustomer() == null) {
        System.out.println("Thiếu thông tin khách hàng");
        return;
    }

    // Logic xử lý chính - không thụt vào sâu
    System.out.println("Xử lý đơn hàng...");
}
```

### 7.2. Tránh so sánh boolean thừa

```java
boolean isActive = true;

// ❌ Sai: thừa so sánh
if (isActive == true) { }
if (isActive == false) { }

// ✅ Đúng: gọn gàng
if (isActive) { }
if (!isActive) { }
```

### 7.3. Đặt hằng số bên trái khi so sánh (phòng nhầm)

```java
// ❌ Sai: nếu lỡ gõ = thay vì == thì gán mà không biết
// (Java sẽ báo lỗi biên dịch vì int, nhưng với object thì nguy hiểm)
String status = "ACTIVE";
if (status.equals("ACTIVE")) { } // Nếu status null -> NPE!

// ✅ Đúng: đặt hằng số trước -> nếu null cũng không NPE
if ("ACTIVE".equals(status)) { } // An toàn! Trả về false nếu status null
```

### 7.4. Luôn dùng ngoặc nhọn

```java
// ❌ Sai: không dùng {}, nguy hiểm khi thêm code
if (age > 18)
    System.out.println("Đủ tuổi");

// ✅ Đúng: luôn dùng {}
if (age > 18) {
    System.out.println("Đủ tuổi");
}
```

---

## 8. Khi nào dùng?

| Tình huống | Nên dùng |
|-----------|---------|
| 1-2 điều kiện đơn giản | `if-else` hoặc ternary |
| Nhiều điều kiện phức tạp | `if-else if-else` ladder |
| Kiểm tra giá trị cụ thể (==) | Cân nhắc `switch-case` (gọn hơn) |
| Gán giá trị có điều kiện (1 dòng) | Toán tử ternary `? :` |
| Kiểm tra null trước khi xử lý | Guard clause pattern |

**So sánh if-else vs switch-case**:
- `if-else`: dùng cho **điều kiện phức tạp** (range, nhiều biến, logic kết hợp `&&`, `||`).
- `switch-case`: dùng cho **so sánh giá trị cụ thể** của một biến (enum, String, int).

---

## 9. Lỗi thường gặp

### Lỗi 1: Quên ngoặc nhọn, code chạy sai logic

```java
// ❌ Sai: dòng thứ 2 LUÔN chạy, không thuộc if
int score = 40;
if (score >= 50)
    System.out.println("Đậu");
    System.out.println("Chúc mừng!"); // LUÔN chạy, không phụ thuộc if!

// ✅ Đúng: dùng {} bao cả 2 dòng
if (score >= 50) {
    System.out.println("Đậu");
    System.out.println("Chúc mừng!");
}
```

### Lỗi 2: Dùng `==` so sánh String thay vì `equals()`

```java
String input = new String("yes");

// ❌ Sai: == so sánh reference
if (input == "yes") { // false! Khác reference
    System.out.println("Đồng ý");
}

// ✅ Đúng: dùng equals()
if (input.equals("yes")) { // true! So sánh nội dung
    System.out.println("Đồng ý");
}

// ✅ Tốt hơn: đặt literal trước (tránh NPE)
if ("yes".equals(input)) {
    System.out.println("Đồng ý");
}
```

### Lỗi 3: Điều kiện chồng chéo (thứ tự sai)

```java
int score = 95;

// ❌ Sai: điều kiện score >= 90 KHÔNG BAO GIỜ chạy
if (score >= 60) {
    System.out.println("Trung bình"); // score = 95 vào đây rồi dừng!
} else if (score >= 80) {
    System.out.println("Giỏi");      // Không bao giờ chạy
} else if (score >= 90) {
    System.out.println("Xuất sắc");  // Không bao giờ chạy
}

// ✅ Đúng: điều kiện chặt hơn phải ở TRƯỚC
if (score >= 90) {
    System.out.println("Xuất sắc");
} else if (score >= 80) {
    System.out.println("Giỏi");
} else if (score >= 60) {
    System.out.println("Trung bình");
}
```

### Lỗi 4: Nhầm `=` (gán) với `==` (so sánh)

```java
int x = 5;

// ❌ Sai: dùng = thay vì ==
// if (x = 10) { }  // Lỗi biên dịch! x = 10 trả về int, if cần boolean

// Nhưng với boolean thì NGUY HIỂM vì không lỗi biên dịch:
boolean isReady = false;
// if (isReady = true) { }  // GÁN isReady = true rồi kiểm tra -> LUÔN true!

// ✅ Đúng: dùng ==
if (x == 10) {
    System.out.println("x bằng 10");
}
if (isReady) { // Không cần == true
    System.out.println("Sẵn sàng");
}
```

### Lỗi 5: Không kiểm tra null trước khi dùng object

```java
// ❌ Sai: không kiểm tra null
String name = null;
// if (name.equals("Thuan")) { }  // NullPointerException!

// ✅ Đúng: kiểm tra null trước
if (name != null && name.equals("Thuan")) {
    System.out.println("Xin chào Thuan!");
}

// ✅ Tốt hơn: đặt literal trước
if ("Thuan".equals(name)) { // An toàn dù name null
    System.out.println("Xin chào Thuan!");
}
```

---

## 10. Câu hỏi phỏng vấn

### Q1: Tại sao dùng `equals()` thay vì `==` khi so sánh String trong if?

**A**: Toán tử `==` so sánh **tham chiếu** (reference) -- kiểm tra hai biến có trỏ đến cùng object hay không. `equals()` so sánh **nội dung** (giá trị) bên trong String.

Hai String có thể có cùng nội dung nhưng khác object (ví dụ: `new String("hello")` tạo object mới). Nên `==` có thể trả về `false` dù nội dung giống nhau.

```java
String a = "hello";                // String pool
String b = "hello";                // Cùng object trong pool
String c = new String("hello");    // Object mới trên heap

System.out.println(a == b);        // true (cùng object pool)
System.out.println(a == c);        // false (khác object)
System.out.println(a.equals(c));   // true (cùng nội dung)
```

---

### Q2: Toán tử ternary có thể thay thế mọi if-else không?

**A**: **Không.** Toán tử ternary chỉ phù hợp cho trường hợp **gán giá trị có điều kiện** (trả về một giá trị). Không thể dùng ternary khi:
- Cần thực hiện **nhiều câu lệnh** trong mỗi nhánh.
- Cần **gọi method void** (không trả về giá trị).
- Logic phức tạp với **nhiều điều kiện** (lồng ternary gây khó đọc).

```java
// Phù hợp: gán giá trị đơn giản
int max = (a > b) ? a : b;

// KHÔNG phù hợp: nhiều câu lệnh
// Nên dùng if-else thông thường
if (age >= 18) {
    System.out.println("Đủ tuổi");
    registerVoter();
    sendNotification();
}
```

---

### Q3: Null check best practice -- nên viết thế nào?

**A**: Có nhiều cách, từ cơ bản đến nâng cao:

```java
// Cách 1: Kiểm tra != null (cơ bản)
if (name != null && name.length() > 0) { }

// Cách 2: Đặt literal trước (tránh NPE với equals)
if ("admin".equals(role)) { }

// Cách 3: Guard clause (thoát sớm)
public void process(String input) {
    if (input == null) return;
    // Xử lý tiếp, chắc chắn input != null
}

// Cách 4: Objects.requireNonNull (ném exception rõ ràng)
import java.util.Objects;
public void setName(String name) {
    this.name = Objects.requireNonNull(name, "Name không được null");
}

// Cách 5: Optional (Java 8+)
import java.util.Optional;
Optional<String> optName = Optional.ofNullable(name);
optName.ifPresent(n -> System.out.println("Tên: " + n));
String displayName = optName.orElse("Khách");
```

---

### Q4: Guard clause pattern là gì? Tại sao nên dùng?

**A**: Guard clause (hay "early return") là kỹ thuật **kiểm tra điều kiện không hợp lệ và `return` sớm** ở đầu method, thay vì lồng toàn bộ logic trong `if` nhiều cấp.

Lợi ích:
- **Giảm nesting**: code phẳng, không thụt vào sâu.
- **Dễ đọc**: đọc tuần tự từ trên xuống, "loại bỏ" trường hợp không hợp lệ trước.
- **Dễ bảo trì**: thêm điều kiện mới chỉ cần thêm một guard clause.

```java
// Thay vì nested 4 cấp, chỉ cần kiểm tra và return sớm
public double calculateDiscount(Customer customer) {
    if (customer == null) return 0;
    if (!customer.isActive()) return 0;
    if (customer.getOrders().isEmpty()) return 0;

    // Logic chính - không bị thụt vào sâu
    return customer.getTotalSpent() * 0.1;
}
```

---

### Q5: Khi nào nên dùng `if-else`, khi nào dùng `switch-case`?

**A**:

| Tiêu chí | `if-else` | `switch-case` |
|----------|----------|--------------|
| Kiểu điều kiện | Bất kỳ (range, logic phức tạp) | So sánh **giá trị cụ thể** |
| Biến so sánh | Nhiều biến, kết hợp `&&`, `\|\|` | Một biến (`int`, `String`, `enum`) |
| Ví dụ | `if (age > 18 && hasLicense)` | `switch (dayOfWeek)` |
| Đọc được | Tốt cho logic phức tạp | Tốt cho danh sách giá trị |

Quy tắc ngón tay cái: nếu bạn đang so sánh **một biến với nhiều giá trị cụ thể** (ví dụ: ngày trong tuần, mã lỗi, enum...), dùng `switch-case` sẽ gọn và rõ ràng hơn.
