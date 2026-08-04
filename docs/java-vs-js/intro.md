---
sidebar_position: 0
title: "Giới thiệu: Java cho người biết JavaScript"
slug: /java-vs-js-intro
---

# Java cho dev JavaScript — Học nhanh qua đối chiếu

Nếu bạn đã quen với **JavaScript** và giờ bắt đầu học **Java**, đây là con đường ngắn nhất: thay vì học lại từ đầu, ta **đối chiếu** từng khái niệm bạn đã biết bên JS sang Java. Mỗi bài đặt hai đoạn code cạnh nhau để bạn thấy ngay điểm giống và khác.

Mỗi **thuật ngữ chuyên ngành** (technical term — từ ngữ kỹ thuật riêng của ngành) sẽ được giải thích ngay khi xuất hiện lần đầu.

---

:::note[Ghi nhớ nhanh]

- **Khác biệt lớn nhất:** JavaScript là ngôn ngữ **động** (dynamic — kiểu dữ liệu xác định lúc chạy), còn Java là ngôn ngữ **tĩnh** (static — kiểu dữ liệu phải khai báo và cố định lúc biên dịch).
- **Java bắt bạn khai báo kiểu** cho mọi biến (`int x = 5;`), trong khi JS thì không (`let x = 5`).
- **Java biên dịch trước khi chạy** (compile → bytecode → JVM), JS thường chạy trực tiếp trên trình thông dịch (interpreter) của trình duyệt/Node.
- **Mọi thứ trong Java sống trong một class** — không có hàm "trôi nổi" ở cấp file như JS.
- Nắm được ánh xạ `let/const → biến có kiểu`, `object → class`, `=== → equals()` là bạn đã đi được 80% chặng đường.

:::

---

## Vì sao học Java lại "khó chịu" lúc đầu?

Dân JS chuyển sang Java thường thấy 3 thứ phiền phức nhất:

1. **Phải khai báo kiểu:** không còn `let x = ...` cho mọi thứ. Bạn phải nói rõ `int`, `String`, `double`...
2. **Nhiều "khuôn mẫu" (boilerplate):** một chương trình nhỏ nhất cũng cần `public class`, `public static void main`.
3. **Trình biên dịch (compiler) khó tính:** code sai kiểu là **không chạy được**, báo lỗi ngay — khác với JS thường "cứ chạy rồi lỗi lúc runtime".

Tin tốt: sự khó tính đó chính là điểm mạnh của Java. Rất nhiều lỗi mà bên JS bạn chỉ phát hiện khi user bấm nút thì bên Java đã bị chặn ngay lúc bạn viết code.

---

## Bảng ánh xạ khái niệm nhanh

| JavaScript | Java | Ghi chú |
|---|---|---|
| `let` / `const` | `int x`, `final int x` | Java cần kiểu; `final` ≈ `const` |
| `number` | `int`, `long`, `double`... | Java tách số nguyên và số thực |
| `string` | `String` | Java viết hoa chữ `S` |
| `boolean` | `boolean` | Giống nhau |
| `object` `{}` | `class` + đối tượng | Java không có object literal tùy ý |
| `array` `[]` | `int[]`, `ArrayList` | Mảng Java cố định kích thước |
| `function` | `method` (trong class) | Không có hàm ngoài class |
| `===` | `==` (số) / `.equals()` (object) | Cực kỳ dễ nhầm — xem bài riêng |
| `null` / `undefined` | `null` | Java chỉ có `null` |
| `import`/`export` | `import` + `package` | Cơ chế khác nhau |

---

## Lộ trình đối chiếu

Các bài đi từ nền tảng cú pháp tới OOP (lập trình hướng đối tượng):

1. **Biến & phạm vi** — `let/const` so với biến có kiểu
2. **Kiểu dữ liệu** — `number/string` so với `int/double/String`
3. **Ép kiểu** — chuyển đổi kiểu ngầm định và tường minh
4. **Toán tử & so sánh** — cạm bẫy `==` vs `.equals()`
5. **Chuỗi (String)** — thao tác chuỗi hai bên
6. **Điều kiện & vòng lặp** — `if`, `for`, `switch`
7. **Hàm & method** — khai báo, tham số, trả về
8. **Mảng & danh sách** — array cố định vs `ArrayList`
9. **Class & đối tượng** — object literal vs class thật sự
10. **Kế thừa & interface** — `extends`, `implements`
11. **Xử lý null** — `undefined`/`null` vs `Optional`
12. **Module & import** — `package`, `import` vs ES modules

> Bạn nên đọc lần lượt từ bài 1. Mỗi bài đều tự chứa (self-contained) nên có thể tra cứu riêng khi cần.

Bắt đầu từ **[1. Biến & phạm vi](./01-bien-va-scope.md)**.
