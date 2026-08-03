---
sidebar_position: 3
title: "3. String & Xử lý chuỗi"
---

# String & Xử lý chuỗi

> *Chuỗi là kiểu dữ liệu xuất hiện ở mọi bài toán — hiểu sâu String Pool, tính bất biến và các lớp hỗ trợ giúp bạn tự tin trả lời mọi câu hỏi phỏng vấn liên quan.*

:::note[Ghi nhớ nhanh]

- ⭐ **`String` là immutable** — mọi thao tác (`concat`, `toUpperCase`, `replace`) đều trả về đối tượng mới; nhờ vậy có String Pool chia sẻ an toàn, thread-safe, bảo mật và cache được `hashCode`.
- **String Pool** — các literal giống nhau trỏ cùng một đối tượng trong Heap; `new String()` tạo đối tượng mới nằm ngoài Pool nên `==` khác nhưng `equals()` bằng.
- **`String` vs `StringBuilder` vs `StringBuffer`** — `String` bất biến (nối chuỗi chậm), `StringBuilder` mutable và nhanh nhất nhưng không thread-safe, `StringBuffer` mutable + `synchronized` nên thread-safe mà chậm hơn.
- **Chọn lớp phù hợp** — dùng `String` cho hằng số, `StringBuilder` khi nối chuỗi trong vòng lặp đơn luồng, `StringBuffer` khi nối chuỗi đa luồng.
- **Text Block** — cú pháp ba dấu nháy kép `"""` từ Java 15 cho chuỗi nhiều dòng, tự cắt thụt lề thừa và kết hợp `formatted()`; vẫn là `String` (syntactic sugar), tiện nhúng JSON/SQL/HTML.

:::

---

## Câu 1: Tại sao String trong Java là immutable? `[Intermediate]`

### Câu hỏi

> *"Bạn có thể giải thích tại sao String trong Java được thiết kế là immutable (bất biến) không? Điều đó mang lại lợi ích gì?"*

### Giải thích lý thuyết

**Immutable** (bất biến) có nghĩa là một khi đối tượng `String` được tạo ra, nội dung bên trong nó **không thể thay đổi**. Mọi thao tác như `concat`, `toUpperCase`, `replace` đều trả về một đối tượng `String` **mới**, không chỉnh sửa đối tượng cũ.

Java thiết kế `String` là immutable vì ba lý do chính:

**1. String Pool (Bộ nhớ dùng chung)**

JVM (Java Virtual Machine — máy ảo Java) duy trì một vùng nhớ đặc biệt gọi là **String Pool** (hay String Constant Pool) trong **Heap**. Khi bạn viết:

```java
String a = "hello";
String b = "hello";
```

Cả `a` và `b` đều trỏ đến **cùng một đối tượng** trong String Pool. Nếu `String` có thể thay đổi, việc `a` thay đổi nội dung sẽ vô tình ảnh hưởng đến `b` — gây lỗi khó phát hiện. Tính bất biến đảm bảo chia sẻ an toàn.

**2. Thread Safety (An toàn đa luồng)**

Khi nhiều **thread** (luồng xử lý) cùng đọc một `String`, không có thread nào có thể thay đổi nó, nên không cần **synchronization** (đồng bộ hoá). Điều này giúp tăng hiệu suất trong môi trường đa luồng.

**3. Security (Bảo mật)**

`String` được dùng để lưu tên lớp, đường dẫn file, thông tin kết nối database, mật khẩu... Nếu `String` có thể bị thay đổi sau khi tạo, kẻ tấn công có thể lợi dụng khoảng thời gian giữa lúc kiểm tra và lúc sử dụng để thay nội dung — đây gọi là lỗ hổng **TOCTOU** (Time-Of-Check to Time-Of-Use).

**Bonus — hashCode caching:**

Vì nội dung không đổi, `String` có thể **cache** (lưu sẵn) giá trị `hashCode` sau lần tính đầu tiên. Điều này tăng tốc khi dùng `String` làm key trong `HashMap`.

### Code minh hoạ

