---
sidebar_position: 32
title: "Tạo số và chuỗi ngẫu nhiên"
---

# Tạo số và chuỗi ngẫu nhiên trong Java

## Giới thiệu

Tạo **số và chuỗi ngẫu nhiên** là nhu cầu rất phổ biến trong lập trình: từ việc sinh mã OTP, tạo mật khẩu tạm, random test data, đến tạo token bảo mật. Java cung cấp nhiều cách để làm việc này, từ đơn giản (`Math.random()`) đến bảo mật cao (`SecureRandom`).

Hãy tưởng tượng như **xúc xắc**: `Math.random()` giống như xúc xắc thường -- đủ ngẫu nhiên cho trò chơi. `SecureRandom` giống như xúc xắc được kiểm định đặc biệt -- đủ an toàn để dùng trong casino (bảo mật). Tùy vào mục đích, bạn chọn loại phù hợp.

---

## 1. Math.random() -- Cách đơn giản nhất

`Math.random()` trả về một số `double` ngẫu nhiên trong khoảng **[0.0, 1.0)** (từ 0.0 đến gần 1.0, không bao gồm 1.0).

```java
public class MathRandomDemo {
    public static void main(String[] args) {
        // So ngau nhien tu 0.0 den < 1.0
        double random = Math.random();
        System.out.println("Random double: " + random);

        // So nguyen ngau nhien tu 0 den 9
        int randomInt = (int) (Math.random() * 10);
        System.out.println("Random 0-9: " + randomInt);

        // So nguyen ngau nhien tu 1 den 100
        int random1to100 = (int) (Math.random() * 100) + 1;
        System.out.println("Random 1-100: " + random1to100);

        // So nguyen ngau nhien trong khoang [min, max]
        int min = 50;
        int max = 100;
        int randomRange = (int) (Math.random() * (max - min + 1)) + min;
        System.out.println("Random 50-100: " + randomRange);
    }
}
```

**Ưu điểm:** Đơn giản, không cần import.
**Nhược điểm:** Chỉ trả về `double`, không có nhiều tùy chọn, **không thread-safe** (sử dụng shared `Random` instance).

---

## 2. Lớp Random -- Linh hoạt hơn

`java.util.Random` cung cấp nhiều method để tạo số ngẫu nhiên với các kiểu dữ liệu khác nhau.

```java
import java.util.Random;

public class RandomClassDemo {
    public static void main(String[] args) {
        Random random = new Random();

        // nextInt(): so nguyen ngau nhien (toan bo range int)
        int anyInt = random.nextInt();
        System.out.println("Any int: " + anyInt);

        // nextInt(bound): so nguyen tu 0 den bound-1
        int zeroToNine = random.nextInt(10);
        System.out.println("0-9: " + zeroToNine);

        // nextDouble(): tu 0.0 den < 1.0
        double randomDouble = random.nextDouble();
        System.out.println("Double: " + randomDouble);

        // nextLong(): so long ngau nhien
        long randomLong = random.nextLong();
        System.out.println("Long: " + randomLong);

        // nextBoolean(): true hoac false
        boolean randomBool = random.nextBoolean();
        System.out.println("Boolean: " + randomBool);

        // nextFloat(): tu 0.0f den < 1.0f
        float randomFloat = random.nextFloat();
        System.out.println("Float: " + randomFloat);

        // nextGaussian(): phan phoi chuan (trung binh 0, do lech chuan 1)
        double gaussian = random.nextGaussian();
        System.out.println("Gaussian: " + gaussian);
    }
}
```

### Tạo số ngẫu nhiên trong khoảng [min, max]

```java
import java.util.Random;

public class RandomRangeDemo {
    public static void main(String[] args) {
        Random random = new Random();

        // Cong thuc chung: random.nextInt(max - min + 1) + min
        int min = 10;
        int max = 50;
        int result = random.nextInt(max - min + 1) + min;
        System.out.println("Random 10-50: " + result);

        // Tao 10 so ngau nhien tu 1 den 6 (xuc xac)
        System.out.print("Xuc xac: ");
        for (int i = 0; i < 10; i++) {
            int dice = random.nextInt(6) + 1;
            System.out.print(dice + " ");
        }
        System.out.println();
    }
}
```

