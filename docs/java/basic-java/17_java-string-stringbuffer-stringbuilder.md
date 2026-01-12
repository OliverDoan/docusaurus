# String, StringBuffer và StringBuilder
## 1. Giới thiệu
Trong Java, **chuỗi (String)** là một trong những kiểu dữ liệu được sử dụng **thường xuyên nhất**.  
Java cung cấp 3 lớp liên quan trực tiếp đến xử lý chuỗi:

- `String`
- `StringBuffer`
- `StringBuilder`

👉 Điểm khác biệt cốt lõi giữa chúng nằm ở:
- **Tính bất biến (immutability)**
- **Hiệu năng**
- **An toàn luồng (thread-safety)**

---

## 2. Lớp String trong Java

### 2.1 Đặc điểm chính của String
- `String` là **immutable** (bất biến)
- Mỗi lần thay đổi → **tạo đối tượng mới**
- An toàn trong môi trường đa luồng

```java
String s = "Hello";
s = s + " World";
```

👉 `"Hello"` **không bị thay đổi**, Java tạo ra chuỗi mới `"Hello World"`.

---

### 2.2 String Pool

```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");
```

- `s1 == s2` → `true` (cùng String Pool)
- `s1 == s3` → `false`
- `s1.equals(s3)` → `true`

📌 String literal được lưu trong **String Constant Pool** để tiết kiệm bộ nhớ.

---

### 2.3 So sánh chuỗi

```java
String a = "abc";
String b = new String("abc");

a == b;        // false
a.equals(b);   // true
```

👉 Luôn dùng `equals()` để so sánh **nội dung chuỗi**.

---

## 3. Lớp StringBuffer

### 3.1 Đặc điểm
- **Mutable** (có thể thay đổi)
- **Thread-safe** (đồng bộ hóa)
- Chậm hơn `StringBuilder`

```java
StringBuffer sb = new StringBuffer("Hello");
sb.append(" World");
System.out.println(sb);
```

✔ Không tạo object mới khi thay đổi  
✔ Phù hợp môi trường đa luồng

---

### 3.2 Một số phương thức thường dùng

```java
sb.append("Java");
sb.insert(0, "Hi ");
sb.delete(0, 3);
sb.reverse();
```

---

## 4. Lớp StringBuilder

### 4.1 Đặc điểm
- **Mutable**
- **Không thread-safe**
- Nhanh nhất trong 3 loại

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World");
```

👉 Thường dùng trong:
- Xử lý chuỗi trong vòng lặp
- Ứng dụng đơn luồng

---

## 5. So sánh String – StringBuffer – StringBuilder

| Tiêu chí | String | StringBuffer | StringBuilder |
|--------|--------|--------------|---------------|
| Mutable | ❌ | ✔ | ✔ |
| Thread-safe | ✔ | ✔ | ❌ |
| Hiệu năng | Thấp | Trung bình | Cao |
| Dùng khi | Chuỗi ít thay đổi | Đa luồng | Đơn luồng |

---

## 6. Ví dụ so sánh hiệu năng

```java
long start = System.currentTimeMillis();

String s = "";
for (int i = 0; i < 10000; i++) {
    s += i;
}

long end = System.currentTimeMillis();
System.out.println(end - start);
```

👉 Với `StringBuilder`:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
```

⏱ `StringBuilder` nhanh hơn **rất nhiều lần**.

---

## 7. Khi nào dùng loại nào?

- **String**:
  - Chuỗi cố định
  - Ít thay đổi
  - Hằng số, cấu hình

- **StringBuffer**:
  - Đa luồng
  - Cần an toàn luồng

- **StringBuilder**:
  - Đơn luồng
  - Cần hiệu năng cao

---

## 8. Lỗi thường gặp

### ❌ So sánh chuỗi bằng ==

```java
if (a == b) { }
```

### ❌ Nối chuỗi trong vòng lặp bằng String

```java
for (...) {
    s += x; // rất chậm
}
```

---

## 9. Tổng kết

- `String` là immutable và an toàn
- `StringBuilder` nhanh nhất
- `StringBuffer` dùng khi cần thread-safe
- Chọn đúng loại giúp **tối ưu hiệu năng và bộ nhớ**

