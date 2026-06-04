---
sidebar_position: 7
title: "7. Bài tập code thường gặp"
---

# Bài tập code thường gặp

> Khi phỏng vấn thực tập, interviewer (người phỏng vấn) thường không kỳ vọng bạn giải bài cực khó. Họ muốn xem **cách bạn tư duy**: bạn hỏi rõ đề chưa, xử lý trường hợp đặc biệt (edge case) thế nào, code có sạch không, và bạn có biết độ phức tạp của lời giải hay không. Hãy vừa code vừa nói to suy nghĩ của mình.

---

## Bài 1: Đảo ngược một chuỗi (reverse string) `[Basic]`

### Đề bài

Cho một chuỗi (string) đầu vào, hãy trả về chuỗi đó nhưng đảo ngược thứ tự các ký tự.

- Input: `"hello"`
- Output: `"olleh"`

### Hướng tư duy

Có nhiều cách. Cách đơn giản nhất với người mới là duyệt chuỗi từ ký tự cuối về ký tự đầu rồi ghép lại. Cách "ăn điểm" hơn là dùng `StringBuilder` có sẵn phương thức `reverse()`, hoặc dùng hai con trỏ (two pointers) đổi chỗ ký tự đầu và cuối dần vào giữa.

### Lời giải

```java
public class ReverseString {

    // Cách 1: Dùng StringBuilder có sẵn (ngắn gọn nhất)
    public static String reverseBuiltIn(String input) {
        if (input == null) {
            return null; // Xử lý trường hợp null để tránh NullPointerException
        }
        return new StringBuilder(input).reverse().toString();
    }

    // Cách 2: Tự duyệt từ cuối về đầu (thể hiện bạn hiểu bản chất)
    public static String reverseManual(String input) {
        if (input == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        // Duyệt từ ký tự cuối cùng về ký tự đầu tiên
        for (int i = input.length() - 1; i >= 0; i--) {
            sb.append(input.charAt(i));
        }
        return sb.toString();
    }

    // Cách 3: Hai con trỏ, đổi chỗ trực tiếp trên mảng ký tự
    public static String reverseTwoPointers(String input) {
        if (input == null) {
            return null;
        }
        char[] chars = input.toCharArray();
        int left = 0;
        int right = chars.length - 1;
        while (left < right) {
            // Đổi chỗ hai ký tự ở hai đầu
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    public static void main(String[] args) {
        System.out.println(reverseBuiltIn("hello"));     // olleh
        System.out.println(reverseManual("hello"));      // olleh
        System.out.println(reverseTwoPointers("hello")); // olleh
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp thời gian (time complexity): cả ba cách đều **O(n)** với n là độ dài chuỗi.
- Nhắc đến edge case: chuỗi `null`, chuỗi rỗng `""`, chuỗi một ký tự.
- Nếu interviewer cấm dùng `StringBuilder.reverse()`, hãy sẵn sàng trình bày cách 2 hoặc cách 3.
- Lưu ý: trong Java, `String` là bất biến (immutable) nên không thể sửa trực tiếp; ta phải tạo chuỗi mới.

---

## Bài 2: Kiểm tra chuỗi đối xứng (palindrome) `[Basic]`

### Đề bài

Cho một chuỗi, kiểm tra xem nó có phải là palindrome (đọc xuôi và đọc ngược giống nhau) hay không.

- Input: `"madam"` → Output: `true`
- Input: `"hello"` → Output: `false`

### Hướng tư duy

Dùng hai con trỏ: một ở đầu, một ở cuối. So sánh từng cặp ký tự; nếu khác nhau thì không phải palindrome. Tiến dần hai con trỏ vào giữa cho đến khi gặp nhau.

### Lời giải

```java
public class PalindromeChecker {

