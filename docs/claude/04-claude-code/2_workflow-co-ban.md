---
sidebar_position: 2
title: "2. Workflow cơ bản"
---

# Workflow cơ bản

---

## Mục lục

- [Tổng quan luồng làm việc](#tổng-quan-luồng-làm-việc)
- [Bước 1: Hỏi để hiểu codebase](#bước-1-hỏi-để-hiểu-codebase)
- [Bước 2: Yêu cầu sửa hoặc thêm tính năng](#bước-2-yêu-cầu-sửa-hoặc-thêm-tính-năng)
- [Bước 3: Chạy test và lệnh](#bước-3-chạy-test-và-lệnh)
- [Bước 4: Commit với Git](#bước-4-commit-với-git)
- [Mẹo mô tả nhiệm vụ rõ ràng](#mẹo-mô-tả-nhiệm-vụ-rõ-ràng)

---

## Tổng quan luồng làm việc

Một phiên làm việc điển hình với Claude Code đi theo bốn bước lặp đi lặp lại:

1. **Hiểu** — hỏi Claude về codebase để nắm cấu trúc.
2. **Sửa/Thêm** — giao việc cụ thể (sửa bug, thêm tính năng).
3. **Kiểm tra** — chạy test, build, hoặc lệnh để xác nhận hoạt động.
4. **Commit** — lưu thay đổi vào Git khi đã ưng ý.

Bạn không cần copy/dán code. Claude Code tự đọc file, tự sửa, và **xin phép**
trước khi thực hiện hành động có ảnh hưởng (sửa file, chạy lệnh). Bạn duyệt hoặc
từ chối từng bước.

## Bước 1: Hỏi để hiểu codebase

Khi mới mở một dự án lạ, hãy để Claude tự khám phá thay vì bạn đọc thủ công. Chỉ
cần gõ câu hỏi bằng tiếng Việt tự nhiên:

```markdown
Giải thích kiến trúc tổng thể của dự án này giúp tôi.
Điểm vào (entry point) nằm ở đâu và luồng dữ liệu đi như thế nào?
```

Ví dụ các câu hỏi hữu ích:

```markdown
- Hàm xử lý đăng nhập nằm ở file nào?
- Dự án dùng thư viện nào để gọi API?
- Có những kịch bản test (test) nào đang chạy?
```

Claude sẽ tìm kiếm trong các file, đọc nội dung liên quan và tóm tắt. Đây là cách
nhanh nhất để "lên dây cót" trước khi sửa code.

## Bước 2: Yêu cầu sửa hoặc thêm tính năng

Giao việc bằng mô tả cụ thể. Càng rõ, kết quả càng đúng ý:

```markdown
Thêm một hàm kiểm tra định dạng email trong file src/utils/validate.ts.
Hàm nhận chuỗi, trả về true nếu hợp lệ. Viết kèm test cho hàm này.
```

Claude sẽ đề xuất thay đổi và hỏi quyền trước khi ghi file. Bạn xem qua nội dung
đề xuất:

- Nếu đúng ý: chấp nhận để áp dụng.
- Nếu chưa đúng: từ chối và mô tả lại điều bạn muốn điều chỉnh.

Với việc lớn (nhiều file), nên yêu cầu Claude **lập kế hoạch trước** rồi mới thực
hiện, để bạn kiểm soát phạm vi:

```markdown
Trước khi sửa code, hãy liệt kê các bước bạn định làm để thêm tính năng
"quên mật khẩu". Tôi sẽ duyệt kế hoạch trước.
```

## Bước 3: Chạy test và lệnh

Sau khi sửa, hãy xác nhận code vẫn chạy đúng. Claude Code có thể chạy lệnh trong
terminal (sau khi bạn cho phép):

```markdown
Chạy test cho dự án và báo lại kết quả.
```

Claude sẽ đề xuất lệnh phù hợp (ví dụ `npm test`, `pytest`...) và chạy nếu bạn
đồng ý. Nếu test fail, hãy yêu cầu sửa:

```markdown
Test "validate email" đang fail. Hãy tìm nguyên nhân và sửa, rồi chạy lại test.
```

Vòng lặp "sửa → chạy test → sửa tiếp" này là cách Claude Code tự kiểm chứng công
việc của mình, giảm rủi ro code hỏng.

## Bước 4: Commit với Git

Khi thay đổi đã ổn, hãy lưu vào Git. **Luôn xem lại thay đổi (diff)** trước khi
commit:

```markdown
Cho tôi xem diff của các thay đổi hiện tại.
```

Sau khi xem và hài lòng, yêu cầu commit:

```markdown
Commit các thay đổi này với thông điệp dạng conventional commit,
mô tả ngắn gọn tính năng vừa thêm.
```

Claude có thể tự soạn thông điệp commit dựa trên nội dung thay đổi. Bạn nên đọc
lại thông điệp trước khi đồng ý.

:::tip Làm việc trên nhánh riêng
Khi đang ở nhánh chính (main), hãy tạo nhánh mới trước khi sửa, để dễ kiểm soát
và tạo Pull Request sau này.
:::

## Mẹo mô tả nhiệm vụ rõ ràng

Chất lượng kết quả phụ thuộc rất nhiều vào cách bạn mô tả. So sánh:

```markdown
# MƠ HỒ - dễ ra kết quả sai
Sửa cái form đăng ký đi.

# RÕ RÀNG - dễ đúng ý
Trong file src/components/SignupForm.tsx, thêm kiểm tra:
mật khẩu phải >= 8 ký tự, hiển thị thông báo lỗi tiếng Việt dưới ô nhập
nếu không hợp lệ. Không cho submit khi còn lỗi.
```

Nguyên tắc mô tả tốt:

- **Nói rõ file/khu vực** liên quan nếu bạn biết.
- **Nêu tiêu chí chấp nhận** (điều gì coi là "xong").
- **Tách việc lớn thành việc nhỏ** thay vì giao một câu khổng lồ.
- **Chỉ định ràng buộc** (ngôn ngữ thông báo, quy ước code, không đổi API cũ...).

## Tóm tắt

- Workflow cơ bản gồm 4 bước lặp: **hiểu codebase → sửa/thêm → chạy test →
  commit**.
- Hỏi Claude để nắm cấu trúc dự án trước khi sửa.
- Giao việc cụ thể; với việc lớn, yêu cầu **lập kế hoạch trước** rồi mới thực
  hiện.
- Dùng vòng lặp **sửa → chạy test** để Claude tự kiểm chứng.
- **Luôn xem diff** trước khi commit; commit trên nhánh riêng khi cần.
- Mô tả nhiệm vụ càng rõ ràng (file, tiêu chí, ràng buộc) thì kết quả càng đúng ý.
