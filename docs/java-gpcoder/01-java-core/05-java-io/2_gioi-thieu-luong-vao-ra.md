---
sidebar_position: 2
title: "Giới thiệu luồng vào ra (I/O) trong Java"
---

# Giới thiệu luồng vào ra (I/O) trong Java

## I/O là gì?

**I/O** (Input/Output — Vào/Ra) là cơ chế cho phép chương trình Java trao đổi dữ liệu với thế giới bên ngoài: đọc từ bàn phím, ghi ra màn hình, đọc/ghi file, truyền dữ liệu qua mạng, v.v.

Java cung cấp gói `java.io` với hàng chục lớp phục vụ các nhu cầu I/O khác nhau.

---

## Stream (Luồng dữ liệu) là gì?

**Stream** (luồng dữ liệu — dòng dữ liệu chảy từ nguồn tới đích) là khái niệm trung tâm của Java I/O. Dữ liệu được đọc hoặc ghi theo thứ tự tuần tự, giống như nước chảy qua ống.

Có hai loại stream chính:

| Loại | Đơn vị dữ liệu | Lớp gốc |
|------|---------------|---------|
| **Byte Stream** (luồng byte) | 1 byte (8 bit) | `InputStream`, `OutputStream` |
| **Character Stream** (luồng ký tự) | 1 ký tự (16 bit Unicode) | `Reader`, `Writer` |

---

## Phân loại I/O trong Java

```
java.io
├── Byte Stream
│   ├── InputStream  (đọc byte)
│   │   ├── FileInputStream
│   │   ├── BufferedInputStream
│   │   └── DataInputStream
│   └── OutputStream (ghi byte)
│       ├── FileOutputStream
│       ├── BufferedOutputStream
│       └── DataOutputStream
└── Character Stream
    ├── Reader  (đọc ký tự)
    │   ├── FileReader
    │   ├── BufferedReader
    │   └── InputStreamReader
    └── Writer  (ghi ký tự)
        ├── FileWriter
        ├── BufferedWriter
        └── OutputStreamWriter
```

---

## Ví dụ minh họa đơn giản

### Đọc dữ liệu từ bàn phím (System.in)

```java
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;

public class DocBanPhim {
    public static void main(String[] args) throws IOException {
        // System.in là InputStream (luồng byte đầu vào chuẩn)
        // InputStreamReader chuyển đổi byte → ký tự
        // BufferedReader tăng hiệu năng bằng bộ đệm
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(System.in)
        );

        System.out.print("Nhập tên của bạn: ");
        String ten = reader.readLine(); // Đọc một dòng
        System.out.println("Xin chào, " + ten + "!");

        reader.close(); // Luôn đóng stream sau khi dùng
    }
}
```

### Ghi dữ liệu ra màn hình (System.out)

```java
import java.io.PrintStream;

public class GhiManHinh {
    public static void main(String[] args) {
        // System.out là PrintStream (luồng byte đầu ra chuẩn)
        PrintStream out = System.out;
        out.println("Dòng có xuống hàng");
        out.print("Dòng không xuống hàng ");
        out.printf("Định dạng: %s, tuổi: %d%n", "Java", 30);
    }
}
```

---

## Nguyên tắc quan trọng

### 1. Luôn đóng stream sau khi dùng

Dùng **try-with-resources** (thử với tài nguyên — cú pháp tự động đóng tài nguyên):

```java
// Cách cũ (dễ quên đóng, dễ rò rỉ tài nguyên)
InputStream is = new FileInputStream("file.txt");
// ... xử lý ...
is.close();

// Cách hiện đại: try-with-resources (Java 7+)
try (InputStream is = new FileInputStream("file.txt")) {
    // ... xử lý ...
} // is.close() được gọi tự động
```

### 2. Dùng Buffered Stream để tăng tốc

**Buffered Stream** (luồng có bộ đệm — tích lũy dữ liệu trước khi đọc/ghi thật sự):

```java
// Chậm: đọc từng byte một
InputStream slow = new FileInputStream("big-file.dat");

// Nhanh: đọc nhiều byte vào bộ đệm 8KB trước
InputStream fast = new BufferedInputStream(
    new FileInputStream("big-file.dat"), 8192
);
```

### 3. Chọn đúng loại stream

- Dữ liệu nhị phân (hình ảnh, video, file nén): dùng **Byte Stream**
- Dữ liệu văn bản (file `.txt`, `.csv`, `.json`): dùng **Character Stream**

---

## Luồng chuẩn (Standard Streams)

Java cung cấp sẵn 3 luồng chuẩn:

| Luồng | Kiểu | Mô tả |
|-------|------|-------|
| `System.in` | `InputStream` | Đầu vào chuẩn (bàn phím) |
| `System.out` | `PrintStream` | Đầu ra chuẩn (màn hình) |
| `System.err` | `PrintStream` | Đầu ra lỗi chuẩn (màn hình, màu đỏ) |

---

## Tóm tắt

- Java I/O dựa trên khái niệm **Stream** (luồng dữ liệu).
- **Byte Stream** xử lý dữ liệu nhị phân; **Character Stream** xử lý văn bản Unicode.
- Luôn dùng **try-with-resources** để tránh rò rỉ tài nguyên.
- Bọc stream trong **BufferedInputStream/BufferedReader** để tăng hiệu năng.
- Gói `java.io` là nền tảng; gói `java.nio` (New I/O) là lựa chọn hiện đại hơn cho ứng dụng hiệu năng cao.
