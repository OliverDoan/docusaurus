---
sidebar_position: 4
title: "4. Java Modules (JPMS)"
---

# Java Modules -- Hệ thống Module trong Java 9+

Từ Java 9, Java giới thiệu **JPMS (Java Platform Module System)** -- cách tổ chức code thành các **module** rõ ràng, có ranh giới và khai báo dependency tường minh. Đây là thay đổi lớn nhất của Java kể từ generics.

**Tương tự đơn giản:** Hãy tưởng tượng nhà bạn có nhiều phòng. Trước Java 9, mọi phòng đều mở -- ai cũng vào được. Từ Java 9, mỗi phòng có **cửa và khóa** -- bạn quyết định mở phòng nào, cho ai vào. **Module** chính là "phòng" của code.

---

## Mục lục

- [1. Module là gì?](#1-module-là-gì)
- [2. module-info.java](#2-module-infojava)
- [3. Các từ khóa quan trọng](#3-các-từ-khóa-quan-trọng)
- [4. Ví dụ project Module](#4-ví-dụ-project-module)
- [5. Module System của JDK](#5-module-system-của-jdk)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Module là gì?

**Module** là một nhóm package được **đóng gói** lại, có:

- **Tên duy nhất** (ví dụ `com.app.user`)
- **Khai báo dependency** -- module nào nó cần
- **Khai báo export** -- package nào nó cho phép module khác dùng

### Tại sao cần Module?

Trước Java 9:

- **Classpath hell:** Hàng trăm JAR, dễ xung đột class
- **Không có encapsulation cấp package:** `public` đồng nghĩa "ai cũng dùng được"
- **JDK quá lớn:** Mọi ứng dụng phải kèm full JDK (~200MB)

Java 9+ Module giải quyết:

- Mỗi module khai báo rõ phụ thuộc và export
- Cho phép tạo runtime image nhỏ (chỉ chứa module cần)
- Strong encapsulation -- package không export thì không ai truy cập được

---

## 2. module-info.java

Mỗi module có file `module-info.java` ở **gốc** module.

```java
module com.app.user {
    requires java.sql;              // Phu thuoc module java.sql
    requires com.app.common;        // Phu thuoc module noi bo

    exports com.app.user.api;       // Cho module khac dung package nay
    exports com.app.user.dto to     // Chi cho 1 module cu the
        com.app.web;
}
```

### Cấu trúc thư mục

```
src/
└── com.app.user/                  <-- ten module
    ├── module-info.java
    └── com/app/user/
        ├── api/
        │   └── UserService.java
        └── internal/
            └── UserRepository.java <-- khong export, ben ngoai khong dung duoc
```

---

## 3. Các từ khóa quan trọng

### `requires` -- Khai báo dependency

```java
module com.app.web {
    requires com.app.user;
    requires transitive com.app.common;  // Module nao require web cung auto require common
    requires static lombok;              // Chi can luc compile, khong can luc chay
}
```

| Modifier      | Ý nghĩa                                                 |
| ------------- | ------------------------------------------------------- |
| `requires`    | Cần module này lúc compile và runtime                   |
| `transitive`  | Tự động re-export -- module phụ thuộc cũng nhận được    |
| `static`      | Chỉ cần lúc compile (annotation processor như Lombok)   |

### `exports` -- Chia sẻ package

```java
module com.app.user {
    exports com.app.user.api;                       // Public cho tat ca
    exports com.app.user.internal to com.app.test;  // Chi cho 1 module
}
```

### `opens` -- Mở package cho Reflection

```java
module com.app.user {
    opens com.app.user.entity to org.hibernate;
    opens com.app.user.dto;
}
```

**Phân biệt `exports` vs `opens`:**

- `exports`: Module khác **compile-time** truy cập được code
- `opens`: Module khác **dùng Reflection** truy cập được lúc runtime (Hibernate cần để ánh xạ entity)

### `provides` / `uses` -- Service Loader

```java
// Module cung cap service
module com.app.payment {
    provides com.app.api.PaymentGateway
        with com.app.payment.StripeGateway;
}

// Module dung service
module com.app.web {
    uses com.app.api.PaymentGateway;
}
```

---

## 4. Ví dụ project Module

### Module `com.app.common`

```java
// File: com.app.common/module-info.java
module com.app.common {
    exports com.app.common.util;
}

// File: com.app.common/com/app/common/util/StringUtil.java
package com.app.common.util;

public class StringUtil {
    public static boolean isEmpty(String s) {
        return s == null || s.isEmpty();
    }
}
```

### Module `com.app.user` (phụ thuộc common)

```java
// File: com.app.user/module-info.java
module com.app.user {
    requires com.app.common;
    exports com.app.user.api;
}

// File: com.app.user/com/app/user/api/UserService.java
package com.app.user.api;

import com.app.common.util.StringUtil;

public class UserService {
    public boolean validate(String name) {
        return !StringUtil.isEmpty(name);
    }
}
```

### Biên dịch và chạy

```bash
# Bien dich
javac -d out --module-source-path src $(find src -name "*.java")

# Chay
java --module-path out -m com.app.user/com.app.user.api.Main
```

---

## 5. Module System của JDK

Từ Java 9, JDK được chia thành nhiều module nhỏ. Xem danh sách:

```bash
java --list-modules
```

Một số module chính:

| Module                  | Chứa gì                              |
| ----------------------- | ------------------------------------ |
| `java.base`             | Core (java.lang, java.util...)       |
| `java.sql`              | JDBC                                 |
| `java.xml`              | XML parsing                          |
| `java.logging`          | Logging                              |
| `java.net.http`         | HTTP Client (Java 11+)               |
| `java.desktop`          | Swing, AWT                           |

`java.base` được **tự động import** vào mọi module -- không cần khai báo.

### jlink -- Tạo runtime nhỏ gọn

```bash
jlink --module-path $JAVA_HOME/jmods:out \
      --add-modules com.app.user \
      --output myapp-runtime
```

Tạo ra một bản Java runtime chỉ chứa module cần -- có thể chỉ vài chục MB thay vì 200MB+.

---

## Khi nào dùng?

- **Dùng Module khi:**
  - Project lớn, nhiều team cùng làm
  - Cần encapsulation mạnh
  - Cần tạo runtime image nhỏ (microservice, CLI tool)
  - Phát triển thư viện cho người khác dùng
- **Không cần Module khi:**
  - Project nhỏ, đơn giản (vẫn dùng được classpath cổ điển)
  - Dùng framework chưa hỗ trợ tốt Module (một số legacy)
- **Best practice:**
  - Đặt tên module theo **reverse domain** (`com.company.product`)
  - Export càng ít càng tốt -- bảo vệ internal API
  - Dùng `requires transitive` khi muốn re-export
  - Cẩn thận với `opens` -- mở Reflection có thể phá encapsulation

---

## Lỗi thường gặp

### Lỗi 1: Không export package cần dùng

```java
// SAI
module com.app.user {
    // khong export gi
}

// Module khac:
import com.app.user.UserService; // ERROR -- khong access duoc

// DUNG
module com.app.user {
    exports com.app.user;
}
```

### Lỗi 2: Reflection bị block

```java
// SAI -- chi exports, Hibernate khong reflect duoc
module com.app.user {
    exports com.app.user.entity;
}

// DUNG -- them opens
module com.app.user {
    exports com.app.user.entity;
    opens com.app.user.entity to org.hibernate.orm.core;
}
```

### Lỗi 3: Split package

```
// SAI -- 2 module cung exports package com.app.util
module mod-a { exports com.app.util; }
module mod-b { exports com.app.util; } // ERROR

// DUNG -- khong duoc trung package giua 2 module
```

---

## Câu hỏi phỏng vấn

### Câu 1: JPMS giải quyết vấn đề gì?

**Trả lời:** Trước Java 9, `public` đồng nghĩa "ai cũng dùng được" -- không có cách bảo vệ API nội bộ. Classpath không kiểm soát dependency -- xung đột JAR (classpath hell). JDK to vì chứa mọi thứ. **JPMS** thêm tầng encapsulation cấp module, khai báo dependency rõ ràng, cho phép tạo runtime image nhỏ.

### Câu 2: `exports` khác `opens` thế nào?

**Trả lời:** `exports` cho phép module khác **truy cập tại compile-time** (code thường). `opens` cho phép truy cập **lúc runtime qua Reflection**. Frameworks như Hibernate, Spring cần `opens` để reflect entity/DTO. Nếu chỉ `exports`, Reflection sẽ ném `InaccessibleObjectException`.

### Câu 3: `requires transitive` nghĩa là gì?

**Trả lời:** Module A `requires transitive` module B nghĩa là: bất kỳ module nào require A sẽ **tự động** require B. Hữu ích khi API của A trả về type của B -- người dùng A không cần khai báo B riêng.

### Câu 4: Module có ép phải dùng không?

**Trả lời:** **Không bắt buộc**. Java 9+ vẫn hỗ trợ classpath cổ điển. Code không có `module-info.java` được xem là **unnamed module** -- access mọi thứ như cũ. Tuy nhiên, code module hóa được hưởng tất cả lợi ích của JPMS.

### Câu 5: jlink dùng để làm gì?

**Trả lời:** `jlink` là công cụ tạo **custom runtime image** -- chỉ chứa module cần. Ví dụ ứng dụng CLI chỉ cần `java.base` + module riêng = runtime ~30MB thay vì 200MB+ full JDK. Rất hữu ích cho container, microservice, distribution.
