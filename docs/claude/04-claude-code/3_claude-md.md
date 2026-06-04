---
sidebar_position: 3
title: "3. File CLAUDE.md"
---

# File CLAUDE.md

---

## Mục lục

- [CLAUDE.md là gì?](#claudemd-là-gì)
- [Vì sao nên có CLAUDE.md?](#vì-sao-nên-có-claudemd)
- [Nên ghi gì trong CLAUDE.md?](#nên-ghi-gì-trong-claudemd)
- [Ví dụ một file CLAUDE.md mẫu](#ví-dụ-một-file-claudemd-mẫu)
- [Tạo nhanh bằng lệnh /init](#tạo-nhanh-bằng-lệnh-init)
- [Mẹo viết CLAUDE.md hiệu quả](#mẹo-viết-claudemd-hiệu-quả)

---

## CLAUDE.md là gì?

**CLAUDE.md** là một file văn bản (định dạng Markdown) đặt ở **gốc dự án**. Nó
chứa hướng dẫn và ngữ cảnh (context) mà bạn muốn Claude Code tự động đọc và tuân
theo mỗi khi làm việc trong dự án đó.

Hãy hình dung CLAUDE.md như "bản giới thiệu dự án dành cho thành viên mới": lệnh
nào dùng để build, quy ước code ra sao, kiến trúc thế nào. Thay vì giải thích lại
mỗi phiên, bạn viết một lần vào CLAUDE.md và Claude luôn nhớ.

## Vì sao nên có CLAUDE.md?

- **Nhất quán**: Claude tuân theo quy ước dự án thay vì đoán mò.
- **Tiết kiệm thời gian**: không phải nhắc lại lệnh build/test mỗi lần.
- **Giảm lỗi**: Claude biết ràng buộc quan trọng (vd "không sửa file cấu hình
  X", "luôn viết test").
- **Chia sẻ cho cả nhóm**: file này commit vào Git nên mọi thành viên dùng Claude
  Code đều hưởng cùng ngữ cảnh.

## Nên ghi gì trong CLAUDE.md?

Tập trung vào thông tin Claude cần để làm việc đúng. Các mục thường gặp:

- **Lệnh thường dùng**: build, chạy dev, chạy test, kiểm tra kiểu (type check).
- **Kiến trúc**: thư mục chính chứa gì, điểm vào (entry point) ở đâu.
- **Quy ước code**: phong cách đặt tên, ngôn ngữ comment, định dạng.
- **Ràng buộc**: điều cấm làm (vd không commit secret, không sửa file sinh tự
  động).
- **Công nghệ**: ngôn ngữ, framework, phiên bản tối thiểu.

:::tip Ngắn gọn và đúng trọng tâm
CLAUDE.md được đọc mỗi phiên nên đừng viết quá dài dòng. Ưu tiên thông tin
**hành động được** (lệnh, quy ước, ràng buộc) hơn là mô tả lan man.
:::

## Ví dụ một file CLAUDE.md mẫu

Dưới đây là một CLAUDE.md mẫu cho một dự án web TypeScript:

```markdown
# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong dự án này.

## Lệnh thường dùng

```bash
npm run dev        # Chạy server phát triển (development)
npm run build      # Build bản production vào thư mục dist/
npm test           # Chạy toàn bộ test
npm run typecheck  # Kiểm tra kiểu TypeScript (không build)
```

## Kiến trúc

- `src/components/` — Các component React tái sử dụng.
- `src/pages/` — Các trang, mỗi file là một route.
- `src/utils/` — Hàm tiện ích thuần (pure function), phải có test.
- `src/api/` — Lớp gọi API, không chứa logic giao diện.

## Quy ước code

- Dùng TypeScript, bật strict mode.
- Comment và thông báo lỗi cho người dùng viết bằng tiếng Việt.
- Đặt tên hàm theo camelCase, component theo PascalCase.
- Không mutate (thay đổi tại chỗ) object; luôn tạo bản sao mới.

## Ràng buộc

- KHÔNG commit file .env hay bất kỳ secret nào.
- Mỗi hàm tiện ích mới phải kèm test.
- Không sửa file trong thư mục generated/ (sinh tự động).
```

Lưu ý: phần ```bash bên trong ví dụ trên chỉ là minh hoạ nội dung — trong file
CLAUDE.md thật, bạn viết các khối code bình thường.

## Tạo nhanh bằng lệnh /init

Bạn không cần viết CLAUDE.md từ con số không. Trong phiên Claude Code, dùng lệnh:

```bash
# Quét dự án và tạo file CLAUDE.md tự động
/init
```

Lệnh `/init` sẽ phân tích cấu trúc dự án, nhận diện ngôn ngữ/framework, các lệnh
phổ biến, rồi sinh ra một CLAUDE.md ban đầu. Sau đó bạn **đọc lại và chỉnh sửa**
cho khớp thực tế — đặc biệt là phần ràng buộc và quy ước mà công cụ không thể tự
suy ra.

## Mẹo viết CLAUDE.md hiệu quả

- **Viết bằng câu mệnh lệnh rõ ràng**: "Luôn chạy test trước khi commit" tốt hơn
  "nên cân nhắc test".
- **Cập nhật khi dự án đổi**: lệnh hay quy ước thay đổi thì sửa CLAUDE.md ngay.
- **Đặt ràng buộc quan trọng lên đầu** để chúng nổi bật.
- **Có thể đặt CLAUDE.md trong thư mục con**: dùng cho hướng dẫn riêng của một
  module cụ thể, bổ sung cho file ở gốc.
- **Commit vào Git** để cả nhóm dùng chung.

## Tóm tắt

- **CLAUDE.md** là file Markdown ở gốc dự án, chứa hướng dẫn Claude Code tự động
  tuân theo.
- Nên ghi: **lệnh thường dùng, kiến trúc, quy ước code, ràng buộc, công nghệ**.
- Giữ nó **ngắn gọn, hành động được**; đặt ràng buộc quan trọng lên đầu.
- Dùng lệnh **/init** để sinh CLAUDE.md ban đầu, rồi tự chỉnh sửa.
- Commit CLAUDE.md vào Git để cả nhóm cùng hưởng ngữ cảnh nhất quán.