```java
public class StringImmutableDemo {

    public static void main(String[] args) {
        // String Pool: a và b trỏ đến cùng một đối tượng
        String a = "hello";
        String b = "hello";
        System.out.println(a == b);           // true — cùng địa chỉ bộ nhớ

        // new String() tạo đối tượng mới ngoài Pool
        String c = new String("hello");
        System.out.println(a == c);           // false — khác địa chỉ
        System.out.println(a.equals(c));      // true — cùng nội dung

        // Thao tác trên String luôn trả về đối tượng MỚI
        String original = "Java";
        String upper = original.toUpperCase();

        System.out.println(original);         // "Java"  — không thay đổi
        System.out.println(upper);            // "JAVA"  — đối tượng mới

        // hashCode được cache — tính một lần, dùng nhiều lần
        String key = "myKey";
        System.out.println(key.hashCode());   // tính lần đầu
        System.out.println(key.hashCode());   // trả về giá trị đã cache
    }
}
```

### Đáp án mẫu

> "String trong Java là immutable để phục vụ ba mục tiêu: chia sẻ đối tượng an toàn qua String Pool giúp tiết kiệm bộ nhớ, đảm bảo thread-safety mà không cần synchronization, và tăng bảo mật khi String được dùng lưu thông tin nhạy cảm. Một lợi ích phụ là hashCode có thể được cache, tăng hiệu suất khi dùng String làm key trong HashMap."

---

## Câu 2: String, StringBuilder và StringBuffer khác nhau thế nào? `[Basic]`

### Câu hỏi

> *"Khi nào bạn dùng String, khi nào dùng StringBuilder, khi nào dùng StringBuffer?"*

### Giải thích lý thuyết

Ba lớp đều dùng để làm việc với chuỗi ký tự, nhưng khác nhau về **tính bất biến** và **thread safety**.

| Tiêu chí | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| Tính bất biến | Immutable (bất biến) | Mutable (có thể thay đổi) | Mutable (có thể thay đổi) |
| Thread Safety | Thread-safe (bất biến nên an toàn) | Không thread-safe | Thread-safe (synchronized) |
| Hiệu suất nối chuỗi | Chậm (tạo object mới mỗi lần) | Nhanh | Chậm hơn StringBuilder do sync |
| Giới thiệu từ | Java 1.0 | Java 1.5 | Java 1.0 |

**Khi nào dùng cái nào?**

- **`String`**: Khi chuỗi **không thay đổi** — hằng số, key, tên trường, thông báo cố định.
- **`StringBuilder`**: Khi cần **nối/chỉnh sửa chuỗi nhiều lần trong một luồng** — xây dựng câu SQL, tạo nội dung HTML, vòng lặp.
- **`StringBuffer`**: Khi cần **nối chuỗi trong môi trường đa luồng** (hiếm dùng trong thực tế vì thường có cách đồng bộ tốt hơn).

**Lưu ý quan trọng:** Kể từ Java 5, trình biên dịch tự động tối ưu phép `+` giữa các chuỗi trong vòng lặp **khi đủ điều kiện**, nhưng không phải lúc nào cũng tối ưu được — nên tự dùng `StringBuilder` trong vòng lặp để chắc chắn.

### Code minh hoạ

```java
public class StringComparisonDemo {

    public static void main(String[] args) {
        // --- String: tạo object mới mỗi lần nối ---
        String str = "";
        for (int i = 0; i < 5; i++) {
            str += i;  // Tạo 5 object String trung gian — lãng phí bộ nhớ
        }
        System.out.println("String result: " + str); // "01234"

        // --- StringBuilder: chỉnh sửa tại chỗ, nhanh hơn ---
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(i);  // Chỉnh sửa buffer nội bộ, không tạo object mới
        }
        System.out.println("StringBuilder result: " + sb.toString()); // "01234"

        // StringBuilder còn hỗ trợ nhiều thao tác tiện lợi
        StringBuilder builder = new StringBuilder("Hello");
        builder.insert(5, " World");   // Chèn vào vị trí 5
        builder.replace(6, 11, "Java"); // Thay thế từ index 6 đến 11
        builder.reverse();              // Đảo ngược chuỗi
        System.out.println(builder);   // "avaJ olleH"

        // --- StringBuffer: thread-safe, dùng khi đa luồng ---
        StringBuffer buffer = new StringBuffer();
        // Phương thức append() được synchronized — an toàn khi nhiều thread gọi đồng thời
        buffer.append("Thread-safe ");
        buffer.append("string building");
        System.out.println(buffer.toString());
    }
}
```

### Đáp án mẫu

