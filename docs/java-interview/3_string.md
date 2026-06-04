---
sidebar_position: 3
title: "3. String & Xử lý chuỗi"
---

# String & Xử lý chuỗi

> Chuỗi (String) là kiểu dữ liệu được dùng nhiều nhất trong mọi chương trình Java. Đây cũng là chủ đề **gần như chắc chắn xuất hiện** trong phỏng vấn intern, đặc biệt là câu hỏi về tính bất biến (immutable) và sự khác nhau giữa `==` và `.equals()`. Hãy nắm thật chắc phần này.

---

## Câu 1: String là gì? Vì sao String là immutable (bất biến)? Lợi ích là gì? `[Intermediate]`

### Câu hỏi

Trong Java, `String` là gì? Nghe nói `String` là **immutable** (bất biến) — điều đó nghĩa là sao và tại sao Java lại thiết kế như vậy?

### Giải thích lý thuyết

`String` trong Java là một **lớp (class)**, không phải kiểu nguyên thủy (primitive type) như `int` hay `char`. Mỗi đối tượng `String` đại diện cho một dãy ký tự.

**Immutable (bất biến)** nghĩa là: **một khi đối tượng `String` được tạo ra, nội dung của nó không thể bị thay đổi**. Mọi thao tác trông giống như "sửa chuỗi" (ví dụ `concat`, `replace`, `toUpperCase`) thực chất **tạo ra một đối tượng `String` mới**, chứ không sửa chuỗi gốc.

Java thiết kế `String` bất biến vì các lợi ích sau:

- **An toàn (security)**: nhiều thông tin nhạy cảm (đường dẫn file, tham số mạng, tên lớp) được truyền dưới dạng `String`. Nếu chuỗi có thể bị thay đổi sau khi kiểm tra, kẻ tấn công có thể lợi dụng.
- **Chia sẻ an toàn trong đa luồng (thread-safe)**: vì không bao giờ thay đổi, nhiều luồng (thread) dùng chung một `String` mà không cần đồng bộ hóa.
- **Cho phép dùng String pool**: vì bất biến nên JVM có thể tái sử dụng (cache) các chuỗi giống nhau, tiết kiệm bộ nhớ (xem Câu 3).
- **Dùng làm khóa (key) trong HashMap an toàn**: mã băm (hash code) của chuỗi không đổi, nên nó là khóa lý tưởng.

### Code minh hoạ

```java
public class ImmutableDemo {
    public static void main(String[] args) {
        String s = "Hello";

        // Tưởng là sửa s, nhưng thực ra concat tạo ra đối tượng MỚI
        s.concat(" World");
        System.out.println(s); // Vẫn in ra "Hello" — chuỗi gốc không đổi

        // Muốn giữ kết quả, phải gán lại vào biến
        s = s.concat(" World");
        System.out.println(s); // Bây giờ mới in ra "Hello World"
    }
}
```

### Đáp án mẫu

> "`String` trong Java là một class, đại diện cho dãy ký tự. Nó **bất biến (immutable)** nghĩa là sau khi tạo thì nội dung không đổi được; mọi thao tác như `concat` hay `replace` đều **trả về chuỗi mới** chứ không sửa chuỗi cũ. Java làm vậy để **bảo mật, an toàn đa luồng, và cho phép tái sử dụng chuỗi qua String pool**."

---

## Câu 2: So sánh chuỗi — tại sao dùng `==` lại sai, phải dùng `.equals()`? `[Basic]`

### Câu hỏi

Khi so sánh hai chuỗi, vì sao dùng toán tử `==` thường cho kết quả sai? Khi nào nên dùng `.equals()`?

### Giải thích lý thuyết

Đây là **lỗi kinh điển** của người mới học Java. Cần phân biệt:

- `==` so sánh **địa chỉ tham chiếu (reference)** — tức là hai biến có **cùng trỏ về một đối tượng trong bộ nhớ** hay không.
- `.equals()` so sánh **nội dung** — tức là hai chuỗi có **cùng dãy ký tự** hay không.

Với chuỗi, điều ta quan tâm gần như luôn là **nội dung**, nên phải dùng `.equals()`. Dùng `==` đôi khi "may mắn" cho kết quả đúng (do String pool), nhưng đó là sự trùng hợp không đáng tin.

### Code minh hoạ

