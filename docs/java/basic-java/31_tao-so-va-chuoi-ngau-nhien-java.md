---
sidebar_position: 32
title: "Tao so va chuoi ngau nhien"
---

# Tao so va chuoi ngau nhien trong Java

## Gioi thieu

Tao **so va chuoi ngau nhien** la nhu cau rat pho bien trong lap trinh: tu viec sinh ma OTP, tao mat khau tam, random test data, den tao token bao mat. Java cung cap nhieu cach de lam viec nay, tu don gian (`Math.random()`) den bao mat cao (`SecureRandom`).

Hay tuong tuong nhu **xuc xac**: `Math.random()` giong nhu xuc xac thuong -- du ngau nhien cho tro choi. `SecureRandom` giong nhu xuc xac duoc kiem dinh dac biet -- du an toan de dung trong casino (bao mat). Tuy vao muc dich, ban chon loai phu hop.

---

## 1. Math.random() -- Cach don gian nhat

`Math.random()` tra ve mot so `double` ngau nhien trong khoang **[0.0, 1.0)** (tu 0.0 den gan 1.0, khong bao gom 1.0).

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

**Uu diem:** Don gian, khong can import.
**Nhuoc diem:** Chi tra ve `double`, khong co nhieu tuy chon, **khong thread-safe** (su dung shared `Random` instance).

---

## 2. Lop Random -- Linh hoat hon

`java.util.Random` cung cap nhieu method de tao so ngau nhien voi cac kieu du lieu khac nhau.

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

### Tao so ngau nhien trong khoang [min, max]

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

### Seed -- Tao ket qua lap lai duoc

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

## 3. ThreadLocalRandom (Java 7+) -- Thread-safe va hieu suat cao

Trong moi truong multi-thread, `Random` co van de ve **contention** (nhieu thread tranh gianh chung mot instance). `ThreadLocalRandom` giai quyet van de nay bang cach tao **mot Random rieng cho moi thread**.

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

**Uu diem so voi Random:**
- **Khong contention** trong multi-thread (moi thread co instance rieng).
- **API tien loi**: `nextInt(origin, bound)` -- truyen thang khoang, khong can tinh toan.
- **Hieu suat cao hon** trong moi truong concurrent.

---

## 4. SecureRandom -- Bao mat cao (cryptographic)

`SecureRandom` tao so ngau nhien **khong the doan truoc duoc** (cryptographically strong). Dung cho mat khau, token, ma OTP, khoa ma hoa.

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

**Khi nao dung SecureRandom?**
- Sinh mat khau, token xac thuc.
- Ma OTP (One-Time Password).
- Sinh khoa ma hoa, salt, IV.
- Bat ky tinh huong nao can **bao mat** (khong cho phep ke tan cong doan gia tri tiep theo).

---

## 5. Tao chuoi ngau nhien

### Cach 1: Thu cong voi Random

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

### Cach 2: Su dung UUID

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

### Cach 3: Su dung Random.ints() va Stream (Java 8+)

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

### Cach 4: Chuoi ngau nhien bao mat (voi SecureRandom)

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

## Tong hop so sanh

| Cach | Class | Dac diem | Khi nao dung |
|------|-------|---------|-------------|
| `Math.random()` | Math | Don gian, chi tra ve double | Tinh toan nhanh, prototyping |
| `Random` | java.util | Nhieu kieu du lieu, co seed | Dung chung, game, test data |
| `ThreadLocalRandom` | java.util.concurrent | Thread-safe, hieu suat cao | Multi-thread, server-side |
| `SecureRandom` | java.security | Khong doan truoc duoc | Mat khau, token, OTP, crypto |
| `UUID` | java.util | 128-bit unique ID | ID duy nhat, database key |

---

## Khi nao dung?