> "String là immutable nên mỗi lần nối chuỗi sẽ tạo object mới, không hiệu quả khi nối nhiều lần. StringBuilder thì mutable và không thread-safe, phù hợp để xây dựng chuỗi trong vòng lặp đơn luồng — hiệu suất tốt nhất. StringBuffer tương tự StringBuilder nhưng có synchronized nên thread-safe, dùng khi nhiều luồng cùng thao tác trên một chuỗi. Trong thực tế, tôi thường dùng String cho hằng số và StringBuilder cho nối chuỗi phức tạp."

---

## Câu 3: Text Block (chuỗi nhiều dòng dùng ba dấu nháy kép) trong Java là gì? `[Basic]`

### Câu hỏi

> *"Java 15 giới thiệu Text Block là gì? Nó giải quyết vấn đề gì so với chuỗi thông thường?"*

### Giải thích lý thuyết

**Text Block** (khối văn bản) là tính năng ra mắt chính thức từ **Java 15**, cho phép định nghĩa chuỗi nhiều dòng bằng ba dấu nháy kép `"""`. Nó giải quyết vấn đề chuỗi truyền thống phải dùng `\n`, `\"`, và nối nhiều dòng bằng `+` — khiến code khó đọc.

**Cú pháp:**

```
"""
nội dung chuỗi
nhiều dòng
"""
```

**Các đặc điểm quan trọng:**

1. **Indentation stripping (Loại bỏ thụt lề thừa):** Java tự động loại bỏ phần thụt lề chung của tất cả các dòng, dựa trên vị trí của dấu đóng `"""`. Nhờ đó code vẫn được thụt lề đẹp mà chuỗi kết quả không có khoảng trắng thừa.

2. **Escape sequences vẫn hoạt động:** Bạn vẫn có thể dùng `\n`, `\t`, `\\` bên trong Text Block.

3. **Không cần escape dấu nháy kép đơn:** Dấu `"` bên trong Text Block không cần viết thành `\"`.

4. **`String.formatted()` tích hợp tốt:** Có thể kết hợp Text Block với `formatted()` để chèn giá trị động.

**Text Block vẫn là `String`** — không có lớp riêng, không thêm overhead, chỉ là cú pháp tiện hơn (**syntactic sugar**).

### Code minh hoạ

```java
public class TextBlockDemo {

    public static void main(String[] args) {
        // --- Cách cũ: chuỗi JSON nhiều dòng với String thông thường ---
        String jsonOld = "{\n" +
                "    \"name\": \"Alice\",\n" +
                "    \"age\": 30,\n" +
                "    \"city\": \"Hanoi\"\n" +
                "}";
        System.out.println("=== JSON (cách cũ) ===");
        System.out.println(jsonOld);

        // --- Text Block: dễ đọc, dễ viết hơn nhiều ---
        String jsonNew = """
                {
                    "name": "Alice",
                    "age": 30,
                    "city": "Hanoi"
                }
                """;
        System.out.println("=== JSON (Text Block) ===");
        System.out.println(jsonNew);

        // --- Text Block với HTML ---
        String html = """
                <html>
                    <body>
                        <h1>Xin chào Java!</h1>
                    </body>
                </html>
                """;
        System.out.println(html);

        // --- Text Block với SQL ---
        String sql = """
                SELECT u.id, u.name, o.total
                FROM users u
                JOIN orders o ON u.id = o.user_id
                WHERE u.active = true
                ORDER BY o.total DESC
                """;
        System.out.println(sql);

        // --- Kết hợp với formatted() để chèn giá trị động ---
        String name = "Bob";
        int age = 25;
        String profile = """
                Tên   : %s
                Tuổi  : %d
                Quốc gia: Việt Nam
                """.formatted(name, age);
        System.out.println(profile);

        // Text Block vẫn là String thông thường
        System.out.println(jsonNew instanceof String); // true
        System.out.println(jsonNew.length());          // in ra độ dài
    }
}
```

### Đáp án mẫu

> "Text Block là cú pháp dùng ba dấu nháy kép để viết chuỗi nhiều dòng mà không cần escape hay nối chuỗi thủ công. Nó ra mắt chính thức từ Java 15 và rất hữu ích khi nhúng JSON, SQL, HTML vào code Java — giúp code sạch, dễ đọc hơn nhiều. Text Block vẫn là kiểu `String` bình thường, chỉ là cú pháp thuận tiện hơn. Java cũng tự động cắt bỏ phần thụt lề thừa dựa trên vị trí dấu đóng, nên nội dung chuỗi kết quả rất gọn."

---