```java
public class EqualsDemo {
    public static void main(String[] args) {
        String a = "Java";
        String b = "Java";              // Cùng tham chiếu trong String pool
        String c = new String("Java");  // Tạo đối tượng MỚI trên heap

        System.out.println(a == b);        // true  — tình cờ cùng tham chiếu
        System.out.println(a == c);        // false — khác đối tượng trong bộ nhớ
        System.out.println(a.equals(c));   // true  — đúng vì so sánh nội dung

        // Mẹo tránh NullPointerException: đặt chuỗi hằng đứng trước
        String input = null;
        System.out.println("Java".equals(input)); // false, an toàn không lỗi
    }
}
```

### Đáp án mẫu

> "`==` so sánh **địa chỉ tham chiếu** xem hai biến có cùng trỏ về một đối tượng không, còn `.equals()` so sánh **nội dung** chuỗi. Vì ta thường quan tâm nội dung nên phải dùng `.equals()`. Dùng `==` có lúc đúng do String pool nhưng không đáng tin, đặc biệt khi dùng `new String(...)`."

---

## Câu 3: String pool (bể chứa chuỗi) là gì? `"abc"` vs `new String("abc")` `[Intermediate]`

### Câu hỏi

String pool là gì? Sự khác nhau giữa khai báo `String s = "abc";` và `String s = new String("abc");` là gì?

### Giải thích lý thuyết

**String pool** (còn gọi là *string constant pool* — bể chứa hằng chuỗi) là một vùng bộ nhớ đặc biệt nơi JVM **lưu trữ và tái sử dụng** các chuỗi hằng (string literal). Nhờ tính bất biến, nhiều biến có thể an toàn dùng chung một chuỗi.

- `String s = "abc";` — JVM kiểm tra trong pool: nếu đã có `"abc"` thì **tái sử dụng**, nếu chưa có thì tạo và đưa vào pool. Tiết kiệm bộ nhớ.
- `String s = new String("abc");` — **luôn tạo một đối tượng mới** trên vùng heap, **bỏ qua pool**, dù pool đã có `"abc"`. Tốn bộ nhớ hơn và hiếm khi cần thiết.

Có thể đưa một chuỗi `new String(...)` vào pool bằng phương thức `intern()`.

### Code minh hoạ

```java
public class StringPoolDemo {
    public static void main(String[] args) {
        String s1 = "abc";                 // Vào String pool
        String s2 = "abc";                 // Tái sử dụng từ pool -> cùng tham chiếu
        String s3 = new String("abc");     // Đối tượng mới trên heap

        System.out.println(s1 == s2);          // true  — cùng đối tượng trong pool
        System.out.println(s1 == s3);          // false — s3 nằm ngoài pool
        System.out.println(s1 == s3.intern()); // true  — intern() đưa về pool
    }
}
```

### Đáp án mẫu

> "**String pool** là vùng bộ nhớ JVM dùng để lưu và tái sử dụng các chuỗi hằng nhằm tiết kiệm bộ nhớ. Viết `\"abc\"` thì JVM tái dùng chuỗi trong pool nếu đã có, còn `new String(\"abc\")` thì **luôn tạo đối tượng mới trên heap**, bỏ qua pool. Vì vậy `==` giữa hai literal thường là `true`, nhưng với `new String` thì `false`."

---

## Câu 4: String vs StringBuilder vs StringBuffer — khác nhau, khi nào dùng? `[Intermediate]`

### Câu hỏi

Phân biệt `String`, `StringBuilder` và `StringBuffer`. Khi nào nên dùng cái nào?

### Giải thích lý thuyết

Ba lớp này đều xử lý chuỗi nhưng khác nhau ở **tính bất biến** và **an toàn đa luồng**:

| Đặc điểm | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| Bất biến (immutable)? | Có | Không (mutable) | Không (mutable) |
| An toàn đa luồng (thread-safe)? | Có (do bất biến) | Không | Có (đồng bộ hóa) |
| Tốc độ | Chậm khi sửa nhiều | **Nhanh nhất** | Chậm hơn StringBuilder |

- `String`: dùng khi chuỗi **ít hoặc không thay đổi**.
- `StringBuilder`: dùng khi cần **sửa/nối chuỗi nhiều lần** trong môi trường **đơn luồng** (phổ biến nhất). Vì mutable nên sửa trực tiếp, không tạo đối tượng mới liên tục.
- `StringBuffer`: giống `StringBuilder` nhưng **an toàn đa luồng** (các phương thức được `synchronized`), đổi lại chậm hơn. Chỉ dùng khi nhiều luồng cùng sửa một chuỗi.

### Code minh hoạ