    public static boolean isPalindrome(String input) {
        if (input == null) {
            return false;
        }
        int left = 0;
        int right = input.length() - 1;
        while (left < right) {
            // Nếu hai ký tự ở hai đầu khác nhau thì không đối xứng
            if (input.charAt(left) != input.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    // Phiên bản nâng cao: bỏ qua hoa/thường và khoảng trắng
    public static boolean isPalindromeIgnoreCase(String input) {
        if (input == null) {
            return false;
        }
        // Chuẩn hóa: chỉ giữ chữ và số, chuyển về chữ thường
        String cleaned = input.toLowerCase().replaceAll("[^a-z0-9]", "");
        int left = 0;
        int right = cleaned.length() - 1;
        while (left < right) {
            if (cleaned.charAt(left) != cleaned.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("madam")); // true
        System.out.println(isPalindrome("hello")); // false
        System.out.println(isPalindromeIgnoreCase("A man a plan a canal Panama")); // true
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp: **O(n)** thời gian, **O(1)** bộ nhớ phụ (với bản hai con trỏ không chuẩn hóa).
- Hỏi lại interviewer: "Có cần phân biệt hoa thường không? Có bỏ qua khoảng trắng và dấu câu không?" — việc hỏi rõ đề rất được đánh giá cao.
- Tránh cách lười là `reverse` rồi so sánh, vì tốn thêm O(n) bộ nhớ; cách hai con trỏ tối ưu hơn.

---

## Bài 3: FizzBuzz `[Basic]`

### Đề bài

In các số từ 1 đến n. Với mỗi số:
- Chia hết cho 3 thì in `"Fizz"`.
- Chia hết cho 5 thì in `"Buzz"`.
- Chia hết cho cả 3 và 5 thì in `"FizzBuzz"`.
- Còn lại thì in chính số đó.

### Hướng tư duy

Đây là bài kinh điển để kiểm tra bạn có biết dùng toán tử chia lấy dư (modulo `%`) và thứ tự điều kiện `if`. Điểm bẫy: **phải kiểm tra điều kiện chia hết cho cả 3 và 5 trước tiên**, nếu không sẽ không bao giờ in được `"FizzBuzz"`.

### Lời giải

```java
public class FizzBuzz {

    public static void fizzBuzz(int n) {
        for (int i = 1; i <= n; i++) {
            // Kiểm tra điều kiện chặt nhất (chia hết cho cả 3 và 5) trước
            if (i % 3 == 0 && i % 5 == 0) {
                System.out.println("FizzBuzz");
            } else if (i % 3 == 0) {
                System.out.println("Fizz");
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
            } else {
                System.out.println(i);
            }
        }
    }

    // Cách viết gọn bằng cách nối chuỗi (linh hoạt hơn khi thêm luật mới)
    public static void fizzBuzzConcat(int n) {
        for (int i = 1; i <= n; i++) {
            StringBuilder result = new StringBuilder();
            if (i % 3 == 0) {
                result.append("Fizz");
            }
            if (i % 5 == 0) {
                result.append("Buzz");
            }
            // Nếu chuỗi rỗng nghĩa là không chia hết cho 3 hay 5
            System.out.println(result.length() == 0 ? String.valueOf(i) : result.toString());
        }
    }

    public static void main(String[] args) {
        fizzBuzz(15);
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp: **O(n)**.
- Nhấn mạnh thứ tự điều kiện: điều kiện `i % 3 == 0 && i % 5 == 0` phải đứng đầu.
- Cách 2 (nối chuỗi) thể hiện tư duy mở rộng: nếu interviewer thêm luật "chia hết cho 7 thì in Bazz", bạn chỉ cần thêm một khối `if` mà không phải sửa lại toàn bộ điều kiện.

---

## Bài 4: Đếm số lần xuất hiện và tìm ký tự xuất hiện nhiều nhất `[Basic]`

### Đề bài

Cho một chuỗi, đếm số lần xuất hiện của từng ký tự và tìm ký tự xuất hiện nhiều nhất.

- Input: `"banana"`
- Output: ký tự xuất hiện nhiều nhất là `'a'` (3 lần).

### Hướng tư duy

Dùng `HashMap<Character, Integer>` để lưu số đếm cho mỗi ký tự. Duyệt chuỗi một lần, mỗi ký tự thì tăng số đếm. Sau đó duyệt map để tìm ký tự có số đếm lớn nhất.

### Lời giải

```java
import java.util.HashMap;
import java.util.Map;

public class CharFrequency {

    // Trả về map đếm số lần xuất hiện của từng ký tự
    public static Map<Character, Integer> countChars(String input) {
        Map<Character, Integer> counts = new HashMap<>();
        if (input == null) {
            return counts;
        }
        for (char c : input.toCharArray()) {
            // getOrDefault trả về 0 nếu ký tự chưa có trong map
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        return counts;
    }

    // Tìm ký tự xuất hiện nhiều nhất
    public static char mostFrequent(String input) {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Chuoi rong khong co ky tu nao");
        }
        Map<Character, Integer> counts = countChars(input);
        char result = input.charAt(0);
        int maxCount = 0;
        for (Map.Entry<Character, Integer> entry : counts.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                result = entry.getKey();
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(countChars("banana")); // {b=1, a=3, n=2}
        System.out.println(mostFrequent("banana")); // a
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp: **O(n)** thời gian (duyệt chuỗi + duyệt map), **O(k)** bộ nhớ với k là số ký tự khác nhau.
- Giải thích vì sao dùng `HashMap`: tra cứu và cập nhật trung bình **O(1)**.
- Edge case: chuỗi rỗng hoặc `null` — nên nói rõ bạn sẽ ném ngoại lệ hay trả về giá trị mặc định.
- Nếu chỉ có ký tự ASCII, có thể tối ưu bằng mảng `int[256]` thay cho `HashMap`.

---

## Bài 5: Kiểm tra số nguyên tố (prime number) `[Basic]`

### Đề bài

Viết hàm kiểm tra một số nguyên `n` có phải là số nguyên tố hay không. Số nguyên tố là số lớn hơn 1 và chỉ chia hết cho 1 và chính nó.

- Input: `7` → Output: `true`
- Input: `9` → Output: `false`

### Hướng tư duy

Cách ngây thơ là kiểm tra mọi số từ 2 đến n-1 xem có chia hết không. Nhưng ta chỉ cần kiểm tra đến **căn bậc hai của n** (square root), vì nếu n có ước số lớn hơn căn bậc hai thì chắc chắn cũng có ước số nhỏ hơn căn bậc hai tương ứng.

### Lời giải

```java
public class PrimeChecker {

    public static boolean isPrime(int n) {
        // Số nhỏ hơn hoặc bằng 1 không phải số nguyên tố
        if (n <= 1) {
            return false;
        }
        // 2 và 3 là số nguyên tố
        if (n <= 3) {
            return true;
        }
        // Loại nhanh các số chia hết cho 2 hoặc 3
        if (n % 2 == 0 || n % 3 == 0) {
            return false;
        }
        // Chỉ cần kiểm tra đến căn bậc hai của n
        // i * i <= n tương đương i <= sqrt(n) nhưng tránh sai số số thực
        for (int i = 5; i * i <= n; i += 6) {
            // Mọi số nguyên tố > 3 đều có dạng 6k +/- 1
            if (n % i == 0 || n % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPrime(7)); // true
        System.out.println(isPrime(9)); // false
        System.out.println(isPrime(1)); // false
        System.out.println(isPrime(2)); // true
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp: **O(√n)** — nhấn mạnh việc chỉ chạy đến căn bậc hai thay vì đến n.
- Edge case quan trọng: `n <= 1` trả về `false`, `n = 2` là số nguyên tố chẵn duy nhất.
- Dùng `i * i <= n` thay cho `i <= Math.sqrt(n)` để tránh sai số dấu phẩy động và tính lại căn liên tục.
- Phiên bản đơn giản hơn (chạy `i` từ 2 đến √n, bước nhảy 1) cũng được chấp nhận cho vị trí thực tập; bản tối ưu `6k ± 1` là điểm cộng.

---

## Bài 6: Giai thừa và dãy Fibonacci — đệ quy vs vòng lặp `[Basic/Intermediate]`

### Đề bài

1. Tính giai thừa của n: `n! = 1 * 2 * ... * n`.
2. Tính số Fibonacci thứ n, với dãy: `0, 1, 1, 2, 3, 5, 8, ...`

Hãy trình bày cả hai cách: đệ quy (recursion) và vòng lặp (iteration).

### Hướng tư duy

- Giai thừa: `n! = n * (n-1)!`, trường hợp cơ sở (base case) là `0! = 1`.
- Fibonacci: `F(n) = F(n-1) + F(n-2)`, base case là `F(0) = 0`, `F(1) = 1`.
- Đệ quy dễ đọc nhưng Fibonacci đệ quy "ngây thơ" rất chậm vì tính lại nhiều lần. Vòng lặp hiệu quả hơn.

### Lời giải

```java
public class FactorialAndFibonacci {

    // ----- Giai thừa -----
    // Cách đệ quy: dùng long để tránh tràn số sớm
    public static long factorialRecursive(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Khong tinh giai thua cho so am");
        }
        if (n <= 1) {
            return 1; // Base case: 0! = 1! = 1
        }
        return n * factorialRecursive(n - 1);
    }

    // Cách vòng lặp
    public static long factorialIterative(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Khong tinh giai thua cho so am");
        }
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // ----- Fibonacci -----
    // Cách đệ quy ngây thơ: dễ hiểu nhưng CHẬM, O(2^n)
    public static long fibRecursive(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Vi tri phai khong am");
        }
        if (n <= 1) {
            return n; // F(0) = 0, F(1) = 1
        }
        return fibRecursive(n - 1) + fibRecursive(n - 2);
    }

    // Cách vòng lặp: nhanh, O(n), chỉ giữ hai giá trị gần nhất
    public static long fibIterative(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Vi tri phai khong am");
        }
        if (n <= 1) {
            return n;
        }
        long prev = 0;
        long curr = 1;
        for (int i = 2; i <= n; i++) {
            long next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }

    public static void main(String[] args) {
        System.out.println(factorialIterative(5)); // 120
        System.out.println(fibIterative(10));      // 55
        System.out.println(fibRecursive(10));      // 55
    }
}
```

### Lưu ý khi phỏng vấn

- Giai thừa: cả hai cách đều **O(n)**. Nhắc về tràn số (overflow): `int` chỉ tính được tới `12!`, nên dùng `long`.
- Fibonacci đệ quy ngây thơ là **O(2^n)** vì tính lại các giá trị trùng lặp — interviewer rất thích nghe bạn nhận ra điểm này.
- Bản vòng lặp Fibonacci là **O(n)** thời gian, **O(1)** bộ nhớ. Nếu được hỏi tối ưu đệ quy, hãy nhắc tới ghi nhớ kết quả (memoization).
- Đệ quy có rủi ro tràn ngăn xếp (stack overflow) khi n quá lớn.

---

## Bài 7: Tìm số lớn nhất, nhỏ nhất và tổng trong mảng `[Basic]`

### Đề bài

Cho một mảng số nguyên, tìm giá trị lớn nhất, nhỏ nhất và tính tổng các phần tử.

- Input: `[3, 7, 1, 9, 4]`
- Output: max = 9, min = 1, sum = 24

### Hướng tư duy

Duyệt mảng một lần. Khởi tạo `max` và `min` bằng phần tử đầu tiên (không nên dùng 0 vì mảng có thể toàn số âm). Trong khi duyệt thì cập nhật `max`, `min` và cộng dồn vào `sum`.

### Lời giải

```java
public class ArrayStats {

    public static void printStats(int[] arr) {
        // Kiểm tra mảng rỗng hoặc null để tránh lỗi
        if (arr == null || arr.length == 0) {
            throw new IllegalArgumentException("Mang rong khong co gia tri");
        }

        // Khởi tạo bằng phần tử đầu tiên, KHÔNG dùng 0
        int max = arr[0];
        int min = arr[0];
        long sum = 0; // dùng long để tránh tràn số khi mảng lớn

        for (int value : arr) {
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
            sum += value;
        }

        System.out.println("Max = " + max);
        System.out.println("Min = " + min);
        System.out.println("Sum = " + sum);
    }

    public static void main(String[] args) {
        printStats(new int[]{3, 7, 1, 9, 4}); // Max=9, Min=1, Sum=24
        printStats(new int[]{-5, -2, -8});    // Max=-2, Min=-8, Sum=-15
    }
}
```

### Lưu ý khi phỏng vấn

- Độ phức tạp: **O(n)** thời gian, **O(1)** bộ nhớ — chỉ cần một lần duyệt.
- Bẫy phổ biến: khởi tạo `max = 0`. Nếu mảng toàn số âm, kết quả sẽ sai. Luôn khởi tạo bằng `arr[0]`.
- Dùng `long` cho `sum` để phòng trường hợp tổng vượt phạm vi `int`.
- Edge case: mảng rỗng hoặc `null` — nên ném ngoại lệ rõ ràng.

---

## Bài 8: Hoán đổi hai số không dùng biến tạm `[Basic]`

### Đề bài

Cho hai số nguyên `a` và `b`, hãy hoán đổi giá trị của chúng mà **không dùng biến tạm** (temporary variable).

- Input: `a = 5, b = 9`
- Output: `a = 9, b = 5`

### Hướng tư duy

Có hai cách phổ biến: dùng phép cộng/trừ, hoặc dùng phép XOR (toán tử `^`). Cách cộng/trừ trực quan hơn nhưng có rủi ro tràn số nếu hai số quá lớn. Cách XOR an toàn với tràn số.

### Lời giải

```java
public class SwapWithoutTemp {

    // Cách 1: dùng cộng và trừ
    public static void swapByArithmetic() {
        int a = 5;
        int b = 9;
        a = a + b; // a = 14
        b = a - b; // b = 14 - 9 = 5 (giá trị cũ của a)
        a = a - b; // a = 14 - 5 = 9 (giá trị cũ của b)
        System.out.println("Arithmetic: a = " + a + ", b = " + b); // a=9, b=5
    }

    // Cách 2: dùng XOR (an toan voi tran so)
    public static void swapByXor() {
        int a = 5;
        int b = 9;
        a = a ^ b; // gộp thông tin của cả a và b
        b = a ^ b; // lấy lại giá trị cũ của a
        a = a ^ b; // lấy lại giá trị cũ của b
        System.out.println("XOR: a = " + a + ", b = " + b); // a=9, b=5
    }

    public static void main(String[] args) {
        swapByArithmetic();
        swapByXor();
    }
}
```

### Lưu ý khi phỏng vấn

- Đây là bài kiểm tra kiến thức về toán tử bit và phép số học, độ phức tạp **O(1)**.
- Nhắc điểm yếu của cách cộng/trừ: có thể tràn số (overflow) khi `a + b` vượt phạm vi `int`.
- Cách XOR không tràn số, nhưng nếu `a` và `b` là **cùng một biến** (cùng vị trí bộ nhớ) thì sẽ ra 0 — đây là bẫy đáng nhắc.
- Trong thực tế làm việc, nên dùng biến tạm cho dễ đọc; bài này chỉ để kiểm tra tư duy.

---

## Bài 9: Kiểm tra hai chuỗi có phải anagram không `[Intermediate]`

### Đề bài

Anagram là hai chuỗi gồm cùng tập hợp ký tự với cùng số lần xuất hiện, chỉ khác thứ tự. Kiểm tra hai chuỗi có phải anagram của nhau không.

- Input: `"listen"`, `"silent"` → Output: `true`
- Input: `"hello"`, `"world"` → Output: `false`

### Hướng tư duy

- Cách 1 (sắp xếp): sắp xếp ký tự của cả hai chuỗi rồi so sánh. Đơn giản nhưng tốn **O(n log n)**.
- Cách 2 (đếm tần suất): đếm số lần xuất hiện mỗi ký tự ở chuỗi 1, rồi trừ đi khi gặp ở chuỗi 2. Nếu cuối cùng mọi số đếm về 0 thì là anagram. Cách này **O(n)**, tối ưu hơn.

Lưu ý đầu tiên: nếu độ dài hai chuỗi khác nhau thì chắc chắn không phải anagram.

### Lời giải

```java
import java.util.Arrays;

public class AnagramChecker {

    // Cách 1: sắp xếp rồi so sánh, O(n log n)
    public static boolean isAnagramBySort(String s1, String s2) {
        if (s1 == null || s2 == null || s1.length() != s2.length()) {
            return false;
        }
        char[] a = s1.toCharArray();
        char[] b = s2.toCharArray();
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }

    // Cách 2: đếm tần suất, O(n) - tối ưu hơn
    public static boolean isAnagramByCount(String s1, String s2) {
        if (s1 == null || s2 == null || s1.length() != s2.length()) {
            return false;
        }
        // Giả sử chỉ có 26 chữ cái thường a-z
        int[] counts = new int[26];
        for (int i = 0; i < s1.length(); i++) {
            counts[s1.charAt(i) - 'a']++; // tăng khi gặp ở chuỗi 1
            counts[s2.charAt(i) - 'a']--; // giảm khi gặp ở chuỗi 2
        }
        // Nếu cân bằng, mọi phần tử phải bằng 0
        for (int count : counts) {
            if (count != 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isAnagramBySort("listen", "silent"));  // true
        System.out.println(isAnagramByCount("listen", "silent")); // true
        System.out.println(isAnagramByCount("hello", "world"));   // false
    }
}
```

### Lưu ý khi phỏng vấn

- Cách sắp xếp: **O(n log n)** thời gian. Cách đếm tần suất: **O(n)** thời gian, **O(1)** bộ nhớ (mảng cố định 26 phần tử).
- Tối ưu đầu tiên: so sánh độ dài trước — nếu khác nhau thì trả về `false` ngay.
- Hỏi rõ phạm vi ký tự: chỉ chữ thường a-z, hay có cả hoa thường, Unicode, khoảng trắng? Điều này quyết định bạn dùng mảng `int[26]` hay `HashMap`.
- Nếu cần hỗ trợ Unicode đầy đủ, hãy dùng `HashMap<Character, Integer>` thay cho mảng cố định.

---

> **Lời khuyên chung khi code tại chỗ:** đọc kỹ đề và hỏi lại nếu chưa rõ; nói to suy nghĩ của bạn; viết code rồi tự "chạy thử" với một ví dụ nhỏ; chủ động nêu edge case và độ phức tạp. Interviewer chấm điểm cả quá trình tư duy chứ không chỉ kết quả cuối cùng.
