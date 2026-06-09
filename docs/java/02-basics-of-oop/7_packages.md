---
sidebar_position: 7
title: "7. Gói (Packages)"
---

# Gói (Packages)

Package (gói) là cách tổ chức các lớp liên quan vào chung một "ngăn", giống như dùng thư mục để sắp xếp tài liệu trên máy tính. Nó giúp code gọn gàng dễ tìm, tránh trùng tên lớp và hỗ trợ kiểm soát truy cập khi dự án lớn dần với hàng trăm lớp. Bài này giới thiệu cách khai báo `package`, dùng `import`, quy ước đặt tên và các package có sẵn của Java.

---

## Mục lục

- [Package là gì?](#package-là-gì)
- [Tại sao cần package?](#tại-sao-cần-package)
- [Khai báo package](#khai-báo-package)
- [Cấu trúc thư mục tương ứng](#cấu-trúc-thư-mục-tương-ứng)
- [import — Sử dụng class ở package khác](#import--sử-dụng-class-ở-package-khác)
- [Quy ước đặt tên package](#quy-ước-đặt-tên-package)
- [Package có sẵn của Java](#package-có-sẵn-của-java)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Package là gì?

**Package** (gói — một nhóm các class liên quan được tổ chức chung với nhau) giống như các
**thư mục** trên máy tính dùng để sắp xếp tài liệu.

Hãy hình dung một **tủ hồ sơ**: bạn không vứt mọi giấy tờ vào chung một ngăn, mà chia thành
các ngăn "Hóa đơn", "Hợp đồng", "Ảnh". Package làm điều tương tự với các class: nhóm những
class cùng chức năng vào chung một "ngăn".

---

## Tại sao cần package?

- **Tổ chức code gọn gàng**: dễ tìm, dễ quản lý khi dự án lớn dần với hàng trăm class.
- **Tránh trùng tên**: hai class cùng tên `Account` có thể tồn tại nếu ở hai package khác nhau.
- **Kiểm soát truy cập**: nhớ lại mức `default` (package-private) ở bài access specifiers —
  chỉ class cùng package mới truy cập được.

---

## Khai báo package

Câu lệnh **`package`** (khai báo class này thuộc gói nào) phải là **dòng code đầu tiên**
trong file (trước cả `import` và định nghĩa class).

```java
// Dòng đầu tiên: khai báo class Calculator thuộc package com.myapp.util
package com.myapp.util;

public class Calculator {
    public int add(int a, int b) {
        return a + b; // cộng hai số
    }
}
```

Một file `.java` chỉ có **một** câu lệnh `package`, và nếu không khai báo thì class sẽ nằm
trong **default package** (gói mặc định — không khuyến khích dùng cho dự án thật).

---

## Cấu trúc thư mục tương ứng

Tên package phải **khớp với cấu trúc thư mục** chứa file. Mỗi dấu chấm `.` tương ứng một cấp
thư mục con.

Ví dụ, package `com.myapp.util` tương ứng đường dẫn thư mục:

```
src/
└── com/
    └── myapp/
        └── util/
            └── Calculator.java   // package com.myapp.util;
```

Quy tắc: `com.myapp.util` → thư mục `com/myapp/util/`. Nếu đặt sai chỗ, trình biên dịch sẽ
báo lỗi.

---

## import — Sử dụng class ở package khác

Khi muốn dùng một class nằm ở package KHÁC, ta dùng câu lệnh **`import`** (nhập — báo cho
Java biết tìm class đó ở đâu). Câu lệnh `import` đặt SAU `package` và TRƯỚC định nghĩa class.

```java
package com.myapp.main;

// Nhập class Calculator từ package com.myapp.util
import com.myapp.util.Calculator;

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator(); // dùng được nhờ đã import
        System.out.println(calc.add(2, 3)); // 5
    }
}
```

Một vài cách import:

```java
import com.myapp.util.Calculator;  // import đúng một class (khuyên dùng)
import com.myapp.util.*;            // import TẤT CẢ class trong package util
```

:::tip
Class trong **cùng một package** thì KHÔNG cần `import` — chúng dùng được lẫn nhau ngay.
Chỉ cần import khi class ở package khác (ngoại trừ `java.lang` được import tự động).
:::

---

## Quy ước đặt tên package

Theo quy ước Java, tên package viết **toàn bộ chữ thường** và thường dựa trên **tên miền
ngược** của công ty/tổ chức:

```
com.<tên_công_ty>.<tên_dự_án>.<chức_năng>
```

Ví dụ:

```java
package com.google.maps.utils;   // Google
package com.newera.shop.payment;  // dự án shop của New Era
package org.apache.commons.lang;  // tổ chức Apache
```

Vì sao dùng tên miền ngược? Vì tên miền là duy nhất trên thế giới, nên package sẽ không
bao giờ trùng với package của tổ chức khác.

:::warning
KHÔNG viết hoa tên package và không dùng từ khóa Java (như `int`, `class`) làm tên cấp
package. Tên gói toàn chữ thường để phân biệt với tên class (PascalCase).
:::

---

## Package có sẵn của Java

Java cung cấp sẵn rất nhiều package hữu ích, ví dụ:

- **`java.lang`**: các class cốt lõi (`String`, `System`, `Math`). Được import TỰ ĐỘNG,
  không cần khai báo.
- **`java.util`**: tiện ích như danh sách, ngày giờ (`ArrayList`, `Scanner`, `Date`).
- **`java.io`**: nhập/xuất dữ liệu, đọc ghi file.

```java
import java.util.Scanner; // nhập class Scanner để đọc dữ liệu từ bàn phím

public class Demo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Nhập tên: ");
        String name = sc.nextLine();
        System.out.println("Xin chào " + name);
    }
}
```

---

## Lỗi thường gặp

1. **`package` không phải dòng đầu**: đặt câu lệnh `package` sau `import` hoặc sau comment
   code khác sẽ gây lỗi biên dịch.
2. **Tên package không khớp thư mục**: khai báo `package com.myapp;` nhưng file lại nằm sai
   thư mục → lỗi.
3. **Quên import**: dùng class ở package khác mà chưa `import` sẽ báo "cannot find symbol".
4. **Viết hoa tên package**: sai quy ước, gây khó đọc và không nhất quán.
5. **Import thừa class không dùng**: không gây lỗi nhưng làm code rối; nên import đúng thứ cần.

---

## Tóm tắt

- **Package** là cách nhóm các class liên quan, giống như thư mục sắp xếp tài liệu.
- Khai báo bằng `package ...;` ở **dòng đầu tiên** của file, khớp với cấu trúc thư mục.
- Dùng **`import`** để sử dụng class ở package khác; cùng package thì không cần import.
- Quy ước tên: **chữ thường**, theo **tên miền ngược** như `com.company.project`.
- `java.lang` được import tự động; các package như `java.util`, `java.io` rất hay dùng.
- Package còn hỗ trợ kiểm soát truy cập qua mức `default` (package-private).
