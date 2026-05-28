---
sidebar_position: 1
title: "1. Cryptography (Mã hóa)"
---

# Cryptography -- Mã hóa trong Java

**Cryptography** (mật mã học) là khoa học bảo vệ thông tin -- biến dữ liệu thành dạng "khó đọc" với người không có khóa. Trong Java, bạn dùng các API trong package `javax.crypto` và `java.security`.

**Tương tự đơn giản:** Hãy tưởng tượng bạn gửi thư bí mật. Bạn dùng **mật mã** -- thay mỗi chữ A bằng chữ D, B bằng E... Người nhận có "khóa giải mã" sẽ đọc được. Người ngoài thấy thư vô nghĩa. Đó chính là encryption.

---

## Mục lục

- [1. Các loại Cryptography](#1-các-loại-cryptography)
- [2. Hashing (Băm)](#2-hashing-băm)
- [3. Symmetric Encryption (AES)](#3-symmetric-encryption-aes)
- [4. Asymmetric Encryption (RSA)](#4-asymmetric-encryption-rsa)
- [5. Digital Signature](#5-digital-signature)
- [6. Password Hashing (BCrypt)](#6-password-hashing-bcrypt)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Các loại Cryptography

| Loại                    | Đặc điểm                                          | Ví dụ            |
| ----------------------- | ------------------------------------------------- | ---------------- |
| **Hashing**             | Một chiều -- không giải ngược được                | SHA-256, MD5     |
| **Symmetric Encryption** | Cùng 1 khóa để mã hóa và giải mã                 | AES, DES         |
| **Asymmetric Encryption** | 2 khóa: public (mã hóa) + private (giải mã)     | RSA, ECC         |
| **Digital Signature**   | Ký số -- xác thực nguồn gốc                       | RSA-SHA256       |

**Giải thích thuật ngữ:**

- **Hashing:** Biến input thành chuỗi cố định, không thể đảo ngược
- **Symmetric:** Đối xứng -- cùng 1 khóa, nhanh nhưng phải chia sẻ khóa an toàn
- **Asymmetric:** Bất đối xứng -- 2 khóa, an toàn hơn, chậm hơn

---

## 2. Hashing (Băm)

Hashing dùng để **kiểm tra integrity** (file có bị sửa không) và **lưu mật khẩu**.

```java
import java.security.MessageDigest;
import java.util.HexFormat;

public class HashDemo {
    public static String sha256(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(input.getBytes());
        return HexFormat.of().formatHex(hash);
    }

    public static void main(String[] args) throws Exception {
        System.out.println(sha256("hello"));
        // Ket qua: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    }
}
```

### Các thuật toán hash phổ biến

| Thuật toán    | Output      | Trạng thái                        |
| ------------- | ----------- | --------------------------------- |
| **MD5**       | 128 bit     | KHÔNG dùng -- đã bị crack         |
| **SHA-1**     | 160 bit     | KHÔNG dùng -- đã yếu              |
| **SHA-256**   | 256 bit     | An toàn -- phổ biến nhất          |
| **SHA-512**   | 512 bit     | An toàn -- chậm hơn SHA-256       |
| **BCrypt**    | -           | Dành riêng cho mật khẩu           |

---

## 3. Symmetric Encryption (AES)

**AES** (Advanced Encryption Standard) là thuật toán đối xứng phổ biến nhất.

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import java.security.SecureRandom;
import java.util.Base64;

public class AESDemo {
    public static void main(String[] args) throws Exception {
        // 1. Sinh khoa 256-bit
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256);
        SecretKey key = keyGen.generateKey();

        // 2. Sinh IV (Initialization Vector) 16 byte
        byte[] iv = new byte[16];
        new SecureRandom().nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // 3. Ma hoa
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
        byte[] encrypted = cipher.doFinal("Bi mat".getBytes());
        System.out.println("Encrypted: " + Base64.getEncoder().encodeToString(encrypted));

        // 4. Giai ma
        cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
        byte[] decrypted = cipher.doFinal(encrypted);
        System.out.println("Decrypted: " + new String(decrypted));
    }
}
```

**Giải thích thuật ngữ:**

- **IV (Initialization Vector):** Vector khởi tạo, đảm bảo cùng plaintext + key không tạo cùng ciphertext
- **CBC (Cipher Block Chaining):** Mode mã hóa, từng block phụ thuộc block trước
- **PKCS5Padding:** Cách "đệm" dữ liệu cho đủ block 16 byte

### Modes phổ biến

| Mode  | Đặc điểm                                          |
| ----- | ------------------------------------------------- |
| ECB   | Đơn giản nhưng **không an toàn** -- tránh dùng    |
| CBC   | An toàn, phổ biến                                 |
| GCM   | Có authentication, **khuyến nghị**                |

---

## 4. Asymmetric Encryption (RSA)

```java
import java.security.*;
import javax.crypto.Cipher;
import java.util.Base64;

public class RSADemo {
    public static void main(String[] args) throws Exception {
        // 1. Sinh cap khoa
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair pair = keyGen.generateKeyPair();
        PublicKey pub = pair.getPublic();
        PrivateKey priv = pair.getPrivate();

        // 2. Ma hoa bang public key
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, pub);
        byte[] encrypted = cipher.doFinal("Bi mat".getBytes());
        System.out.println("Encrypted: " + Base64.getEncoder().encodeToString(encrypted));

        // 3. Giai ma bang private key
        cipher.init(Cipher.DECRYPT_MODE, priv);
        byte[] decrypted = cipher.doFinal(encrypted);
        System.out.println("Decrypted: " + new String(decrypted));
    }
}
```

**Khi nào dùng RSA:**

- Trao đổi khóa AES qua kênh không an toàn
- HTTPS (TLS handshake)
- Ký số

---

## 5. Digital Signature

Ký số xác thực **nguồn gốc** và **toàn vẹn** dữ liệu.

```java
import java.security.*;

public class SignatureDemo {
    public static void main(String[] args) throws Exception {
        KeyPair pair = KeyPairGenerator.getInstance("RSA").generateKeyPair();

        // Ky
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(pair.getPrivate());
        signer.update("Hop dong A".getBytes());
        byte[] signature = signer.sign();

        // Xac minh
        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(pair.getPublic());
        verifier.update("Hop dong A".getBytes());
        System.out.println("Valid: " + verifier.verify(signature)); // true
    }
}
```

---

## 6. Password Hashing (BCrypt)

KHÔNG dùng SHA-256 cho mật khẩu -- quá nhanh, dễ brute-force. Dùng **BCrypt**, **Argon2**, hoặc **PBKDF2**.

```java
// Maven: <dependency>org.springframework.security:spring-security-crypto</dependency>
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordDemo {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Hash khi dang ky
        String hashed = encoder.encode("matkhau123");
        System.out.println(hashed);

        // Kiem tra khi dang nhap
        boolean match = encoder.matches("matkhau123", hashed);
        System.out.println("Match: " + match); // true
    }
}
```

**Giải thích:**

- BCrypt **chậm có chủ đích** -- attacker phải mất nhiều thời gian brute-force
- Tự động thêm **salt** -- 2 lần hash cùng password ra hash khác nhau
- Có **work factor** -- tăng theo thời gian (computer mạnh hơn = tăng độ khó)

---

## Khi nào dùng?

- **Hashing:**
  - Kiểm tra integrity file (checksum)
  - Tạo ID không trùng (hash của content)
- **BCrypt/Argon2:**
  - Lưu mật khẩu user
- **AES:**
  - Mã hóa dữ liệu lớn (file, DB column)
  - Session encryption
- **RSA:**
  - HTTPS handshake (trao đổi khóa AES)
  - JWT signing
  - Chữ ký số
- **Best practice:**
  - Dùng `SecureRandom`, không dùng `Random`
  - Luôn dùng IV cho symmetric encryption
  - Ưu tiên **AES-GCM** thay AES-CBC
  - Đừng tự viết thuật toán -- dùng thư viện chuẩn (BouncyCastle, JCE)

---

## Lỗi thường gặp

### Lỗi 1: Dùng MD5/SHA-1

```java
// SAI -- da yeu
MessageDigest.getInstance("MD5");

// DUNG
MessageDigest.getInstance("SHA-256");
```

### Lỗi 2: Lưu password bằng hash thường

```java
// SAI -- hacker brute-force 1 ti hash/giay
String hashed = sha256(password);

// DUNG -- BCrypt cham co chu dich
String hashed = bCrypt.encode(password);
```

### Lỗi 3: Hardcode khóa trong code

```java
// SAI
private static final String KEY = "supersecret123";

// DUNG -- doc tu env hoac Key Vault
String key = System.getenv("AES_KEY");
```

### Lỗi 4: Dùng ECB mode

```java
// SAI -- ECB tao pattern, khong an toan
Cipher.getInstance("AES/ECB/PKCS5Padding");

// DUNG
Cipher.getInstance("AES/GCM/NoPadding");
```

### Lỗi 5: Tái sử dụng IV

```java
// SAI -- IV cung cho moi lan ma hoa
byte[] iv = new byte[16]; // toan 0

// DUNG -- sinh IV moi moi lan
byte[] iv = new byte[16];
new SecureRandom().nextBytes(iv);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa Hashing và Encryption?

**Trả lời:**

- **Hashing**: Một chiều -- không thể giải ngược (SHA-256). Dùng kiểm tra integrity, lưu password
- **Encryption**: Hai chiều -- có thể giải mã với khóa (AES, RSA). Dùng bảo vệ thông tin cần đọc lại

### Câu 2: Symmetric vs Asymmetric -- nên dùng cái nào?

**Trả lời:**

- **Symmetric (AES)**: Nhanh -- dùng mã hóa dữ liệu lớn
- **Asymmetric (RSA)**: Chậm -- chỉ dùng trao đổi khóa

Thực tế, HTTPS dùng **cả hai**: RSA để trao đổi khóa AES, sau đó dùng AES mã hóa traffic.

### Câu 3: Tại sao không nên dùng SHA-256 cho password?

**Trả lời:** SHA-256 quá nhanh -- GPU có thể tính hàng tỉ hash/giây, dễ brute-force. **BCrypt/Argon2** chậm có chủ đích (work factor có thể tăng), tự thêm salt, được thiết kế chuyên cho password.

### Câu 4: Salt là gì? Tại sao cần?

**Trả lời:** **Salt** là chuỗi ngẫu nhiên thêm vào password trước khi hash. Mục đích:

- Cùng password nhưng hash khác nhau -- attacker không dùng được **rainbow table**
- Mỗi user có salt riêng -- crack 1 không có nghĩa crack hết

BCrypt tự sinh salt và lưu kèm hash.

### Câu 5: Digital Signature hoạt động thế nào?

**Trả lời:**

1. Hash dữ liệu cần ký (SHA-256)
2. Mã hóa hash bằng **private key** -- tạo ra signature
3. Người nhận giải mã signature bằng **public key** -- ra hash
4. Hash dữ liệu nhận được và so sánh với hash giải mã

Nếu khớp = dữ liệu **không bị sửa** và **đúng người ký**.