```java
public class BuilderDemo {
    public static void main(String[] args) {
        // StringBuilder: sửa trực tiếp trên cùng một đối tượng (mutable)
        StringBuilder sb = new StringBuilder("Hello");
        sb.append(" World");   // Nối thêm
        sb.insert(0, ">> ");   // Chèn vào đầu
        sb.reverse();          // Đảo ngược

        System.out.println(sb.toString()); // Chuyển về String khi dùng kết quả
    }
}
```

### Đáp án mẫu

> "`String` **bất biến** nên sửa nhiều sẽ tốn bộ nhớ; `StringBuilder` và `StringBuffer` **có thể thay đổi (mutable)** nên sửa chuỗi nhanh hơn. Khác nhau là `StringBuffer` **an toàn đa luồng** nhưng chậm hơn, còn `StringBuilder` **không an toàn đa luồng** nhưng nhanh nhất. Đơn luồng thì dùng `StringBuilder`, đa luồng mới cần `StringBuffer`."

---

## Câu 5: Các phương thức String hay dùng `[Basic]`

### Câu hỏi

Em hãy kể một số phương thức (method) của lớp `String` mà em hay dùng và cho biết chúng làm gì?

### Giải thích lý thuyết

Lớp `String` cung cấp nhiều phương thức xử lý chuỗi. Dưới đây là những phương thức **bắt buộc phải nắm** ở mức intern:

- `length()` — trả về **số ký tự** của chuỗi.
- `charAt(int index)` — trả về **ký tự tại vị trí** `index` (đếm từ 0).
- `substring(int begin, int end)` — cắt lấy **chuỗi con** từ `begin` đến trước `end`.
- `indexOf(String s)` — trả về **vị trí xuất hiện đầu tiên** của `s`, hoặc `-1` nếu không có.
- `split(String regex)` — **tách chuỗi** thành mảng dựa theo dấu phân cách.
- `trim()` — **bỏ khoảng trắng** ở đầu và cuối chuỗi.
- `replace(old, new)` — **thay thế** ký tự/chuỗi con này bằng cái khác.
- `toUpperCase()` / `toLowerCase()` — chuyển sang **chữ hoa / chữ thường**.

Lưu ý quan trọng: vì `String` bất biến, các phương thức trên **trả về chuỗi mới**, không sửa chuỗi gốc.

### Code minh hoạ

```java
public class StringMethodsDemo {
    public static void main(String[] args) {
        String s = "  Hello, Java World  ";

        System.out.println(s.trim());            // "Hello, Java World" (bỏ khoảng trắng 2 đầu)
        System.out.println(s.trim().length());   // 17 (số ký tự sau khi trim)
        System.out.println(s.charAt(2));         // 'H' (sau 2 dấu cách đầu)
        System.out.println(s.indexOf("Java"));   // 9 (vị trí chuỗi con "Java")
        System.out.println(s.trim().toUpperCase()); // "HELLO, JAVA WORLD"

        // split: tách theo dấu phẩy -> mảng String
        String csv = "Lan,Hoa,Mai";
        String[] names = csv.split(",");
        System.out.println(names[1]);            // "Hoa"

        // substring: lấy chuỗi con từ vị trí 9 đến trước 13
        System.out.println(s.trim().substring(7, 11)); // "Java"
    }
}
```

### Đáp án mẫu

> "Em hay dùng `length()` để lấy độ dài, `charAt()` lấy ký tự tại vị trí, `substring()` để cắt chuỗi con, `indexOf()` để tìm vị trí, `split()` để tách chuỗi thành mảng, `trim()` để bỏ khoảng trắng hai đầu, `replace()` để thay thế, và `toUpperCase()/toLowerCase()` để đổi hoa/thường. Vì String bất biến nên các method này đều **trả về chuỗi mới**."

---

## Câu 6: Nối chuỗi trong vòng lặp bằng `+` có vấn đề gì? `[Intermediate]`

### Câu hỏi

Nếu em nối chuỗi bằng toán tử `+` bên trong một vòng lặp lớn thì có vấn đề gì không? Nên làm thế nào cho tốt hơn?

### Giải thích lý thuyết

Vì `String` **bất biến**, mỗi lần dùng `+` để nối chuỗi, Java **tạo ra một đối tượng `String` mới** rồi sao chép toàn bộ nội dung cũ sang. Trong một vòng lặp lớn, điều này tạo ra **rất nhiều đối tượng trung gian bị vứt bỏ**, gây tốn bộ nhớ và làm chậm chương trình (độ phức tạp xấp xỉ O(n²)).

