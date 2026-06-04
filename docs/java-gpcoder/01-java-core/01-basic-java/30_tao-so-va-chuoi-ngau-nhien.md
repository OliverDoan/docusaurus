---
sidebar_position: 30
title: "Tạo số và chuỗi ngẫu nhiên trong Java"
---

# Tạo số và chuỗi ngẫu nhiên trong Java

Java cung cấp nhiều cách để sinh số và chuỗi ngẫu nhiên. Bài này trình bày đầy đủ các phương pháp từ cơ bản đến nâng cao.

---

## 1. Math.random()

Cách đơn giản nhất — trả về số thực ngẫu nhiên trong khoảng `[0.0, 1.0)`:

```java
public class MathRandomDemo {
    public static void main(String[] args) {
        // Số thực ngẫu nhiên [0.0, 1.0)
        double d = Math.random();
        System.out.println("Random: " + d);  // Ví dụ: 0.7234512356

        // Số nguyên ngẫu nhiên trong [min, max]
        int min = 1, max = 100;
        int randInt = (int) (Math.random() * (max - min + 1)) + min;
        System.out.println("Random 1-100: " + randInt);

        // Số chẵn ngẫu nhiên từ 0 đến 10
        int evenRand = (int) (Math.random() * 6) * 2;
        System.out.println("Số chẵn: " + evenRand);
    }
}
```

---

## 2. java.util.Random

Lớp `Random` linh hoạt hơn, cung cấp nhiều phương thức:

```java
import java.util.Random;

public class RandomClassDemo {
    public static void main(String[] args) {
        Random random = new Random();

        // Số nguyên ngẫu nhiên (có thể âm)
        int i1 = random.nextInt();
        System.out.println("nextInt(): " + i1);

        // Số nguyên ngẫu nhiên trong [0, bound)
        int i2 = random.nextInt(100);     // [0, 100)
        System.out.println("nextInt(100): " + i2);

        // Java 17+: nextInt(origin, bound) — trong [origin, bound)
        int i3 = random.nextInt(1, 101);  // [1, 101) = [1, 100]
        System.out.println("nextInt(1, 101): " + i3);

        // Số thực [0.0, 1.0)
        double d = random.nextDouble();
        System.out.println("nextDouble(): " + d);

        // Số thực trong phạm vi
        double d2 = random.nextDouble(10.0, 20.0);  // Java 17+
        System.out.println("nextDouble(10, 20): " + d2);

        // Long
        long l = random.nextLong();
        System.out.println("nextLong(): " + l);

        // Boolean
        boolean b = random.nextBoolean();
        System.out.println("nextBoolean(): " + b);

        // Gaussian (phân phối chuẩn, trung bình 0, độ lệch 1)
        double g = random.nextGaussian();
        System.out.println("nextGaussian(): " + g);
    }
}
```

---

## 3. ThreadLocalRandom — An toàn đa luồng

**`ThreadLocalRandom`** được thiết kế cho môi trường đa luồng (**multithreading**), nhanh hơn `Random` khi dùng nhiều luồng:

```java
import java.util.concurrent.ThreadLocalRandom;

public class ThreadLocalRandomDemo {
    public static void main(String[] args) {
        // Số nguyên [min, max]
        int rand = ThreadLocalRandom.current().nextInt(1, 101);  // [1, 100]
        System.out.println("Random 1-100: " + rand);

        // Số thực [0.5, 1.0)
        double d = ThreadLocalRandom.current().nextDouble(0.5, 1.0);
        System.out.println("Random 0.5-1.0: " + d);

        // Long
        long l = ThreadLocalRandom.current().nextLong(100L, 1000L);
        System.out.println("Random Long 100-1000: " + l);

        // Dùng trong nhiều luồng
        Runnable task = () -> {
            int num = ThreadLocalRandom.current().nextInt(100);
            System.out.println(Thread.currentThread().getName() + ": " + num);
        };

        Thread t1 = new Thread(task, "Thread-1");
        Thread t2 = new Thread(task, "Thread-2");
        t1.start();
        t2.start();
    }
}
```

---

## 4. SecureRandom — Bảo mật cao

**`SecureRandom`** dùng cho các trường hợp cần bảo mật: sinh mã OTP, token, mật khẩu tạm thời...

