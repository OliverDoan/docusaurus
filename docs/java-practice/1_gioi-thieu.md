---
sidebar_position: 1
title: "1. Giới thiệu & Chuẩn bị"
---

# Giới thiệu & Chuẩn bị

Đọc lý thuyết mãi cũng không giỏi code — bạn phải **tự tay làm project**. Topic này dẫn bạn qua 4 project nhỏ tăng dần độ khó, mỗi project là một bài hướng dẫn từng bước: viết tới đâu giải thích kiến thức tới đó, kèm lỗi thường gặp. Bài này chuẩn bị môi trường và cách học hiệu quả trước khi bắt tay vào project đầu tiên.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Học lập trình giỏi phải tự tay làm project** — chỉ đọc lý thuyết sẽ mãi kẹt ở khoảng cách giữa "hiểu" và "tự viết được".
- ⭐ **Cài `JDK` + một IDE (IntelliJ hoặc VS Code) là đủ** — kiểm tra bằng `java -version` và `javac -version`.
- **Khung chương trình tối thiểu** — mọi code nằm trong `class` (tên class trùng tên file) với hàm `main` làm điểm bắt đầu.
- **Chạy bằng `javac` → `java`** (không kèm đuôi `.java`/`.class`), hoặc bấm nút ▶ trong IDE.
- **Làm tuần tự 4 project từ dễ đến khó, gõ tay thay vì copy** — và luôn làm phần thử thách mở rộng.

:::

---

## Mục lục

