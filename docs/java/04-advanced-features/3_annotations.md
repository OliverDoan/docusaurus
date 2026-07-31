---
sidebar_position: 3
title: "3. Chú thích (Annotations)"
---

# 3. Chú thích (Annotations)

Annotation (chú thích) là một dạng "nhãn dán" metadata mà bạn gắn vào lớp, phương thức hay biến. Bản thân nó không thay đổi cách code chạy, nhưng cung cấp thông tin cho trình biên dịch, công cụ hoặc framework xử lý. Bài này giới thiệu các annotation có sẵn như `@Override`, cách tự tạo annotation, `Retention`, `@Target` và cách các framework như Spring, JUnit dùng annotation; phần chi tiết nằm bên dưới.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Annotation `@Something`** — nhãn metadata gắn thẳng lên lớp/phương thức/biến, thay cho file XML rời rạc.
- **Annotation có sẵn** — `@Override`, `@Deprecated`, `@SuppressWarnings`.
- **`@Retention`** — quy định vòng đời annotation: `SOURCE` / `CLASS` / `RUNTIME`.
- **`@Target`** — quy định vị trí áp dụng (class, method, field...).
- ⭐ **Framework dùng annotation** — Spring, JUnit, JPA đọc annotation (thường qua Reflection) để sinh hành vi.

:::

---

## Mục lục