### Seed -- Tạo kết quả lặp lại được

```java
import java.util.Random;

public class SeedDemo {
    public static void main(String[] args) {
        // Cung seed -> cung day so ngau nhien
        Random r1 = new Random(42);
        Random r2 = new Random(42);

        System.out.println("r1: " + r1.nextInt(100) + ", " + r1.nextInt(100));
        System.out.println("r2: " + r2.nextInt(100) + ", " + r2.nextInt(100));
        // r1 va r2 cho ket qua GIONG NHAU!

        // Khong truyen seed -> dung thoi gian hien tai lam seed
        Random r3 = new Random(); // seed = System.nanoTime() (moi lan khac nhau)
    }
}
```

---

## 3. ThreadLocalRandom (Java 7+) -- Thread-safe và hiệu suất cao

Trong môi trường multi-thread, `Random` có vấn đề về **contention** (nhiều thread tranh giành chung một instance). `ThreadLocalRandom` giải quyết vấn đề này bằng cách tạo **một Random riêng cho mỗi thread**.

```java
import java.util.concurrent.ThreadLocalRandom;

public class ThreadLocalRandomDemo {
    public static void main(String[] args) {
        // So nguyen ngau nhien tu 1 den 100 (bao gom 1, khong bao gom 100)
        int number = ThreadLocalRandom.current().nextInt(1, 100);
        System.out.println("Random 1-99: " + number);

        // So nguyen bao gom ca 2 dau: origin den bound-1
        // Muon 1 den 100 (bao gom 100): dung bound = 101
        int inclusive = ThreadLocalRandom.current().nextInt(1, 101);
        System.out.println("Random 1-100: " + inclusive);

        // Double trong khoang
        double d = ThreadLocalRandom.current().nextDouble(1.0, 10.0);
        System.out.println("Double 1.0-10.0: " + d);

        // Long trong khoang
        long l = ThreadLocalRandom.current().nextLong(1000L, 9999L);
        System.out.println("Long 1000-9998: " + l);

        // Boolean
        boolean b = ThreadLocalRandom.current().nextBoolean();
        System.out.println("Boolean: " + b);
    }
}
```

**Ưu điểm so với Random:**
- **Không contention** trong multi-thread (mỗi thread có instance riêng).
- **API tiện lợi**: `nextInt(origin, bound)` -- truyền thẳng khoảng, không cần tính toán.
- **Hiệu suất cao hơn** trong môi trường concurrent.

---

## 4. SecureRandom -- Bảo mật cao (cryptographic)

`SecureRandom` tạo số ngẫu nhiên **không thể đoán trước được** (cryptographically strong). Dùng cho mật khẩu, token, mã OTP, khóa mã hóa.

```java
import java.security.SecureRandom;

public class SecureRandomDemo {
    public static void main(String[] args) {
        SecureRandom secureRandom = new SecureRandom();

        // So nguyen ngau nhien
        int number = secureRandom.nextInt(1000000); // Ma OTP 6 chu so
        String otp = String.format("%06d", number);
        System.out.println("OTP: " + otp);

        // Bytes ngau nhien (dung cho khoa ma hoa, salt...)
        byte[] bytes = new byte[16];
        secureRandom.nextBytes(bytes);
        System.out.print("Random bytes: ");
        for (byte b : bytes) {
            System.out.printf("%02x", b);
        }
        System.out.println();

        // Token bao mat (hex string)
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        StringBuilder token = new StringBuilder();
        for (byte b : tokenBytes) {
            token.append(String.format("%02x", b));
        }
        System.out.println("Token: " + token);
    }
}
```

**Khi nào dùng SecureRandom?**
- Sinh mật khẩu, token xác thực.
- Mã OTP (One-Time Password).
- Sinh khóa mã hóa, salt, IV.
- Bất kỳ tình huống nào cần **bảo mật** (không cho phép kẻ tấn công đoán giá trị tiếp theo).

---

## 5. Tạo chuỗi ngẫu nhiên

### Cách 1: Thủ công với Random

