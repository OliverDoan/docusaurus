# Tạo số và chuỗi ngẫu nhiên

## Giới thiệu
Việc tạo **số và chuỗi ngẫu nhiên** rất phổ biến trong Java:
- Sinh mật khẩu
- Token
- Test dữ liệu

---

## Nội dung

1. [Sử dụng Math.random()](#1-sử-dụng-mathrandom)  
2. [Sử dụng lớp Random](#2-sử-dụng-lớp-random)  
3. [Sử dụng SecureRandom](#3-sử-dụng-securerandom)  
4. [Tạo chuỗi ngẫu nhiên](#4-tạo-chuỗi-ngẫu-nhiên)  
5. [Tổng kết](#5-tổng-kết)  

---

## 1. Sử dụng Math.random()

```java
double x = Math.random(); // 0.0 -> 1.0
```

---

## 2. Sử dụng lớp Random

```java
Random r = new Random();
int n = r.nextInt(100);
```

---

## 3. Sử dụng SecureRandom

```java
SecureRandom sr = new SecureRandom();
int n = sr.nextInt(100);
```

✔ Bảo mật cao  
✔ Dùng cho mật khẩu, token

---

## 4. Tạo chuỗi ngẫu nhiên

```java
String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
StringBuilder sb = new StringBuilder();
Random r = new Random();

for (int i = 0; i < 8; i++) {
    sb.append(chars.charAt(r.nextInt(chars.length())));
}
```

---

## 5. Tổng kết

- `Math.random()` đơn giản
- `Random` phổ biến
- `SecureRandom` an toàn nhất