- [Vì sao có annotation?](#vì-sao-có-annotation)
- [Annotation là gì?](#annotation-là-gì)
- [Các annotation có sẵn thường gặp](#các-annotation-có-sẵn-thường-gặp)
- [Tự tạo annotation tùy chỉnh](#tự-tạo-annotation-tùy-chỉnh)
- [Retention (vòng đời của annotation)](#retention-vòng-đời-của-annotation)
- [Target (vị trí áp dụng)](#target-vị-trí-áp-dụng)
- [Annotation trong các framework](#annotation-trong-các-framework)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có annotation?

**Vấn đề:** Code thường cần gắn kèm **thông tin bổ sung (metadata)** — chẳng hạn ánh xạ một lớp tới bảng trong cơ sở dữ liệu (ORM), đánh dấu một phương thức là test, hay khai báo một bean để framework quản lý. Trước đây thông tin này nằm trong **file XML rời rạc**, tách xa code nên dễ lệch khi sửa, hoặc dựa vào **quy ước đặt tên mong manh** (đặt sai tên là hỏng).

```java
// Trước đây: cấu hình ánh xạ ORM nằm trong file XML rời rạc (User.hbm.xml)
// <class name="User" table="users">
//     <id name="id" column="user_id"/>
//     <property name="ten" column="name"/>
// </class>

// Code Java (User.java) lại nằm chỗ khác, không thấy được mapping
public class User {
    private Long id;
    private String ten;
}
// => Sửa tên cột phải sửa cả hai nơi, dễ quên, dễ lệch
```

**Giải pháp:** **Annotation `@Something`** cho phép gắn metadata **trực tiếp** lên lớp, phương thức hoặc biến. Compiler, công cụ hoặc framework đọc annotation (qua Reflection lúc chạy, hoặc lúc biên dịch) để kiểm tra hoặc sinh hành vi tương ứng. Nhờ vậy bớt được file XML, code khai báo gọn và metadata luôn nằm cạnh code.

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

// Bây giờ: metadata mapping gắn thẳng lên code, không cần file XML
@Entity
class User {
    @Id
    private Long id;

    @Column(name = "name") // Ánh xạ trường ten tới cột name
    private String ten;
}
// => Tất cả ở một chỗ, sửa là thấy ngay
```

:::tip[Dùng thực tế]
- **`@Override`**: compiler kiểm tra phương thức có thực sự ghi đè lớp cha không.
- **`@Entity` / `@Column` (JPA)**: thay file XML mapping, ánh xạ lớp và trường tới bảng/cột.
- **`@Test` (JUnit)**: đánh dấu phương thức là test case để framework tự chạy.
- **`@Autowired` / `@RestController` (Spring)**: khai báo tiêm phụ thuộc và lớp xử lý request web.
:::

---

## Annotation là gì?

**Annotation (chú thích)** là một dạng "nhãn dán" (metadata — siêu dữ liệu) mà bạn gắn vào code: lớp, phương thức, biến... Bản thân annotation **không trực tiếp thay đổi** cách code chạy, nhưng nó cung cấp thông tin cho trình biên dịch (compiler), công cụ phát triển, hoặc framework xử lý ở thời điểm chạy.

Hãy tưởng tượng bạn dán giấy nhớ (sticky note) lên các tài liệu: "Quan trọng", "Cần kiểm tra lại", "Đã lỗi thời". Tờ giấy không thay đổi nội dung tài liệu, nhưng giúp người đọc biết phải làm gì. Annotation chính là những tờ giấy nhớ như vậy cho code.

Annotation luôn bắt đầu bằng ký hiệu **`@`**.

```java
public class ViDuAnnotation {
    @Override // Nhãn báo: phương thức này ghi đè phương thức của lớp cha
    public String toString() {
        return "Đây là một đối tượng ví dụ";
    }
}
```

---

## Các annotation có sẵn thường gặp

Java cung cấp sẵn nhiều annotation hữu ích:

### @Override

Báo rằng phương thức đang **ghi đè (override)** một phương thức của lớp cha. Nếu bạn viết sai tên hoặc tham số, compiler sẽ báo lỗi ngay.

```java
class DongVat {
    void keu() {
        System.out.println("Một âm thanh nào đó");
    }
}

class Cho extends DongVat {
    @Override // Nếu gõ sai tên (vd: keuu) compiler sẽ báo lỗi
    void keu() {
        System.out.println("Gâu gâu");
    }
}
```

### @Deprecated

Đánh dấu một thành phần đã **lỗi thời (deprecated)**, không nên dùng nữa vì có thể bị xóa trong tương lai.

```java
class ApiCu {
    @Deprecated // Cảnh báo: phương thức này đã lỗi thời
    void phuongThucCu() {
        System.out.println("Đừng dùng nữa, hãy dùng phuongThucMoi()");
    }

    void phuongThucMoi() {
        System.out.println("Hãy dùng phương thức này");
    }
}
```

### @FunctionalInterface

Đánh dấu một interface là **functional interface** (chỉ có đúng một phương thức trừu tượng). Compiler sẽ báo lỗi nếu bạn vô tình thêm phương thức trừu tượng thứ hai.

```java
@FunctionalInterface
interface XuLy {
    void thucHien(); // Chỉ được phép có một phương thức trừu tượng
}
```

### @SuppressWarnings

Yêu cầu compiler **bỏ qua (suppress)** một số cảnh báo nhất định.

```java
@SuppressWarnings("unchecked") // Bỏ qua cảnh báo về kiểu không an toàn
void viDu() {
    // ... code có thể gây cảnh báo unchecked
}
```

---

## Tự tạo annotation tùy chỉnh

Bạn có thể tự định nghĩa annotation bằng từ khóa **`@interface`**. Annotation có thể chứa các phần tử (giống tham số).

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

// Định nghĩa annotation tùy chỉnh tên ThongTinTacGia
@Retention(RetentionPolicy.RUNTIME) // Giữ annotation đến lúc chạy
@interface ThongTinTacGia {
    String ten();           // Phần tử bắt buộc
    String ngay() default "Chưa rõ"; // Phần tử có giá trị mặc định
}

// Sử dụng annotation vừa tạo
@ThongTinTacGia(ten = "Thuận", ngay = "2026-06-04")
class DuAn {
    // ...
}
```

---

## Retention (vòng đời của annotation)

**Retention (vòng đời lưu giữ)** quyết định annotation tồn tại đến giai đoạn nào. Có ba lựa chọn qua `RetentionPolicy`:

- **`SOURCE`**: chỉ tồn tại trong mã nguồn, bị bỏ đi khi biên dịch. Ví dụ: `@Override`.
- **`CLASS`** (mặc định): tồn tại trong file `.class` nhưng không có lúc chạy.
- **`RUNTIME`**: tồn tại đến lúc chạy, có thể đọc bằng **Reflection (cơ chế phản chiếu)**. Đây là loại framework hay dùng.

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME) // Đọc được lúc chương trình chạy
@interface CanKiemTra {
    String moTa();
}
```

---

## Target (vị trí áp dụng)

**`@Target`** xác định annotation được phép gắn ở đâu: lớp, phương thức, biến...

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

// Annotation này chỉ được phép gắn lên phương thức
@Target(ElementType.METHOD)
@interface ChiDanhChoMethod {
}
```

Một số giá trị `ElementType` thường gặp: `TYPE` (lớp/interface), `METHOD` (phương thức), `FIELD` (biến thành viên), `PARAMETER` (tham số).

---

## Annotation trong các framework

Đây là nơi annotation phát huy sức mạnh thực sự. Các framework lớn như **Spring**, **JUnit**, **JPA** dùng annotation để cấu hình mọi thứ mà không cần file XML rườm rà.

```java
// Ví dụ minh họa cách Spring dùng annotation (chỉ để hình dung)
// @RestController       -> đánh dấu lớp xử lý request web
// @GetMapping("/users") -> ánh xạ URL /users tới phương thức
// @Autowired            -> tự động tiêm phụ thuộc

// Ví dụ minh họa JUnit dùng annotation cho test
// @Test       -> đánh dấu một phương thức là test case
// @BeforeEach -> chạy trước mỗi test

// Cách framework hoạt động (đơn giản hóa):
// 1. Framework quét code, tìm các annotation (qua Reflection)
// 2. Dựa vào annotation, framework thực hiện hành động tương ứng
//    (tạo đối tượng, ánh xạ URL, chạy test...)
```

Nhờ annotation, bạn chỉ cần "dán nhãn" mong muốn của mình, còn framework lo phần xử lý phức tạp phía sau.

Sơ đồ dưới đây minh hoạ luồng framework xử lý annotation lúc chạy:

```mermaid
flowchart TD
    A["Code có gắn<br/>annotation @Something"] --> B["Framework quét code<br/>(qua Reflection)"]
    B --> C{"Tìm thấy<br/>annotation?"}
    C -->|"Có"| D["Thực hiện hành động<br/>(tạo bean, ánh xạ URL,<br/>chạy test...)"]
    C -->|"Không"| E["Bỏ qua"]
```

---

## Lỗi thường gặp

- **Quên `@Override` khi ghi đè**: code vẫn chạy nhưng dễ mắc lỗi gõ sai tên mà không phát hiện.
- **Dùng annotation `RUNTIME` nhưng quên cần Reflection để đọc**: annotation chỉ là metadata, phải có code đọc nó mới có tác dụng.
- **Đặt sai vị trí annotation**: gắn annotation lên chỗ không được `@Target` cho phép sẽ gây lỗi biên dịch.
- **Nhầm annotation tự thay đổi hành vi**: annotation tự bản thân không làm gì, phải có công cụ/framework xử lý.
- **Phần tử bắt buộc không có giá trị mặc định mà quên truyền**: sẽ gây lỗi khi dùng annotation.

---

## Tóm tắt

- **Annotation** là "nhãn dán" metadata gắn vào code, bắt đầu bằng `@`.
- Annotation **không tự thay đổi** hành vi, mà cung cấp thông tin cho compiler/framework.
- Annotation có sẵn thường gặp: `@Override`, `@Deprecated`, `@FunctionalInterface`, `@SuppressWarnings`.
- Bạn có thể **tự tạo** annotation bằng `@interface`.
- **Retention** quyết định vòng đời (`SOURCE`, `CLASS`, `RUNTIME`); **`@Target`** quyết định vị trí áp dụng.
- Các framework như **Spring, JUnit, JPA** dùng annotation rất nhiều để cấu hình gọn gàng.
