---
sidebar_position: 0
title: "Giới thiệu"
---

# Bảo mật web

Đây là hướng dẫn **bảo mật web thực chiến** cho lập trình viên full-stack — từ lỗ
hổng phổ biến (XSS, CSRF, injection), xác thực & phiên, transport & headers, tới
quản lý secret và chuỗi cung ứng. Tài liệu cân bằng giữa **nguyên lý** và **code
ví dụ** (JS/TS/Node), hợp với các topic React, Next.js, Backend đã có. Mỗi **thuật
ngữ chuyên ngành** (technical term) đều được giải thích ngay khi xuất hiện.

:::note[Ghi nhớ nhanh]

- ⭐ **Bảo mật là tư duy từ đầu, không phải bước cuối** — phải nghĩ tới ngay khi thiết kế và viết code, không dán vào trước khi lên production.
- ⭐ **Nguyên tắc xuyên suốt: không tin input** — mọi dữ liệu vượt **ranh giới hệ thống** (input người dùng, API, file) đều phải kiểm tra.
- **Cấu trúc 5 mục** — nền tảng, tấn công phổ biến, xác thực & phiên, transport & headers, secrets & chuỗi cung ứng.
- **Nguyên tắc vàng** — phòng thủ nhiều lớp, đặc quyền tối thiểu, an toàn mặc định, không tự chế crypto, lỗi không lộ thông tin nhạy cảm.
- **Mục đích phòng thủ** — mọi mô tả tấn công nhằm giúp hiểu để phòng chống trên hệ thống của chính bạn.

:::

---

## Vì sao phải quan tâm bảo mật?

Một lỗ hổng nhỏ có thể dẫn tới: rò rỉ dữ liệu người dùng, chiếm tài khoản, mất
tiền, sập dịch vụ, và mất uy tín. Bảo mật **không phải bước cuối** dán vào trước
khi lên production — nó phải được nghĩ tới **ngay từ khi thiết kế và viết code**.

> **Tư duy nền tảng:** *Không bao giờ tin dữ liệu từ bên ngoài* (input người dùng,
> phản hồi API, nội dung file). Mọi dữ liệu vượt **ranh giới hệ thống** (system
> boundary) đều phải được kiểm tra.

---

## Nội dung tài liệu

| # | Chủ đề | Bạn sẽ học được gì |
|---|--------|--------------------|
| 1 | **Nền tảng** | Tư duy bảo mật, bộ ba CIA, mô hình đe doạ, OWASP Top 10 |
| 2 | **Tấn công phổ biến** | XSS, CSRF, SQL/command injection, SSRF, clickjacking — và cách phòng |
| 3 | **Xác thực & Phiên** | Authentication/authorization, session, cookie, JWT, lưu mật khẩu an toàn |
| 4 | **Transport & Headers** | HTTPS/TLS, CORS & same-origin, security headers, CSP |
| 5 | **Secrets & Chuỗi cung ứng** | Quản lý secret, lỗ hổng dependency, supply chain, rate limiting |

---

## Nguyên tắc vàng của bảo mật web

1. **Không tin input** — validate (kiểm tra) và sanitize (làm sạch) mọi dữ liệu
   từ ngoài, ở **phía server** (client-side chỉ là phụ trợ).
2. **Phòng thủ nhiều lớp** (defense in depth) — không dựa vào một lớp bảo vệ duy
   nhất.
3. **Đặc quyền tối thiểu** (least privilege) — mỗi thành phần chỉ có đúng quyền
   cần thiết.
4. **An toàn mặc định** (secure by default) — mặc định khoá, chỉ mở những gì cần.
5. **Không tự chế thuật toán bảo mật** — dùng thư viện đã được kiểm chứng (hashing,
   mã hoá, xác thực).
6. **Thông báo lỗi không lộ thông tin nhạy cảm** — đừng tiết lộ chi tiết hệ thống
   cho kẻ tấn công.

:::warning Tài liệu này phục vụ mục đích PHÒNG THỦ
Mọi mô tả tấn công ở đây nhằm giúp bạn **hiểu để phòng chống** trên hệ thống của
chính mình. Chỉ kiểm thử bảo mật trên hệ thống bạn sở hữu hoặc được cho phép.
:::

Bắt đầu từ chủ đề **1. Nền tảng** ở thanh bên trái.
