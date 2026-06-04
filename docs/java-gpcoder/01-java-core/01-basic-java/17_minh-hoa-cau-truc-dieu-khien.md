---
sidebar_position: 17
title: "Minh họa sử dụng cấu trúc điều khiển trong Java"
---

# Minh họa sử dụng cấu trúc điều khiển trong Java

Bài này tổng hợp các **cấu trúc điều khiển** (control structures) qua các bài toán thực tế, giúp bạn thấy cách kết hợp `if-else`, `switch`, vòng lặp, `break`, và `continue` trong cùng một chương trình.

---

## Bài toán 1: Kiểm tra số nguyên tố

**Số nguyên tố** (prime number) là số lớn hơn 1, chỉ chia hết cho 1 và chính nó.

```java
public class PrimeChecker {
    public static boolean isPrime(int n) {
        if (n < 2) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;

        // Chỉ cần kiểm tra đến căn bậc hai của n
        for (int i = 3; i * i <= n; i += 2) {
            if (n % i == 0) {
                return false;  // Chia hết → không phải số nguyên tố
            }
        }
        return true;
    }

    public static void main(String[] args) {
        // In các số nguyên tố từ 1 đến 50
        System.out.print("Số nguyên tố từ 1 đến 50: ");
        for (int i = 2; i <= 50; i++) {
            if (isPrime(i)) {
                System.out.print(i + " ");
            }
        }
    }
}
```

**Kết quả:**
```
Số nguyên tố từ 1 đến 50: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
```

---

## Bài toán 2: In tam giác sao

```java
public class StarTriangle {
    public static void main(String[] args) {
        int rows = 5;

        // Tam giác vuông
        System.out.println("Tam giác vuông:");
        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }

        System.out.println();

        // Tam giác cân
        System.out.println("Tam giác cân:");
        for (int i = 1; i <= rows; i++) {
            // In khoảng trắng
            for (int j = 1; j <= rows - i; j++) {
                System.out.print("  ");
            }
            // In dấu sao
            for (int j = 1; j <= 2 * i - 1; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }
}
```

**Kết quả:**
```
Tam giác vuông:
*
* *
* * *
* * * *
* * * * *

Tam giác cân:
        *
      * * *
    * * * * *
  * * * * * * *
* * * * * * * * *
```

---

## Bài toán 3: Máy tính đơn giản

```java
import java.util.Scanner;

public class SimpleCalculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean continueRunning = true;

        System.out.println("=== MÁY TÍNH ĐƠN GIẢN ===");

        while (continueRunning) {
            System.out.print("\nNhập phép tính (VD: 5 + 3) hoặc 'q' để thoát: ");
            String input = scanner.nextLine().trim();

            if (input.equalsIgnoreCase("q")) {
                System.out.println("Tạm biệt!");
                break;
            }

            String[] parts = input.split(" ");
            if (parts.length != 3) {
                System.out.println("Định dạng sai! Hãy nhập: số1 toán_tử số2");
                continue;
            }

            try {
                double a = Double.parseDouble(parts[0]);
                String operator = parts[1];
                double b = Double.parseDouble(parts[2]);
                double result;

                switch (operator) {
                    case "+" -> result = a + b;
                    case "-" -> result = a - b;
                    case "*" -> result = a * b;
                    case "/" -> {
                        if (b == 0) {
                            System.out.println("Lỗi: Không thể chia cho 0!");
                            continue;
                        }
                        result = a / b;
                    }
                    default -> {
                        System.out.println("Toán tử không hợp lệ: " + operator);
                        continue;
                    }
                }

                System.out.printf("Kết quả: %.2f%n", result);

            } catch (NumberFormatException e) {
                System.out.println("Lỗi: Vui lòng nhập số hợp lệ!");
            }
        }

        scanner.close();
    }
}
```

---

## Bài toán 4: FizzBuzz

Bài toán kinh điển trong phỏng vấn lập trình:
- Số chia hết cho 3: in "Fizz"
- Số chia hết cho 5: in "Buzz"
- Số chia hết cho cả 3 và 5: in "FizzBuzz"
- Còn lại: in số đó

```java
public class FizzBuzz {
    public static void main(String[] args) {
        for (int i = 1; i <= 30; i++) {
            if (i % 15 == 0) {
                System.out.println(i + " → FizzBuzz");
            } else if (i % 3 == 0) {
                System.out.println(i + " → Fizz");
            } else if (i % 5 == 0) {
                System.out.println(i + " → Buzz");
            } else {
                System.out.println(i);
            }
        }
    }
}
```

**Kết quả (một phần):**
```
1
2
3 → Fizz
4
5 → Buzz
6 → Fizz
...
15 → FizzBuzz
...
```

---

## Bài toán 5: Tính giai thừa và Fibonacci

```java
public class MathSequences {
    // Tính giai thừa n! = 1 * 2 * 3 * ... * n
    public static long factorial(int n) {
        if (n < 0) throw new IllegalArgumentException("n phải >= 0");
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // In dãy Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, ...
    public static void fibonacci(int count) {
        long a = 0, b = 1;
        System.out.print("Fibonacci: " + a + " " + b);

        for (int i = 2; i < count; i++) {
            long next = a + b;
            System.out.print(" " + next);
            a = b;
            b = next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // Giai thừa
        for (int i = 0; i <= 10; i++) {
            System.out.println(i + "! = " + factorial(i));
        }

        System.out.println();

        // Fibonacci 15 số đầu
        fibonacci(15);
    }
}
```

**Kết quả:**
```
0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
...
10! = 3628800

Fibonacci: 0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

---

## Tóm tắt

Qua các bài toán minh họa, bạn thấy cách kết hợp:

| Cấu trúc | Dùng khi |
|---|---|
| `if-else` | Rẽ nhánh theo điều kiện phức tạp |
| `switch` | Rẽ nhánh theo giá trị cụ thể |
| `for` | Biết trước số lần lặp |
| `while` | Không biết trước số lần lặp |
| `break` | Thoát sớm khi tìm được kết quả |
| `continue` | Bỏ qua các trường hợp không phù hợp |