| Tinh huong | Giai phap khuyen dung |
|------------|----------------------|
| Hoc tap, thu nghiem nhanh | `Math.random()` |
| Game, simulation | `Random` voi seed |
| Server multi-thread | `ThreadLocalRandom` |
| Mat khau, token, OTP | `SecureRandom` |
| ID duy nhat cho database | `UUID.randomUUID()` |
| Test data co the lap lai | `Random` voi seed co dinh |

**Best practices:**
- **Khong bao gio dung `Math.random()` hay `Random`** cho bao mat (mat khau, token, OTP).
- Dung `ThreadLocalRandom` thay cho `Random` trong multi-thread.
- Dung `SecureRandom` cho moi tinh huong lien quan den bao mat.
- Khi can **ket qua lap lai** (testing), dung seed co dinh.
- `UUID.randomUUID()` phu hop lam **ID duy nhat**, khong phu hop lam mat khau.

---

## Loi thuong gap

### Loi 1: Dung Random cho bao mat

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

### Loi 2: Sai cong thuc random trong khoang

```java
// ❌ Sai: Thieu +1 -> khong bao gom max
int min = 1, max = 10;
int result = random.nextInt(max - min) + min; // Chi tu 1 den 9!
```

```java
// ✅ Dung: Them +1 de bao gom max
int result = random.nextInt(max - min + 1) + min; // Tu 1 den 10
```

### Loi 3: Dung chung Random instance trong multi-thread

```java
// ❌ Sai: Contention khi nhieu thread dung chung
static final Random SHARED_RANDOM = new Random();
// Nhieu thread goi SHARED_RANDOM.nextInt() -> giam hieu suat
```

```java
// ✅ Dung: ThreadLocalRandom cho multi-thread
int number = ThreadLocalRandom.current().nextInt(100);
```

### Loi 4: Khong hieu seed

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

## Cau hoi phong van

### Cau 1: Math.random() khac gi Random?

**Tra loi:** `Math.random()` phia ben trong su dung mot instance `Random` static, chi tra ve `double` trong [0.0, 1.0). Lop `Random` linh hoat hon: co nhieu method (`nextInt`, `nextDouble`, `nextBoolean`, `nextLong`...), ho tro seed de tao ket qua lap lai, va co the tao nhieu instance doc lap. **Hieu suat tuong duong**, nhung `Random` cung cap nhieu tuy chon hon.

### Cau 2: SecureRandom khi nao dung? Tai sao khong dung Random?

**Tra loi:** Dung `SecureRandom` khi can **bao mat** (mat khau, token, OTP, khoa ma hoa). `Random` su dung thuat toan **pseudo-random** (PRNG) -- neu biet seed, co the tinh toan duoc toan bo day so. `SecureRandom` su dung nguon entropy tu he dieu hanh (nhu `/dev/urandom` tren Linux), tao so **khong the doan truoc**. Trade-off: `SecureRandom` **cham hon** Random, nen chi dung khi that su can bao mat.

### Cau 3: Seed la gi? Tac dung cua seed?

**Tra loi:** Seed la gia tri khoi tao cho bo tao so ngau nhien (PRNG). Cung mot seed se tao ra **cung mot day so ngau nhien**. Tac dung:
- **Testing**: Dung seed co dinh de tao ket qua lap lai, de kiem tra.
- **Reproducibility**: Trong game, dung seed de tai tao the gioi giong nhau.
- **Debug**: Khi gap loi, luu seed de tai hien lai tinh huong.
Neu khong truyen seed, `Random` tu dong dung `System.nanoTime()` lam seed.

### Cau 4: ThreadLocalRandom khac gi Random?

**Tra loi:** `ThreadLocalRandom` duoc thiet ke cho **multi-thread**:
- Moi thread co **instance rieng**, khong bi contention (tranh gianh lock).
- API tien loi hon: `nextInt(origin, bound)` -- truyen thang khoang.
- **Hieu suat cao hon** `Random` trong moi truong concurrent (co the nhanh gap 3-4 lan).
- Khong the set seed (khong dung cho testing can reproducibility).
Trong single-thread, hieu suat tuong duong `Random`.
