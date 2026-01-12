# String Format
## Giới thiệu
Trong Java, **String Format** giúp chúng ta **định dạng chuỗi một cách linh hoạt và chuyên nghiệp**, đặc biệt hữu ích khi:
- In dữ liệu ra màn hình
- Tạo chuỗi báo cáo
- Hiển thị số liệu, ngày giờ theo định dạng mong muốn

Java hỗ trợ nhiều cách định dạng chuỗi, phổ biến nhất là:
- `System.out.printf`
- `String.format`
- `java.text.MessageFormat`

---

## Nội dung

1. [Sử dụng System.out.printf](#1-sử-dụng-systemoutprintf)  
2. [Quy tắc định dạng chuỗi](#2-quy-tắc-định-dạng-chuỗi)  
3. [Sử dụng String.format](#3-sử-dụng-stringformat)  
4. [Sử dụng java.text.MessageFormat](#4-sử-dụng-javatextmessageformat)  

---

## 1. Sử dụng System.out.printf

`printf` cho phép in dữ liệu ra màn hình với **định dạng cụ thể**.

```java
int age = 20;
String name = "An";

System.out.printf("Tên: %s, Tuổi: %d", name, age);
```

👉 `%s`: chuỗi  
👉 `%d`: số nguyên

---

## 2. Quy tắc định dạng chuỗi

### 2.1 Cấu trúc chung

```
%[flags][width][.precision]conversion
```

### 2.2 Một số conversion thường dùng

| Ký hiệu | Ý nghĩa |
|------|--------|
| %s | Chuỗi |
| %d | Số nguyên |
| %f | Số thực |
| %c | Ký tự |
| %b | Boolean |

### 2.3 Ví dụ

```java
double pi = 3.14159;
System.out.printf("PI = %.2f", pi);
```

👉 Kết quả:
```
PI = 3.14
```

---

## 3. Sử dụng String.format

`String.format` hoạt động giống `printf` nhưng **trả về chuỗi** thay vì in ra màn hình.

```java
String result = String.format("Giá: %,d VND", 1000000);
System.out.println(result);
```

👉 Phù hợp khi:
- Lưu chuỗi
- Ghi log
- Trả về từ method

---

## 4. Sử dụng java.text.MessageFormat

`MessageFormat` thường dùng trong **ứng dụng đa ngôn ngữ (i18n)**.

```java
String pattern = "Xin chào {0}, bạn có {1} tin nhắn";
String msg = MessageFormat.format(pattern, "An", 5);

System.out.println(msg);
```

✔ Độc lập vị trí tham số  
✔ Hỗ trợ locale

---

## Tổng kết

- `printf`: in trực tiếp ra console
- `String.format`: tạo chuỗi đã định dạng
- `MessageFormat`: mạnh cho i18n
- Dùng đúng công cụ giúp code **đọc dễ – chuyên nghiệp – bảo trì tốt**