Giải pháp là dùng `StringBuilder`: nó **mutable**, nối chuỗi trực tiếp trên cùng một bộ đệm (buffer) nên nhanh hơn nhiều (O(n)).

Lưu ý: nối **vài chuỗi cố định** bằng `+` thì hoàn toàn ổn (trình biên dịch tự tối ưu). Vấn đề chỉ nghiêm trọng **trong vòng lặp**.

### Code minh hoạ

```java
public class ConcatDemo {
    public static void main(String[] args) {
        // CÁCH KHÔNG TỐT: mỗi vòng lặp tạo một String mới -> chậm
        String slow = "";
        for (int i = 0; i < 1000; i++) {
            slow += i; // Tạo đối tượng String mới mỗi lần lặp
        }

        // CÁCH TỐT: dùng StringBuilder, sửa trực tiếp trên buffer -> nhanh
        StringBuilder fast = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            fast.append(i); // Không tạo đối tượng mới mỗi lần
        }
        String result = fast.toString(); // Chuyển về String khi xong
    }
}
```

### Đáp án mẫu

> "Vì `String` bất biến nên mỗi lần dùng `+` trong vòng lặp, Java phải **tạo một chuỗi mới và sao chép lại toàn bộ** nội dung cũ, gây tốn bộ nhớ và chậm (khoảng O(n²)). Nên dùng `StringBuilder` vì nó mutable, nối trực tiếp trên buffer, nhanh hơn nhiều. Còn nối vài chuỗi cố định ngoài vòng lặp thì dùng `+` vẫn ổn."

---

## Câu 7: `equals()` và `hashCode()` — vì sao chúng liên quan đến nhau? `[Intermediate]`

### Câu hỏi

`hashCode()` là gì? Vì sao khi ghi đè (override) `equals()` thì thường phải ghi đè cả `hashCode()`?

### Giải thích lý thuyết

- `equals()` so sánh **hai đối tượng có "bằng nhau" về nội dung** hay không.
- `hashCode()` trả về một **số nguyên (mã băm)** đại diện cho đối tượng, được các cấu trúc dữ liệu dựa trên băm như `HashMap`, `HashSet` dùng để **xác định "ngăn chứa" (bucket)** lưu đối tượng.

Java quy định một **hợp đồng (contract)** bắt buộc:

> Nếu `a.equals(b)` là `true` thì `a.hashCode()` **phải bằng** `b.hashCode()`.

Nếu vi phạm hợp đồng này (chỉ override `equals()` mà quên `hashCode()`), thì hai đối tượng "bằng nhau" lại có mã băm khác nhau, khiến `HashMap`/`HashSet` **xếp chúng vào hai bucket khác nhau** và hoạt động sai (ví dụ: thêm vào `HashSet` vẫn bị trùng, tra cứu trong `HashMap` không thấy).

Với `String`, Java đã cài sẵn `equals()` và `hashCode()` đúng chuẩn dựa trên nội dung, nên `String` là khóa (key) lý tưởng cho `HashMap`.

### Code minh hoạ

```java
import java.util.HashSet;
import java.util.Objects;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    // So sánh theo nội dung (x, y)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    // BẮT BUỘC override kèm: hai object equals nhau phải có cùng hashCode
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class HashCodeDemo {
    public static void main(String[] args) {
        HashSet<Point> set = new HashSet<>();
        set.add(new Point(1, 2));
        set.add(new Point(1, 2)); // Bị coi là trùng -> không thêm

        System.out.println(set.size()); // 1 — nhờ equals() và hashCode() đồng bộ
    }
}
```

### Đáp án mẫu

> "`equals()` so sánh nội dung hai đối tượng, còn `hashCode()` trả về mã băm để các cấu trúc như `HashMap`, `HashSet` chọn bucket lưu trữ. Java quy định: **nếu hai đối tượng `equals` nhau thì `hashCode` phải bằng nhau**. Nếu chỉ override `equals()` mà quên `hashCode()` thì `HashSet`/`HashMap` sẽ hoạt động sai. May là `String` đã cài sẵn cả hai đúng chuẩn nên rất hợp làm key."

---

> **Tổng kết chương:** Hãy nhớ kỹ ba điểm hay hỏi nhất: (1) `String` **bất biến** và lợi ích của nó; (2) phân biệt `==` (tham chiếu) và `.equals()` (nội dung); (3) khi nào dùng `StringBuilder` thay cho nối `+`. Đây là những câu gần như chắc chắn xuất hiện ở phỏng vấn intern.