```java
import java.util.Random;

public class RandomStringManual {
    public static void main(String[] args) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        int length = 12;
        Random random = new Random();

        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        System.out.println("Random string: " + sb.toString());
        // Vi du: "aK3mNp9xBw2Q"
    }
}
```

### Cách 2: Sử dụng UUID

```java
import java.util.UUID;

public class UuidDemo {
    public static void main(String[] args) {
        // UUID v4: 128-bit, ngau nhien, dang chuan
        String uuid = UUID.randomUUID().toString();
        System.out.println("UUID: " + uuid);
        // Vi du: "550e8400-e29b-41d4-a716-446655440000"

        // Loai bo dau gach ngang
        String compact = uuid.replace("-", "");
        System.out.println("Compact: " + compact);
        // Vi du: "550e8400e29b41d4a716446655440000"
    }
}
```

### Cách 3: Sử dụng Random.ints() và Stream (Java 8+)

```java
import java.util.Random;
import java.util.stream.Collectors;

public class RandomStringStream {
    public static void main(String[] args) {
        // Tao chuoi ngau nhien bang stream
        String randomString = new Random().ints(10, 'a', 'z' + 1)
            .mapToObj(i -> String.valueOf((char) i))
            .collect(Collectors.joining());

        System.out.println("Stream random: " + randomString);
        // Vi du: "kmpqxbwnlr"
    }
}
```

### Cách 4: Chuỗi ngẫu nhiên bảo mật (với SecureRandom)

```java
import java.security.SecureRandom;
import java.util.Base64;

public class SecureRandomString {
    public static void main(String[] args) {
        SecureRandom secureRandom = new SecureRandom();

        // Cach 1: Base64 encoded random bytes
        byte[] bytes = new byte[24]; // 24 bytes -> 32 ky tu Base64
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        System.out.println("Secure token: " + token);

        // Cach 2: Hex string
        byte[] hexBytes = new byte[16];
        secureRandom.nextBytes(hexBytes);
        StringBuilder hexString = new StringBuilder();
        for (byte b : hexBytes) {
            hexString.append(String.format("%02x", b));
        }
        System.out.println("Hex token: " + hexString);

        // Cach 3: Custom charset bao mat
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        System.out.println("Secure password: " + password);
    }
}
```

---

## Tổng hợp so sánh

| Cách | Class | Đặc điểm | Khi nào dùng |
|------|-------|---------|-------------|
| `Math.random()` | Math | Đơn giản, chỉ trả về double | Tính toán nhanh, prototyping |
| `Random` | java.util | Nhiều kiểu dữ liệu, có seed | Dùng chung, game, test data |
| `ThreadLocalRandom` | java.util.concurrent | Thread-safe, hiệu suất cao | Multi-thread, server-side |
| `SecureRandom` | java.security | Không đoán trước được | Mật khẩu, token, OTP, crypto |
| `UUID` | java.util | 128-bit unique ID | ID duy nhất, database key |

---

## Khi nào dùng?

| Tình huống | Giải pháp khuyên dùng |
|------------|----------------------|
| Học tập, thử nghiệm nhanh | `Math.random()` |
| Game, simulation | `Random` với seed |
| Server multi-thread | `ThreadLocalRandom` |
| Mật khẩu, token, OTP | `SecureRandom` |
| ID duy nhất cho database | `UUID.randomUUID()` |
| Test data có thể lặp lại | `Random` với seed cố định |

**Best practices:**
- **Không bao giờ dùng `Math.random()` hay `Random`** cho bảo mật (mật khẩu, token, OTP).
- Dùng `ThreadLocalRandom` thay cho `Random` trong multi-thread.
- Dùng `SecureRandom` cho mọi tình huống liên quan đến bảo mật.
- Khi cần **kết quả lặp lại** (testing), dùng seed cố định.
- `UUID.randomUUID()` phù hợp làm **ID duy nhất**, không phù hợp làm mật khẩu.

---

## Lỗi thường gặp

### Lỗi 1: Dùng Random cho bảo mật

```java
// ❌ Sai: Random co the doan truoc duoc
Random random = new Random();
String token = String.valueOf(random.nextLong());
// Ke tan cong co the doan seed va tinh toan token tiep theo!
```

