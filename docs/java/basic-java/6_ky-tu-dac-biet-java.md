---
sidebar_position: 6
---
# Một số ký tự đặc biệt trong Java

Java hỗ trợ nhiều **ký tự thoát (escape characters)** để biểu diễn các ký tự đặc biệt không thể gõ trực tiếp hoặc dùng cho định dạng chuỗi.

---

## Nội dung

1. [Bảng ký tự đặc biệt](#bảng-ký-tự-đặc-biệt)  
2. [Ví dụ sử dụng](#2--ví-dụ-sử-dụng)  
3. [Ghi nhớ nhanh](#3--ghi-nhớ-nhanh)  

---

Dưới đây là bảng tổng hợp các ký tự đặc biệt thường dùng:

| Ký tự | Ý nghĩa |
|------|---------|
| `\b` | Xóa lùi (Backspace) |
| `\t` | Tab |
| `\n` | Xuống dòng |
| `\r` | Về đầu dòng (Carriage return) |
| `\"` | Dấu nháy kép `"` |
| `\'` | Dấu nháy đơn `'` |
| `\\` | Dấu gạch chéo ngược `\` |
| `\f` | Đẩy trang (Form feed) |
| `\uXXXX` | Ký tự Unicode (XXXX là mã hex) |

---

## 1. Bảng ký tự đặc biệt

---

## 2. 📌 Ví dụ sử dụng

```java
System.out.println("Hello\nWorld");     // Xuống dòng
System.out.println("A\tB\tC");          // Tab
System.out.println("He said: \"Hi!\""); // In dấu nháy kép
System.out.println("Backspace\b!");     // Xóa lùi
System.out.println('\u0041');           // In ký tự Unicode: A
```

---

## 3. 🎯 Ghi nhớ nhanh

- Dùng escape characters để xử lý ký tự đặc biệt trong string.
- `\uXXXX` hữu ích khi làm việc với Unicode, biểu tượng, ký tự đặc biệt.