```java
import java.security.SecureRandom;

public class SecureRandomDemo {
    public static void main(String[] args) {
        SecureRandom secureRandom = new SecureRandom();

        // Số nguyên ngẫu nhiên bảo mật
        int i = secureRandom.nextInt(1000000);
        System.out.println("OTP: " + String.format("%06d", i));

        // Mảng byte ngẫu nhiên (dùng cho token, session key)
        byte[] token = new byte[16];
        secureRandom.nextBytes(token);

        // Chuyển thành hex string
        StringBuilder hexToken = new StringBuilder();
        for (byte b : token) {
            hexToken.append(String.format("%02x", b));
        }
        System.out.println("Token: " + hexToken);
    }
}
```

---

## 5. Sinh chuỗi ngẫu nhiên

### Chuỗi chữ số ngẫu nhiên (OTP)

```java
import java.security.SecureRandom;

public class OTPGenerator {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOTP(int length) {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10));  // Chữ số 0-9
        }
        return otp.toString();
    }

    public static void main(String[] args) {
        System.out.println("OTP 4 số: " + generateOTP(4));
        System.out.println("OTP 6 số: " + generateOTP(6));
        // OTP 4 số: 7283
        // OTP 6 số: 495812
    }
}
```

### Chuỗi chữ và số ngẫu nhiên

```java
import java.security.SecureRandom;

public class RandomStringGenerator {
    private static final String CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String CHARS_SPECIAL =
            CHARS + "!@#$%^&*";
    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length, boolean includeSpecial) {
        String charset = includeSpecial ? CHARS_SPECIAL : CHARS;
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(charset.charAt(random.nextInt(charset.length())));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        // Mã xác nhận đơn giản
        System.out.println("Code: " + generate(8, false));
        // Ví dụ: Code: aB3kRm9L

        // Mật khẩu tạm thời có ký tự đặc biệt
        System.out.println("Password: " + generate(12, true));
        // Ví dụ: Password: aB3!kRm9L@2#
    }
}
```

### UUID — Chuỗi định danh duy nhất

**UUID** (Universally Unique Identifier — Định danh duy nhất toàn cầu) là chuỗi 128-bit, gần như không bao giờ trùng nhau:

```java
import java.util.UUID;

public class UUIDDemo {
    public static void main(String[] args) {
        // Tạo UUID ngẫu nhiên
        UUID uuid = UUID.randomUUID();
        System.out.println(uuid);
        // Ví dụ: 550e8400-e29b-41d4-a716-446655440000

        // Dùng làm ID cho đối tượng
        String userId = UUID.randomUUID().toString();
        String orderId = UUID.randomUUID().toString().replace("-", "");  // Bỏ dấu gạch

        System.out.println("User ID: " + userId);
        System.out.println("Order ID: " + orderId);
    }
}
```

---

## 6. Xáo trộn danh sách ngẫu nhiên

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class ShuffleDemo {
    public static void main(String[] args) {
        List<String> cards = new ArrayList<>(
            List.of("A♠", "K♥", "Q♦", "J♣", "10♠", "9♥", "8♦", "7♣")
        );

        System.out.println("Trước khi xáo: " + cards);

        // Xáo trộn ngẫu nhiên
        Collections.shuffle(cards);
        System.out.println("Sau khi xáo: " + cards);

        // Xáo trộn với seed (để tái tạo lại kết quả)
        Collections.shuffle(cards, new Random(42));
        System.out.println("Với seed 42: " + cards);
    }
}
```

---

## So sánh các cách sinh số ngẫu nhiên

| Phương pháp | Tốc độ | An toàn đa luồng | Bảo mật | Dùng khi |
|---|---|---|---|---|
| `Math.random()` | Nhanh | Không | Không | Code đơn giản |
| `Random` | Nhanh | Không | Không | Single-thread |
| `ThreadLocalRandom` | Rất nhanh | Có | Không | Multi-thread thông thường |
| `SecureRandom` | Chậm nhất | Có | Có | OTP, token, mật khẩu |

---

## Tóm tắt

- **`Math.random()`**: Nhanh, đơn giản, đủ dùng cho bài toán phổ thông
- **`Random`**: Linh hoạt hơn, nhiều phương thức (`nextInt`, `nextDouble`, ...)
- **`ThreadLocalRandom`**: Khuyến nghị cho môi trường đa luồng
- **`SecureRandom`**: Bắt buộc dùng khi cần bảo mật (OTP, token, mật khẩu)
- **`UUID`**: Tạo ID duy nhất toàn cầu
