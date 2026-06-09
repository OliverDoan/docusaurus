---
sidebar_position: 1
title: "1. Tổng quan công cụ Build"
---

# 1. Tổng quan công cụ Build (Build Tools)

Công cụ build là phần mềm tự động hóa quá trình biến mã nguồn thành sản phẩm chạy được: biên dịch, tải thư viện, chạy test rồi đóng gói. Bài này giới thiệu vì sao cần công cụ build, khái niệm dependency, vòng đời build và so sánh ba công cụ phổ biến Maven, Gradle, Bazel. Đây là kiến thức nền giúp bạn quản lý dự án Java thực tế thay vì biên dịch tay từng file.

---

## Mục lục

- [Vì sao cần công cụ Build?](#vì-sao-cần-công-cụ-build)
- [Dependency là gì?](#dependency-là-gì)
- [Quản lý phụ thuộc (Dependency Management)](#quản-lý-phụ-thuộc-dependency-management)
- [Vòng đời build (Build Lifecycle)](#vòng-đời-build-build-lifecycle)
- [So sánh Maven, Gradle và Bazel](#so-sánh-maven-gradle-và-bazel)
- [Chọn công cụ nào?](#chọn-công-cụ-nào)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần công cụ Build?

Khi mới học Java, bạn thường biên dịch (compile) tay bằng lệnh:

```bash
# Biên dịch một file Java đơn giản
javac HelloWorld.java

# Chạy chương trình
java HelloWorld
```

Việc này ổn khi chỉ có 1-2 file. Nhưng dự án thật có thể có **hàng trăm file**, dùng **hàng chục thư viện** bên ngoài, cần chạy test, đóng gói thành file `.jar`, rồi triển khai (deploy). Làm tay tất cả những việc đó sẽ vừa chậm vừa dễ sai.

**Công cụ build (Build Tool)** là phần mềm tự động hóa toàn bộ quy trình biến mã nguồn (source code) thành sản phẩm chạy được.

> **Ví dụ đời thường:** Hãy tưởng tượng bạn nấu một bữa tiệc cho 50 người. Nếu tự đi chợ, sơ chế, nấu, dọn bàn một mình thì rất mệt. Công cụ build giống như một "đầu bếp trưởng kiêm quản lý": tự đi mua nguyên liệu (tải thư viện), nấu theo công thức (biên dịch), nếm thử (chạy test), và bày ra đĩa (đóng gói) — tất cả theo một quy trình chuẩn.

Công cụ build giúp bạn:

- **Biên dịch (compile)** toàn bộ mã nguồn chỉ bằng một lệnh.
- **Tải tự động** các thư viện cần thiết từ Internet.
- **Chạy test** để kiểm tra code có đúng không.
- **Đóng gói (package)** thành file `.jar` hoặc `.war`.
- **Tái lập (reproducible)**: máy nào chạy cũng cho kết quả giống nhau.

---

## Dependency là gì?

**Dependency (thư viện phụ thuộc)** là một đoạn code do người khác viết sẵn mà dự án của bạn cần dùng tới.

> **Ví dụ đời thường:** Bạn muốn làm bánh mà không tự xay bột. Bạn mua bột làm sẵn ở siêu thị. "Gói bột" đó chính là một dependency — bạn phụ thuộc vào nó để làm ra cái bánh.

Ví dụ trong Java, thay vì tự viết code đọc file JSON, bạn dùng thư viện **Jackson** hoặc **Gson**. Thay vì tự viết code kết nối cơ sở dữ liệu, bạn dùng **JDBC driver**.

Mỗi dependency thường được xác định bằng 3 thông tin:

- **groupId**: tổ chức/công ty tạo ra thư viện (ví dụ `com.google.code.gson`).
- **artifactId**: tên của thư viện (ví dụ `gson`).
- **version**: phiên bản (ví dụ `2.10.1`).

```text
com.google.code.gson : gson : 2.10.1
   groupId           : artifactId : version
```

---

## Quản lý phụ thuộc (Dependency Management)

Vấn đề lớn nhất khi dùng thư viện là **phụ thuộc lồng nhau (transitive dependencies)**.

> **Ví dụ đời thường:** Bạn mua gói bột làm bánh (thư viện A). Nhưng gói bột đó lại cần thêm men nở (thư viện B), và men nở lại cần chất bảo quản (thư viện C). Nếu phải tự đi tìm từng thứ thì rất rối.

Công cụ build sẽ **tự động tải cả "cây" phụ thuộc** đó cho bạn. Bạn chỉ cần khai báo thư viện A, nó sẽ tự kéo về B và C.

Nó cũng giải quyết **xung đột phiên bản (version conflict)**: nếu thư viện X cần `gson 2.8` còn thư viện Y cần `gson 2.10`, công cụ build sẽ chọn một phiên bản phù hợp thay vì để chương trình lỗi.

---

## Vòng đời build (Build Lifecycle)

**Vòng đời build (Build Lifecycle)** là chuỗi các bước theo thứ tự để biến mã nguồn thành sản phẩm. Các bước phổ biến nhất:

| Bước | Tên tiếng Anh | Ý nghĩa |
|------|---------------|---------|
| 1 | **compile** | Biên dịch mã nguồn `.java` thành `.class` (mã máy ảo). |
| 2 | **test** | Chạy các bài kiểm thử (unit test) để xác nhận code đúng. |
| 3 | **package** | Đóng gói thành file `.jar` / `.war`. |
| 4 | **install** | Cài file đã đóng gói vào kho cục bộ trên máy bạn. |
| 5 | **deploy** | Đưa sản phẩm lên kho chung hoặc máy chủ. |

> **Ví dụ đời thường:** Giống quy trình làm bánh: nhào bột (compile) → nướng thử một cái để nếm (test) → đóng hộp (package) → cất vào tủ nhà mình (install) → giao ra cửa hàng (deploy). Các bước này có thứ tự: không thể đóng hộp khi chưa nướng xong.

Một đặc điểm quan trọng: các bước này **chạy tuần tự**. Khi bạn gọi bước `package`, công cụ build sẽ tự động chạy luôn các bước trước đó (`compile`, `test`).

---

## So sánh Maven, Gradle và Bazel

Có ba công cụ build phổ biến trong thế giới Java/JVM:

| Tiêu chí | **Maven** | **Gradle** | **Bazel** |
|----------|-----------|------------|-----------|
| File cấu hình | `pom.xml` (XML) | `build.gradle` (Groovy/Kotlin) | `BUILD` (Starlark) |
| Phong cách | Khai báo cố định | Linh hoạt, viết script được | Tập trung tốc độ & quy mô lớn |
| Tốc độ | Trung bình | Nhanh (có cache) | Rất nhanh (incremental) |
| Độ dễ học | Dễ cho người mới | Trung bình | Khó |
| Đa ngôn ngữ | Chủ yếu JVM | Chủ yếu JVM | Nhiều ngôn ngữ (Java, C++, Go...) |
| Phổ biến nhất với | Dự án Java truyền thống | Android, dự án hiện đại | Công ty lớn (Google) |

- **Maven**: ra đời sớm, cấu hình bằng XML rõ ràng nhưng dài dòng. Rất phù hợp người mới vì có quy tắc cố định ("convention over configuration" — quy ước hơn cấu hình).
- **Gradle**: linh hoạt hơn, viết bằng ngôn ngữ script nên ngắn gọn và mạnh mẽ. Là chuẩn của lập trình Android.
- **Bazel**: do Google tạo ra cho dự án **cực lớn, đa ngôn ngữ**. Mạnh về tốc độ build tăng tiến và tái lập, nhưng phức tạp cho người mới.

---

## Chọn công cụ nào?

Lời khuyên cho người mới học:

- **Học Maven trước** — đơn giản, dễ hiểu, tài liệu nhiều, đa số dự án doanh nghiệp dùng.
- Học **Gradle** khi làm Android hoặc dự án hiện đại cần tốc độ.
- Chỉ cần **biết tới Bazel** là gì, dùng khi vào công ty rất lớn yêu cầu.

---

## Lỗi thường gặp

- **Cài tay từng thư viện thay vì dùng công cụ build.** Rất dễ thiếu phụ thuộc lồng nhau, dẫn đến lỗi `ClassNotFoundException`. Hãy luôn khai báo dependency cho công cụ build.
- **Quên rằng bước sau tự chạy bước trước.** Nhiều người chạy `compile` rồi mới chạy `test` riêng lẻ — thực ra chỉ cần gọi bước sau cùng là đủ.
- **Nhầm lẫn giữa version của công cụ build và version của Java.** Đây là hai thứ khác nhau hoàn toàn.
- **Không hiểu transitive dependency.** Tưởng chỉ cần thư viện mình khai báo, không biết nó còn kéo theo nhiều thư viện khác — nên ngạc nhiên khi thấy thư mục thư viện rất nặng.

---

## Tóm tắt

- **Công cụ build** tự động hóa việc biên dịch, test, đóng gói và quản lý thư viện.
- **Dependency (thư viện phụ thuộc)** là code người khác viết mà dự án bạn dùng tới, xác định bằng `groupId : artifactId : version`.
- **Quản lý phụ thuộc** tự động tải cả cây phụ thuộc lồng nhau và xử lý xung đột phiên bản.
- **Vòng đời build** gồm các bước tuần tự: compile → test → package → install → deploy.
- Ba công cụ phổ biến: **Maven** (dễ học), **Gradle** (linh hoạt, nhanh), **Bazel** (dự án lớn, đa ngôn ngữ).
- Người mới nên bắt đầu với **Maven**.
