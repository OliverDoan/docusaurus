---
sidebar_position: 12
title: "12. Module & import"
---

# 12. Module & import (Packages & Imports)

:::note[Ghi nhớ nhanh]

- Java tổ chức code bằng **package** (gói) — tương tự thư mục; tên package phải khớp cấu trúc thư mục.
- **Không có `export`** — cái gì `public` thì các file khác dùng được, không cần khai báo export.
- `import` chỉ để **gọi tên gọn** (khỏi gõ tên đầy đủ), khác hẳn `import` của ES modules (nạp module thật sự).
- Một class `public` phải nằm trong file **trùng tên** class (`User` → `User.java`).
- Điểm chạy chương trình là method `public static void main(String[] args)`.

:::

---

## Cách tổ chức: package vs module file

Bên JS, mỗi file là một module, bạn `export`/`import` giữa chúng. Bên Java, code nhóm theo **package** (đặt tên kiểu tên miền ngược, ví dụ `com.myapp.model`):

<table>
<tr><th>JavaScript (ES Modules)</th><th>Java</th></tr>
<tr>
<td>

```javascript
// user.js
export class User { }
export const MAX = 100;

// main.js
import { User, MAX } from "./user.js";
```

</td>
<td>

```java
// com/myapp/model/User.java
package com.myapp.model;
public class User { }

// com/myapp/Main.java
package com.myapp;
import com.myapp.model.User;
```

</td>
</tr>
</table>

---

## Không có `export` — dùng `public`

Đây là khác biệt lớn về tư duy. Java **không có từ khóa export**. Thay vào đó, khả năng dùng lại được quyết định bởi **access modifier**:

- `public` → các package/file khác dùng được (≈ được "export").
- *(không ghi)* hoặc `private` → chỉ trong phạm vi hẹp (≈ không export).

```java
public class User { }   // dùng được ở mọi nơi
class Helper { }        // chỉ dùng trong cùng package
```

---

## `import` — chỉ là "viết tắt tên"

Điểm dễ hiểu lầm nhất: `import` của Java **không nạp/thực thi** gì cả (khác ES modules). Nó chỉ giúp bạn **gõ tên ngắn** thay vì tên đầy đủ:

```java
import java.util.ArrayList;

ArrayList<String> list = new ArrayList<>();   // gõ gọn

// Không import thì phải viết đầy đủ:
java.util.ArrayList<String> list2 = new java.util.ArrayList<>();
```

Import cả package bằng `*` (giống nhưng không phải `import *` của JS):

```java
import java.util.*;   // import mọi class trong java.util
```

---

## Quy tắc 1 file = 1 public class

Một quy tắc bắt buộc mà JS không có: mỗi file `.java` chỉ chứa **một class `public`**, và **tên file phải trùng tên class**:

```
User.java     →  public class User { }     ✅
Main.java     →  public class Main { }      ✅
```

Đặt `public class User` trong file `Account.java` sẽ **lỗi biên dịch**.

---

## Điểm khởi đầu chương trình

Bên JS bạn chạy `node main.js` và mọi code cấp cao nhất được thực thi. Bên Java, chương trình bắt đầu từ method đặc biệt:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Xin chào Java!");
    }
}
```

- `public` — JVM gọi được từ ngoài.
- `static` — chạy được mà không cần tạo object (xem [bài 7](./07-ham-va-method.md)).
- `String[] args` — tham số dòng lệnh (giống `process.argv` trong Node).

---

## Thư viện ngoài: Maven/Gradle vs npm

Cuối cùng, cách quản lý thư viện bên thứ ba:

| | JavaScript | Java |
|---|---|---|
| Trình quản lý | npm / yarn / pnpm | Maven / Gradle |
| File khai báo | `package.json` | `pom.xml` / `build.gradle` |
| Thư mục tải về | `node_modules/` | `~/.m2/` (cache chung) |
| Kho trung tâm | npm registry | Maven Central |

Ý tưởng giống nhau: khai báo thư viện cần dùng, công cụ tự tải về. Bạn sẽ gặp lại chúng khi học Spring Boot.

---

🎉 **Hoàn thành!** Bạn đã đi qua toàn bộ ánh xạ cú pháp cơ bản và OOP từ JavaScript sang Java. Giờ khi đọc code Java, bạn có thể tự "dịch ngược" về khái niệm JS quen thuộc trong đầu — đó là cách học nhanh nhất.