```java
// ✅ Dung: SecureRandom cho bao mat
SecureRandom secureRandom = new SecureRandom();
byte[] bytes = new byte[32];
secureRandom.nextBytes(bytes);
String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
```

### Lỗi 2: Sai công thức random trong khoảng

```java
// ❌ Sai: Thieu +1 -> khong bao gom max
int min = 1, max = 10;
int result = random.nextInt(max - min) + min; // Chi tu 1 den 9!
```

```java
// ✅ Dung: Them +1 de bao gom max
int result = random.nextInt(max - min + 1) + min; // Tu 1 den 10
```

### Lỗi 3: Dùng chung Random instance trong multi-thread

```java
// ❌ Sai: Contention khi nhieu thread dung chung
static final Random SHARED_RANDOM = new Random();
// Nhieu thread goi SHARED_RANDOM.nextInt() -> giam hieu suat
```

```java
// ✅ Dung: ThreadLocalRandom cho multi-thread
int number = ThreadLocalRandom.current().nextInt(100);
```

### Lỗi 4: Không hiểu seed

```java
// ❌ Nham lan: Nghi moi lan chay deu cho ket qua khac
Random r1 = new Random(12345); // Seed co dinh
System.out.println(r1.nextInt(100)); // LUON cho cung ket qua!
```

```java
// ✅ Hieu dung: Khong truyen seed neu muon ket qua khac moi lan
Random r2 = new Random(); // Seed tu dong (tu system time)
System.out.println(r2.nextInt(100)); // Moi lan khac nhau
```

---

## Câu hỏi phỏng vấn

### Câu 1: Math.random() khác gì Random?

**Trả lời:** `Math.random()` phía bên trong sử dụng một instance `Random` static, chỉ trả về `double` trong [0.0, 1.0). Lớp `Random` linh hoạt hơn: có nhiều method (`nextInt`, `nextDouble`, `nextBoolean`, `nextLong`...), hỗ trợ seed để tạo kết quả lặp lại, và có thể tạo nhiều instance độc lập. **Hiệu suất tương đương**, nhưng `Random` cung cấp nhiều tùy chọn hơn.

### Câu 2: SecureRandom khi nào dùng? Tại sao không dùng Random?

**Trả lời:** Dùng `SecureRandom` khi cần **bảo mật** (mật khẩu, token, OTP, khóa mã hóa). `Random` sử dụng thuật toán **pseudo-random** (PRNG) -- nếu biết seed, có thể tính toán được toàn bộ dãy số. `SecureRandom` sử dụng nguồn entropy từ hệ điều hành (như `/dev/urandom` trên Linux), tạo số **không thể đoán trước**. Trade-off: `SecureRandom` **chậm hơn** Random, nên chỉ dùng khi thật sự cần bảo mật.

### Câu 3: Seed là gì? Tác dụng của seed?

**Trả lời:** Seed là giá trị khởi tạo cho bộ tạo số ngẫu nhiên (PRNG). Cùng một seed sẽ tạo ra **cùng một dãy số ngẫu nhiên**. Tác dụng:
- **Testing**: Dùng seed cố định để tạo kết quả lặp lại, dễ kiểm tra.
- **Reproducibility**: Trong game, dùng seed để tái tạo thế giới giống nhau.
- **Debug**: Khi gặp lỗi, lưu seed để tái hiện lại tình huống.
Nếu không truyền seed, `Random` tự động dùng `System.nanoTime()` làm seed.

### Câu 4: ThreadLocalRandom khác gì Random?

**Trả lời:** `ThreadLocalRandom` được thiết kế cho **multi-thread**:
- Mỗi thread có **instance riêng**, không bị contention (tranh giành lock).
- API tiện lợi hơn: `nextInt(origin, bound)` -- truyền thẳng khoảng.
- **Hiệu suất cao hơn** `Random` trong môi trường concurrent (có thể nhanh gấp 3-4 lần).
- Không thể set seed (không dùng cho testing cần reproducibility).
Trong single-thread, hiệu suất tương đương `Random`.
