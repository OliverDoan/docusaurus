---
sidebar_position: 6
title: "Hướng dẫn sử dụng lớp Console trong Java"
---

# Hướng dẫn sử dụng lớp Console trong Java

## Lớp Console là gì?

**Lớp `Console`** (bảng điều khiển — lớp đại diện cho terminal/console kết nối với JVM) trong gói `java.io` cung cấp phương thức đọc/ghi dữ liệu trực tiếp với terminal. Điểm nổi bật là hỗ trợ **đọc mật khẩu mà không hiển thị ký tự** (echo off).

> **Lưu ý quan trọng:** `System.console()` trả về `null` khi chương trình chạy trong môi trường không có terminal thật sự (ví dụ: trong IDE như IntelliJ IDEA, Eclipse). Lúc đó cần dùng `Scanner` thay thế.

---

## Lấy đối tượng Console

```java
import java.io.Console;

public class LayConsole {
    public static void main(String[] args) {
        // Lấy đối tượng Console gắn với JVM hiện tại
        Console console = System.console();

        if (console == null) {
            System.err.println("Không có console! Chạy trực tiếp từ terminal.");
            // Dùng Scanner làm phương án dự phòng
            return;
        }

        console.printf("Chương trình đang chạy trên console.%n");
    }
}
```

---

## Đọc chuỗi từ Console

```java
import java.io.Console;

public class DocChuoi {
    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) {
            System.err.println("Cần chạy từ terminal.");
            return;
        }

        // readLine(String format, Object... args): hiển thị lời nhắc rồi đọc dòng
        String ten = console.readLine("Nhập họ tên: ");
        String email = console.readLine("Nhập email: ");

        console.printf("Xin chào, %s! Email: %s%n", ten, email);
    }
}
```

---

## Đọc mật khẩu (không hiển thị ký tự)

Đây là tính năng đặc trưng của lớp Console. **`readPassword()`** tắt echo (không hiển thị ký tự khi gõ) và trả về mảng `char[]` thay vì `String` để dễ xóa khỏi bộ nhớ.

```java
import java.io.Console;
import java.util.Arrays;

public class DocMatKhau {
    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) {
            System.err.println("Cần chạy từ terminal.");
            return;
        }

        String tenDangNhap = console.readLine("Tên đăng nhập: ");

        // readPassword trả về char[] (không phải String)
        // Lý do dùng char[]: có thể xóa khỏi bộ nhớ ngay sau dùng
        // String là immutable, sẽ ở lại bộ nhớ cho đến khi GC thu hồi
        char[] matKhau = console.readPassword("Mật khẩu: ");

        try {
            if (xacThuc(tenDangNhap, matKhau)) {
                console.printf("Đăng nhập thành công! Xin chào %s.%n", tenDangNhap);
            } else {
                console.printf("Sai tên đăng nhập hoặc mật khẩu.%n");
            }
        } finally {
            // Xóa mật khẩu khỏi bộ nhớ ngay sau khi dùng xong
            Arrays.fill(matKhau, '\0');
        }
    }

    private static boolean xacThuc(String ten, char[] matKhau) {
        return "admin".equals(ten) && Arrays.equals(matKhau, "admin123".toCharArray());
    }
}
```

---

## Ứng dụng thực tế: CLI Đăng nhập

```java
import java.io.Console;
import java.util.Arrays;

public class DangNhapCLI {
    private static final int SO_LAN_THU_TOI_DA = 3;

    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) {
            System.err.println("Cần chạy từ terminal để sử dụng tính năng này.");
            System.exit(1);
        }

        console.printf("=== HỆ THỐNG QUẢN LÝ ===%n");
        console.printf("Vui lòng đăng nhập để tiếp tục.%n%n");

        boolean dangNhapThanhCong = false;
        int soLanThu = 0;

        while (soLanThu < SO_LAN_THU_TOI_DA) {
            String ten = console.readLine("Tên đăng nhập: ");
            char[] mk = console.readPassword("Mật khẩu (ẩn): ");

            try {
                if (xacThuc(ten, mk)) {
                    dangNhapThanhCong = true;
                    break;
                } else {
                    soLanThu++;
                    int conLai = SO_LAN_THU_TOI_DA - soLanThu;
                    if (conLai > 0) {
                        console.printf("Sai thông tin. Còn %d lần thử.%n%n", conLai);
                    }
                }
            } finally {
                Arrays.fill(mk, '\0'); // Xóa mật khẩu khỏi RAM
            }
        }

        if (dangNhapThanhCong) {
            console.printf("%nĐăng nhập thành công! Chào mừng bạn.%n");
        } else {
            console.printf("%nVượt quá số lần thử. Tài khoản bị khóa tạm thời.%n");
        }
    }

    private static boolean xacThuc(String ten, char[] matKhau) {
        return "admin".equals(ten) && Arrays.equals(matKhau, "Admin@2024".toCharArray());
    }
}
```

---

## Đọc nhiều loại dữ liệu từ Console

```java
import java.io.Console;

public class DocNhieuLoai {
    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) { return; }

        // Đọc chuỗi
        String ten = console.readLine("Họ tên: ");

        // Đọc số nguyên (cần chuyển đổi thủ công)
        int tuoi;
        while (true) {
            try {
                String input = console.readLine("Tuổi: ");
                tuoi = Integer.parseInt(input.trim());
                if (tuoi < 0 || tuoi > 150) throw new NumberFormatException();
                break;
            } catch (NumberFormatException e) {
                console.printf("Tuổi không hợp lệ. Vui lòng nhập lại.%n");
            }
        }

        // Đọc lựa chọn Yes/No
        String chonStr;
        boolean dongY = false;
        do {
            chonStr = console.readLine("Đồng ý điều khoản? (y/n): ").trim().toLowerCase();
        } while (!chonStr.equals("y") && !chonStr.equals("n"));
        dongY = chonStr.equals("y");

        // In kết quả
        console.printf("%nThông tin:%n");
        console.printf("  Họ tên: %s%n", ten);
        console.printf("  Tuổi:   %d%n", tuoi);
        console.printf("  Đồng ý: %s%n", dongY ? "Có" : "Không");
    }
}
```

---

## Console vs Scanner — So sánh

| Tiêu chí | `Console` | `Scanner(System.in)` |
|----------|-----------|---------------------|
| Đọc mật khẩu (ẩn ký tự) | Có (`readPassword()`) | Không |
| Hoạt động trong IDE | Không (`null`) | Có |
| Thread-safe | Có | Không |
| Trả về | `String`, `char[]` | Nhiều kiểu |
| Đơn giản | Vừa | Đơn giản hơn |

**Khi nào dùng Console:**
- Ứng dụng CLI yêu cầu bảo mật (đọc mật khẩu)
- Ứng dụng chạy từ terminal trong môi trường production

**Khi nào dùng Scanner:**
- Phát triển, demo, chạy trong IDE
- Không cần đọc mật khẩu

---

## Tóm tắt

- `System.console()` trả về `null` trong IDE — luôn kiểm tra `null` trước khi dùng.
- `readPassword()` tắt echo và trả về `char[]` — an toàn hơn `String` cho mật khẩu.
- Sau khi dùng mật khẩu, dùng `Arrays.fill(mk, '\0')` để xóa khỏi bộ nhớ.
- Lớp Console **thread-safe** (an toàn đa luồng), phù hợp ứng dụng CLI đa luồng.
