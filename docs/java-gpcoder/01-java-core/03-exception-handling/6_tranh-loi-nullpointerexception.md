---
sidebar_position: 6
title: "Tránh lỗi NullPointerException trong Java"
---

# Tránh lỗi NullPointerException trong Java

**NullPointerException** (lỗi con trỏ null — xảy ra khi cố truy cập vào một đối tượng đang có giá trị `null`) là một trong những lỗi phổ biến nhất trong Java. Hiểu rõ nguyên nhân và cách phòng tránh sẽ giúp code bền vững hơn.

---

## 1. Nguyên nhân phổ biến

```java
public class ViDuNPE {
    public static void main(String[] args) {
        String ten = null;

        // NullPointerException tại đây vì ten là null
        System.out.println(ten.length()); // java.lang.NullPointerException
    }
}
```

Các tình huống thường gặp:
- Gọi phương thức trên đối tượng `null`
- Truy cập thuộc tính của đối tượng `null`
- `null` trong mảng và sau đó truy cập phần tử
- Giá trị trả về của phương thức là `null` nhưng không kiểm tra

---

## 2. Các cách phòng tránh

### 2.1. Kiểm tra null trước khi sử dụng

```java
public void inTen(String ten) {
    if (ten != null) {
        System.out.println("Tên: " + ten.toUpperCase());
    } else {
        System.out.println("Tên không được cung cấp.");
    }
}
```

### 2.2. Dùng equals() với hằng số trước

```java
String trangThai = layTrangThai(); // Có thể trả về null

// Sai: nếu trangThai là null → NullPointerException
if (trangThai.equals("ACTIVE")) { }

// Đúng: đặt hằng số trước để tránh NPE
if ("ACTIVE".equals(trangThai)) { }
```

### 2.3. Sử dụng Optional (từ Java 8)

**`Optional<T>`** (tùy chọn — lớp bọc chứa hoặc không chứa một giá trị) giúp biểu đạt rõ ràng rằng một giá trị có thể vắng mặt.

```java
import java.util.Optional;

public class DichVuNguoiDung {

    // Trả về Optional thay vì null
    public Optional<String> layEmail(int userId) {
        if (userId == 1) {
            return Optional.of("user@example.com");
        }
        return Optional.empty(); // Không dùng return null
    }

    public void hienThiEmail(int userId) {
        Optional<String> email = layEmail(userId);

        // isPresent() kiểm tra có giá trị không
        if (email.isPresent()) {
            System.out.println("Email: " + email.get());
        }

        // Hoặc dùng orElse() để cung cấp giá trị mặc định
        String emailHienThi = email.orElse("Chưa có email");
        System.out.println(emailHienThi);

        // Hoặc dùng ifPresent() để thực thi nếu có giá trị
        email.ifPresent(e -> System.out.println("Gửi mail đến: " + e));
    }
}
```

### 2.4. Trả về collection rỗng thay vì null

```java
import java.util.Collections;
import java.util.List;

// Sai: trả về null
public List<String> laySanPhamSai() {
    return null; // Người gọi phải nhớ kiểm tra null
}

// Đúng: trả về danh sách rỗng
public List<String> laySanPhamDung() {
    return Collections.emptyList(); // An toàn, người gọi có thể dùng ngay
}
```

### 2.5. Dùng annotation @NonNull / @Nullable

Với các framework hỗ trợ (Spring, Lombok, IntelliJ):

```java
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

public class DichVu {

    // @NonNull cảnh báo khi truyền null vào
    public String xuLy(@NonNull String duLieu) {
        return duLieu.trim();
    }

    // @Nullable thông báo rõ giá trị trả về có thể null
    @Nullable
    public String timTheoTen(String ten) {
        // Có thể trả về null nếu không tìm thấy
        return null;
    }
}
```

---

## 3. Tóm tắt nhanh

| Tình huống | Giải pháp |
|---|---|
| So sánh với hằng chuỗi | Đặt hằng số ở trước: `"abc".equals(bien)` |
| Phương thức có thể trả về null | Dùng `Optional<T>` |
| Trả về danh sách có thể rỗng | Trả về `Collections.emptyList()` |
| Tham số đầu vào | Kiểm tra null ngay đầu phương thức, ném `IllegalArgumentException` nếu không hợp lệ |
