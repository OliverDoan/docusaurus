---
sidebar_position: 4
title: "Tạo chương trình Java đầu tiên với Eclipse IDE"
---

# Tạo chương trình Java đầu tiên với Eclipse IDE

Eclipse là một trong những IDE miễn phí phổ biến nhất để lập trình Java, giúp việc viết code dễ dàng hơn nhiều so với dùng trình soạn thảo thường. Bài này hướng dẫn từng bước cài đặt Eclipse, tạo project, package, class và chạy chương trình đầu tiên. Bạn cũng sẽ biết các tính năng tiện lợi như gợi ý code, format và đổi tên tự động.

## Eclipse IDE là gì?

**Eclipse IDE** (Integrated Development Environment — Môi trường phát triển tích hợp) là một phần mềm miễn phí, mã nguồn mở, hỗ trợ viết code Java với nhiều tính năng tiện lợi:

- Tô màu cú pháp (syntax highlighting)
- Gợi ý code tự động (auto-complete)
- Phát hiện lỗi ngay khi gõ
- Công cụ debug tích hợp
- Quản lý dự án trực quan

---

## Cài đặt Eclipse

1. Truy cập trang chủ: **https://www.eclipse.org/downloads/**
2. Tải về **Eclipse IDE for Java Developers**
3. Giải nén và chạy file `eclipse.exe` (Windows) hoặc `eclipse` (macOS/Linux)

> Yêu cầu: JDK đã được cài sẵn trên máy trước khi mở Eclipse.

---

## Tạo dự án Java mới

### Bước 1: Tạo Java Project

1. Mở Eclipse
2. Chọn menu **File → New → Java Project**
3. Điền tên dự án, ví dụ: `HelloJava`
4. Chọn phiên bản JDK phù hợp
5. Nhấn **Finish**

### Bước 2: Tạo package (gói)

**Package** (gói) dùng để tổ chức các class liên quan, tránh xung đột tên:

1. Chuột phải vào thư mục `src` trong **Package Explorer**
2. Chọn **New → Package**
3. Điền tên package, ví dụ: `com.example.hello`
4. Nhấn **Finish**

> Quy ước đặt tên package: viết thường, dùng dấu chấm phân cấp, thường theo tên miền đảo ngược (ví dụ `com.company.project`).

### Bước 3: Tạo Class mới

1. Chuột phải vào package vừa tạo
2. Chọn **New → Class**
3. Điền tên class: `HelloWorld`
4. Tích vào ô **public static void main(String[] args)** để Eclipse tự tạo phương thức main
5. Nhấn **Finish**

---

## Viết và chạy chương trình

Eclipse đã tạo sẵn cấu trúc cơ bản, bạn chỉ cần thêm nội dung vào phương thức `main`:

```java
package com.example.hello;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Tôi đang học Java với Eclipse!");
    }
}
```

### Chạy chương trình

Có 3 cách:

1. **Phím tắt**: `Ctrl + F11` (Windows/Linux) hoặc `Cmd + F11` (macOS)
2. **Menu**: Run → Run As → Java Application
3. **Chuột phải** vào file → Run As → Java Application

Kết quả hiển thị ở cửa sổ **Console** phía dưới:

```
Hello, World!
Tôi đang học Java với Eclipse!
```

---

## Các tính năng hữu ích của Eclipse

### Auto-complete (Gợi ý code)

Gõ một vài ký tự rồi nhấn `Ctrl + Space` để Eclipse gợi ý code. Ví dụ gõ `syso` rồi `Ctrl + Space` → Eclipse tự điền `System.out.println()`.

### Format code tự động

`Ctrl + Shift + F` — tự động căn chỉnh và định dạng code theo chuẩn.

### Organize imports tự động

`Ctrl + Shift + O` — tự động thêm/xóa các câu lệnh `import` cần thiết.

### Rename biến/class

`Alt + Shift + R` — đổi tên biến/class và tự động cập nhật tất cả nơi sử dụng.

---

## Cấu trúc thư mục dự án Eclipse

```
HelloJava/
├── src/                          ← Mã nguồn Java
│   └── com/example/hello/
│       └── HelloWorld.java
├── bin/                          ← File .class sau khi biên dịch (tự động)
└── .project                      ← File cấu hình dự án Eclipse
```

---

## Tóm tắt

Eclipse IDE giúp việc viết code Java trở nên dễ dàng hơn nhiều so với dùng trình soạn thảo văn bản thông thường. Các bước cơ bản:

1. Cài JDK + Eclipse
2. Tạo Java Project
3. Tạo Package
4. Tạo Class với phương thức `main`
5. Viết code và nhấn `Ctrl + F11` để chạy