- [Vì sao học qua project?](#vì-sao-học-qua-project)
- [Lộ trình 4 project](#lộ-trình-4-project)
- [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
- [Cấu trúc một project Java tối thiểu](#cấu-trúc-một-project-java-tối-thiểu)
- [Cách chạy chương trình](#cách-chạy-chương-trình)
- [Cách học hiệu quả với topic này](#cách-học-hiệu-quả-với-topic-này)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao học qua project?

**Vấn đề:** Khi học cú pháp rời rạc (biến, vòng lặp, mảng…), bạn biết từng "viên gạch" nhưng không biết **ghép chúng lại** thành một chương trình chạy được. Đây là khoảng cách lớn nhất giữa "đọc hiểu" và "tự viết được".

**Giải pháp:** Làm project buộc bạn phải:

- **Kết hợp nhiều kiến thức** cùng lúc (nhập liệu + vòng lặp + điều kiện + hàm) để giải một bài toán thật.
- **Gặp lỗi và tự sửa** — kỹ năng quan trọng nhất của lập trình viên, không sách nào dạy thay được.
- **Nhìn thấy kết quả** chạy ra màn hình → tạo động lực học tiếp.

Mỗi project ở đây đều **nhỏ, chạy trong terminal** (không cần giao diện đồ hoạ), để bạn tập trung vào tư duy lập trình thay vì rối với công cụ.

---

## Lộ trình 4 project

Các project được xếp theo độ khó tăng dần — **làm tuần tự** sẽ học tốt nhất vì project sau dùng lại kiến thức project trước:

| # | Project | Kiến thức cốt lõi học được |
|---|---------|----------------------------|
| 2 | **Trò chơi đoán số** | `Scanner` nhập liệu, `Random`, vòng lặp `while`, câu điều kiện |
| 3 | **Máy tính dòng lệnh** | Tách hàm (method), `switch`, xử lý lỗi `try/catch`, vòng lặp menu |
| 4 | **Quản lý công việc (To-Do List)** | Class & object, `ArrayList`, `enum`, CRUD trong bộ nhớ |
| 5 | **Quản lý sinh viên + ghi file** | OOP đầy đủ, `Comparator` sắp xếp, đọc/ghi file, Stream API |

:::tip Lời khuyên
Đừng copy-paste cả khối code. Hãy **gõ lại từng dòng** và đọc phần giải thích bên cạnh. Gõ tay giúp não ghi nhớ cú pháp gấp nhiều lần so với copy.
:::

---

## Chuẩn bị môi trường

Bạn cần 2 thứ:

**1. JDK (Java Development Kit)** — bộ công cụ để biên dịch và chạy Java. Kiểm tra đã cài chưa bằng cách mở terminal và gõ:

```bash
java -version
javac -version
```

Nếu hiện ra số phiên bản (ví dụ `21.0.x`) là đã có. Nếu báo "command not found", hãy cài JDK (khuyến nghị bản LTS mới nhất như JDK 21) từ [Adoptium](https://adoptium.net/) hoặc Oracle.

**2. Trình soạn thảo code** — chọn một trong:

- **IntelliJ IDEA Community** (miễn phí) — gợi ý code thông minh, chạy bằng nút bấm, tốt nhất cho người mới học Java.
- **VS Code** + extension "Extension Pack for Java" — nhẹ, quen thuộc nếu bạn từng dùng VS Code.

:::info Phân biệt nhanh
- **JDK** = bộ công cụ đầy đủ để **viết và chạy** Java (gồm cả compiler `javac`).
- **JRE** = chỉ để **chạy** Java, không biên dịch được.
- **IDE** (IntelliJ, VS Code) = trình soạn thảo giúp bạn viết code dễ hơn, không bắt buộc nhưng nên có.
:::

---

## Cấu trúc một project Java tối thiểu

Mỗi project trong topic này chỉ cần **một file `.java`**. Bộ khung tối thiểu luôn có dạng:

```java
public class TenChuongTrinh {       // tên class phải TRÙNG tên file (.java)
    public static void main(String[] args) {   // điểm bắt đầu chạy
        System.out.println("Xin chào!");        // dòng code đầu tiên
    }
}
```

Giải thích:

- **`public class TenChuongTrinh`** — mọi code Java phải nằm trong một class. Tên class **phải trùng tên file**: class `MayTinh` → file `MayTinh.java`.
- **`public static void main(String[] args)`** — hàm `main` là **điểm bắt đầu**. Khi bạn chạy chương trình, Java tìm và thực thi hàm này đầu tiên. Cứ ghi nhớ nguyên cụm này, các phần sâu hơn sẽ học sau.
- **`System.out.println(...)`** — in một dòng ra màn hình terminal.

---

## Cách chạy chương trình

**Cách 1 — Dùng terminal** (hiểu bản chất):

```bash
# Biên dịch file .java thành .class (mã máy ảo)
javac MayTinh.java

# Chạy class vừa biên dịch (KHÔNG ghi đuôi .class)
java MayTinh
```

**Cách 2 — Dùng IDE** (nhanh, tiện): mở file, bấm nút ▶ (Run) màu xanh cạnh hàm `main`. IDE tự biên dịch và chạy giúp bạn.

:::warning Lỗi hay gặp ngay từ đầu
`Error: Could not find or load main class` — thường do bạn gõ `java MayTinh.java` (thừa đuôi `.java`) hoặc tên class không trùng tên file. Lệnh chạy đúng là `java MayTinh`.
:::

---

## Cách học hiệu quả với topic này

1. **Đọc hết phần "Phân tích bài toán"** trước khi viết — hiểu mình sắp làm gì.
2. **Gõ code theo từng bước**, chạy thử sau mỗi bước để thấy nó hoạt động dần.
3. **Cố ý làm sai** một chút (xoá dấu `;`, đổi kiểu dữ liệu) để xem lỗi trông thế nào — học cách đọc lỗi.
4. **Làm phần "Thử thách mở rộng"** ở cuối mỗi bài — đây là lúc bạn thực sự tự lập trình.

---

## Tóm tắt

- Học lập trình giỏi cần **tự tay làm project**, không chỉ đọc lý thuyết.
- Cài **JDK** + một **IDE** (IntelliJ hoặc VS Code) là đủ để bắt đầu.
- Mỗi project gói gọn trong một file `.java` với khung `class` + hàm `main`.
- Chạy bằng `javac` → `java`, hoặc bấm nút ▶ trong IDE.
- Làm **tuần tự 4 project** từ dễ đến khó, **gõ tay** thay vì copy, và luôn làm phần thử thách mở rộng.

Sẵn sàng chưa? Bắt đầu với [Trò chơi đoán số](./2_tro-choi-doan-so.md) ngay nào!
