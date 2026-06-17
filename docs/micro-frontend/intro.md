---
sidebar_position: 0
title: "Giới thiệu"
---

# Micro-frontend

Đây là hướng dẫn về **micro-frontend** (vi giao diện) — kiến trúc chia một ứng
dụng web lớn thành nhiều phần nhỏ độc lập, mỗi phần do một nhóm tự phát triển và
triển khai riêng. Tài liệu đi từ khái niệm cơ bản tới thực hành với **Module
Federation** (kỹ thuật phổ biến nhất hiện nay) và cách tích hợp vào **Next.js**.
Mỗi **thuật ngữ chuyên ngành** (technical term) đều được giải thích ngay khi xuất
hiện lần đầu.

---

## Micro-frontend là gì? (một câu)

**Micro-frontend** là việc áp dụng tư tưởng **microservices** (vi dịch vụ) vào
phía giao diện: thay vì một ứng dụng frontend khổng lồ do một nhóm xây dựng, ta
chia nó thành nhiều mảnh nhỏ độc lập, mỗi mảnh được phát triển, kiểm thử và
**triển khai (deploy) riêng**, rồi ghép lại thành một trang web liền mạch với
người dùng.

> **Monolith** (khối nguyên): kiểu kiến trúc gộp toàn bộ ứng dụng vào một codebase
> / một lần build duy nhất. Micro-frontend là hướng đối lập — chia nhỏ ra.

---

## Nội dung tài liệu

| # | Chủ đề | Bạn sẽ học được gì |
|---|--------|--------------------|
| 1 | **Cơ bản** | Micro-frontend là gì, các cách tích hợp, ưu/nhược và khi nào nên dùng |
| 2 | **Module Federation** | Kỹ thuật chia sẻ code lúc runtime; demo React host + remote, chia sẻ state & routing |
| 3 | **Tích hợp Next.js** | Dùng Module Federation với Next.js, các lưu ý và hạn chế |
| 4 | **Thực tiễn** | Design system, best practices, các lỗi thường gặp |

---

## Dành cho ai?

Tài liệu giả định bạn đã biết **React** và khái niệm cơ bản về **bundler** (công
cụ đóng gói code như Webpack/Vite). Nếu chưa, hãy xem topic React và JavaScript
trước.

---

## Nguyên tắc vàng

1. **Micro-frontend giải quyết vấn đề TỔ CHỨC, không phải vấn đề kỹ thuật** — nó
   dành cho nhiều nhóm/ứng dụng lớn, không phải để "nghe cho ngầu".
2. **Đừng dùng nếu nhóm nhỏ** — chi phí phức tạp thường lớn hơn lợi ích.
3. **Luôn cần một design system chung** để giữ giao diện nhất quán.

Bắt đầu từ chủ đề **1. Cơ bản** ở thanh bên trái.
