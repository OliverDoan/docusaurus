---
sidebar_position: 4
title: "4. Hệ thống Module (Java Module System)"
---

# 4. Hệ thống Module (Java Module System)

Hệ thống Module (có từ Java 9) là cách chia một chương trình lớn thành các khối độc lập, mỗi khối tự khai báo nó cần gì và cho phép ai dùng phần nào của mình. Nó giúp tổ chức code rõ ràng, che giấu chi tiết nội bộ và phát hiện thiếu thư viện ngay từ lúc khởi động. Bài này giới thiệu khái niệm chung; chi tiết về `module-info.java`, `requires`, `exports` nằm bên dưới.

---

## Mục lục

- [Vì sao có module system (JPMS)?](#vì-sao-có-module-system-jpms)
- [Module là gì?](#module-là-gì)
- [Vấn đề của classpath cũ](#vấn-đề-của-classpath-cũ)
- [File module-info.java](#file-module-infojava)
- [requires và exports](#requires-và-exports)
- [Ví dụ một dự án nhiều module](#ví-dụ-một-dự-án-nhiều-module)
- [Vì sao cần module?](#vì-sao-cần-module)
- [So sánh module với classpath cũ](#so-sánh-module-với-classpath-cũ)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có module system (JPMS)?

**Vấn đề:** Classpath truyền thống là một không gian **phẳng**: mọi class `public` đều lộ ra ngoài, không thể giấu phần nội bộ của một thư viện. Trùng hoặc thiếu JAR chỉ bị phát hiện muộn lúc chạy ("JAR hell" / `ClassNotFoundException`), và JDK là một khối khổng lồ khó cắt nhỏ.

```java
// Thư viện muốn giấu lớp nội bộ này, nhưng classpath phẳng làm KHÔNG được:
package com.lib.internal;

public class XuLyNoiBo {          // public -> ai cũng gọi được
    public void hamNguyHiem() { } // lẽ ra chỉ dùng nội bộ
}

// Code bên ngoài vẫn import thoải mái, phá vỡ ranh giới nội bộ:
import com.lib.internal.XuLyNoiBo; // không có gì ngăn cản
```

**Giải pháp:** JPMS (Java 9, qua `module-info.java`) cho phép khai báo `requires` (phụ thuộc) và `exports` (package được lộ ra). Nhờ đó có **đóng gói mạnh** (ẩn được package nội bộ), phụ thuộc rõ ràng được kiểm tra sớm lúc khởi động, và có thể tạo runtime tối giản bằng `jlink`.

```java
module com.lib {
    // CHỈ công khai package api; com.lib.internal bị giấu kín
    exports com.lib.api;
    // KHÔNG exports com.lib.internal -> bên ngoài không import được
}
```

:::tip[Dùng thực tế]

- **Ẩn package nội bộ**: không `exports` `com.lib.internal` để chỉ lộ API công khai, người dùng thư viện không thể phụ thuộc vào chi tiết nội bộ.
- **Khai báo phụ thuộc tường minh**: dùng `requires java.sql;` để thiếu thư viện bị báo ngay lúc khởi động thay vì sập giữa chừng lúc chạy.
- **Đóng gói runtime nhỏ với jlink**: gói chỉ những module cần thiết thành bản runtime gọn, phù hợp container/microservice.
- **Tránh JAR hell**: ranh giới module rõ ràng giúp hạn chế xung đột phiên bản và class trùng tên trên classpath.

:::

---

## Module là gì?

**Module (mô-đun)** là một nhóm các package (gói) và tài nguyên được đóng gói lại với nhau, kèm theo một bản mô tả rõ ràng về việc nó **cần gì** từ bên ngoài và **cho phép** ai dùng phần nào của nó. Hệ thống Module được giới thiệu từ **Java 9** (còn gọi là Project Jigsaw).

Hãy tưởng tượng một tòa nhà văn phòng. Mỗi công ty (module) thuê một tầng riêng. Mỗi công ty:

- Khai báo cần dịch vụ gì từ bên ngoài (điện, nước, internet) — giống `requires`.
- Quyết định phòng nào mở cửa cho khách, phòng nào khóa kín — giống `exports`.

Module giúp tổ chức code lớn một cách rõ ràng, an toàn và dễ bảo trì.

---

## Vấn đề của classpath cũ

Trước Java 9, mọi thứ được nạp qua **classpath (đường dẫn lớp)** — một danh sách dài tất cả các file `.class` và thư viện `.jar`. Cách này có nhiều vấn đề:

- **Không có ranh giới rõ ràng**: mọi class public đều có thể bị bất kỳ ai truy cập, kể cả những class nội bộ đáng lẽ phải giấu đi.
- **JAR Hell (địa ngục JAR)**: nếu hai thư viện cần hai phiên bản khác nhau của cùng một thư viện, chương trình có thể lỗi khó lường.
- **Lỗi phát hiện muộn**: thiếu một thư viện chỉ được phát hiện khi chạy (runtime), chứ không phải lúc khởi động.
- **JDK quá to**: trước đây toàn bộ thư viện chuẩn là một khối khổng lồ, không thể chỉ lấy phần cần dùng.

---

## File module-info.java

Mỗi module được khai báo trong một file đặc biệt tên là **`module-info.java`**, đặt ở thư mục gốc của module. File này mô tả tên module và các phụ thuộc.

```java
// File: module-info.java
module com.mycompany.app {
    // Module này cần module java.sql để hoạt động
    requires java.sql;

    // Cho phép các module khác dùng package com.mycompany.app.api
    exports com.mycompany.app.api;
}
```

Cấu trúc thư mục điển hình:

```text
src/
└── com.mycompany.app/        <- thư mục module
    ├── module-info.java       <- file mô tả module
    └── com/mycompany/app/
        ├── api/
        │   └── DichVu.java
        └── internal/
            └── XuLyNoiBo.java
```

---

## requires và exports

Hai từ khóa quan trọng nhất:

### requires (cần)

Khai báo module **này phụ thuộc vào** module khác. Nếu module được khai báo không có mặt, chương trình sẽ báo lỗi ngay lúc khởi động.

```java
module com.shop.order {
    requires com.shop.payment; // Module order cần module payment
    requires java.logging;     // Cần module ghi log của Java
}
```

### exports (xuất ra)

Khai báo package nào **cho phép** module khác sử dụng. Những package **không** được `exports` sẽ bị giấu kín, dù class bên trong có là public.

```java
module com.shop.payment {
    // Cho phép module khác dùng package này
    exports com.shop.payment.api;

    // Package com.shop.payment.internal KHÔNG được exports
    // -> module khác không thể truy cập, dù class là public
}
```

Đây là điểm mạnh lớn: bạn kiểm soát chính xác phần nào của module được "công khai".

---

## Ví dụ một dự án nhiều module

Giả sử bạn xây một ứng dụng bán hàng gồm hai module: `payment` (thanh toán) và `order` (đặt hàng).

```java
// File: payment/module-info.java
module com.shop.payment {
    // Công khai package api cho module khác dùng
    exports com.shop.payment.api;
}
```

```java
// File: payment/com/shop/payment/api/ThanhToan.java
package com.shop.payment.api;

public class ThanhToan {
    public void xuLy(double soTien) {
        // Xử lý logic thanh toán
        System.out.println("Đã thanh toán: " + soTien + " VND");
    }
}
```

```java
// File: order/module-info.java
module com.shop.order {
    // Module order cần dùng module payment
    requires com.shop.payment;
}
```

```java
// File: order/com/shop/order/DatHang.java
package com.shop.order;

import com.shop.payment.api.ThanhToan; // Dùng được vì payment đã exports

public class DatHang {
    public void taoDonHang(double tien) {
        ThanhToan tt = new ThanhToan();
        tt.xuLy(tien); // Gọi sang module payment
        System.out.println("Đơn hàng đã được tạo");
    }
}
```

---

## Vì sao cần module?

- **Đóng gói mạnh (strong encapsulation)**: chỉ những gì được `exports` mới truy cập được, bảo vệ chi tiết nội bộ.
- **Phụ thuộc rõ ràng (reliable configuration)**: mọi phụ thuộc khai báo công khai, thiếu là phát hiện ngay lúc khởi động, không phải chờ runtime.
- **Ứng dụng gọn nhẹ hơn**: có thể đóng gói chỉ những module cần thiết bằng công cụ `jlink`, tạo ra bản runtime nhỏ gọn.
- **Dễ bảo trì dự án lớn**: code được chia thành các khối độc lập, ranh giới rõ ràng.

---

## So sánh module với classpath cũ

| Tiêu chí | Classpath cũ | Module System |
| --- | --- | --- |
| Đóng gói | Mọi class public đều truy cập được | Chỉ package được `exports` |
| Phụ thuộc | Ngầm định, không khai báo | Khai báo rõ qua `requires` |
| Phát hiện thiếu thư viện | Lúc chạy (runtime) | Lúc khởi động |
| JAR Hell | Dễ gặp | Hạn chế nhiều |
| Kích thước runtime | Toàn bộ JDK | Có thể cắt nhỏ với `jlink` |

Lưu ý: với người mới học và các dự án nhỏ, bạn **không bắt buộc** phải dùng module — classpath vẫn hoạt động tốt. Module quan trọng hơn với các dự án lớn, thư viện, và khi cần bảo mật chặt chẽ.

---

## Lỗi thường gặp

- **Quên `exports` package**: module khác không thể dùng package đó dù class là public.
- **Quên `requires`**: cố dùng class từ module khác mà chưa khai báo `requires` sẽ gây lỗi biên dịch.
- **Đặt `module-info.java` sai vị trí**: file này phải nằm ở thư mục gốc của module.
- **Phụ thuộc vòng (circular dependency)**: module A `requires` B và B lại `requires` A — Java không cho phép.
- **Nghĩ rằng phải dùng module ngay từ đầu**: với dự án nhỏ, classpath đơn giản vẫn ổn; đừng phức tạp hóa không cần thiết.

---

## Tóm tắt

- **Module** là nhóm package được đóng gói kèm mô tả phụ thuộc rõ ràng, có từ **Java 9**.
- **Classpath cũ** thiếu ranh giới, dễ gặp JAR Hell và phát hiện lỗi muộn.
- File **`module-info.java`** khai báo tên module cùng `requires` và `exports`.
- **`requires`** khai báo phụ thuộc; **`exports`** quyết định package nào được công khai.
- Module mang lại **đóng gói mạnh**, **phụ thuộc rõ ràng**, và **runtime gọn nhẹ**.
- Với người mới và dự án nhỏ, module **không bắt buộc** — nó hữu ích nhất cho dự án lớn.
