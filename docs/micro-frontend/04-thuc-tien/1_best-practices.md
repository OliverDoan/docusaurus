---
sidebar_position: 1
title: "1. Best Practices & Lỗi thường gặp"
---

# Best Practices & Lỗi thường gặp

Bài cuối tổng hợp các **thực hành tốt** khi làm micro-frontend trong thực tế và
những **lỗi phổ biến** khiến dự án trả giá đắt. Đây là phần đúc kết để bạn áp dụng,
sau khi đã nắm khái niệm (mục 1) và kỹ thuật (mục 2–3).

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Design system` dùng chung là bắt buộc** — không có nó, micro-frontend gần như chắc chắn dẫn tới UI chắp vá.
- ⭐ **Tránh các lỗi kinh điển** — dùng khi nhóm nhỏ, quên `singleton` cho React, shared store khổng lồ, thiếu design system, bỏ qua xử lý lỗi tải remote.
- **Chia sẻ dependency nền dạng `singleton`, thống nhất version** — và chỉ chia sẻ thứ thực sự dùng chung.
- **Cô lập style** bằng `CSS Modules` / prefix / `Shadow DOM` để tránh rò rỉ CSS giữa các mảnh.
- **Định nghĩa hợp đồng (`contract`) rõ ràng cho mỗi remote** — props nhận vào, sự kiện phát ra; tận dụng manifest/type hinting của MF 2.0.
- **Lo hiệu năng và vận hành** — chống tải trùng, lazy-load, CDN; `Error Boundary`, observability theo mảnh và fallback khi remote lỗi.

:::

---

## Mục lục

- [Design system: nền tảng của sự nhất quán](#design-system-nền-tảng-của-sự-nhất-quán)
- [Quản lý dependency chung](#quản-lý-dependency-chung)
- [Cô lập style](#cô-lập-style)
- [Versioning & hợp đồng](#versioning--hợp-đồng)
- [Hiệu năng](#hiệu-năng)
- [Vận hành & quan sát](#vận-hành--quan-sát)
- [Checklist & các lỗi thường gặp](#checklist--các-lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Design system: nền tảng của sự nhất quán

Vì mỗi mảnh do một nhóm làm, nguy cơ lớn nhất là **giao diện rời rạc** (nút mỗi
nơi một kiểu). Giải pháp: một **design system** (hệ thống thiết kế) dùng chung.

- Đóng gói component dùng chung (Button, Input, Modal...) thành **một thư viện**
  hoặc **một remote chia sẻ**.
- Chia sẻ **design token** (màu, khoảng cách, font) qua biến CSS hoặc theme chung.
- Coi design system như một mảnh có **chủ sở hữu rõ ràng** và versioning cẩn thận.

> Không có design system, micro-frontend gần như chắc chắn dẫn tới UI chắp vá.

## Quản lý dependency chung

- **Chia sẻ thư viện nền** (`react`, `react-dom`, router) dạng **`singleton`** để
  tránh tải trùng và lỗi đa-bản (xem mục Module Federation).
- **Thống nhất phiên bản** các thư viện chia sẻ giữa các nhóm; lệch version lớn là
  nguồn lỗi runtime khó chịu.
- **Đừng chia sẻ mọi thứ** — chỉ chia sẻ thứ thực sự dùng chung. Chia sẻ tràn lan
  làm các mảnh dính chặt vào nhau.

## Cô lập style

CSS toàn cục dễ "rò rỉ" giữa các mảnh. Các cách cô lập:

| Cách | Mô tả |
| --- | --- |
| **CSS Modules** | Tự sinh tên class cục bộ, tránh đụng tên |
| **Quy ước tiền tố** | Mỗi mảnh prefix class riêng (vd `.cart-…`) |
| **Shadow DOM** | (qua Web Components) cô lập style triệt để |
| **Utility CSS** (Tailwind…) | Giảm CSS tự viết; lưu ý cấu hình nhất quán giữa các mảnh |

> Tránh CSS toàn cục không có phạm vi (global, không scope) — đây là nguồn lỗi
> "mảnh A làm vỡ giao diện mảnh B".

## Versioning & hợp đồng

- Định nghĩa **hợp đồng (contract)** rõ ràng cho mỗi remote: props nhận vào, sự
  kiện phát ra. Coi đó như API công khai.
- **Không phá hợp đồng đột ngột** — đổi breaking thì tăng version và thông báo.
- Cân nhắc **manifest + type hinting** của Module Federation 2.0 để bắt lệch hợp
  đồng sớm (lúc biên dịch thay vì lúc chạy).

## Hiệu năng

- **Theo dõi tải trùng** — kiểm tra Network/bundle xem React hay thư viện lớn có
  bị tải nhiều lần không.
- **Lazy-load mảnh** — chỉ tải remote khi cần (route/tương tác), dùng `Suspense`.
- **Đặt remote gần CDN** — vì host tải remote qua mạng, độ trễ ảnh hưởng trực tiếp.
- **Đo bundle từng mảnh** bằng bundle analyzer; mỗi nhóm chịu trách nhiệm "ngân
  sách" kích thước của mình.

## Vận hành & quan sát

- **Mỗi mảnh một pipeline** build/deploy độc lập — đó là cả điểm mạnh lẫn chi phí.
- **Error Boundary cho từng remote** để một mảnh sập không kéo sập trang (xem demo
  React).
- **Quan sát (observability)**: gắn log/metric kèm *tên mảnh + version* để truy
  vết lỗi xuyên mảnh — vốn là điểm khó nhất khi debug.
- **Fallback khi remote lỗi**: hiển thị thông báo thân thiện thay vì màn hình
  trắng.

## Checklist & các lỗi thường gặp

:::tip Checklist trước khi lên production
- [ ] React/router chia sẻ dạng **`singleton`**, version thống nhất
- [ ] Mỗi remote có **Error Boundary** + trạng thái loading
- [ ] CSS được **cô lập** (CSS Modules / prefix / Shadow DOM)
- [ ] Có **design system** dùng chung cho component & token
- [ ] **Hợp đồng** props/sự kiện của mỗi remote được tài liệu hoá
- [ ] Đã kiểm tra **không tải trùng** dependency lớn
- [ ] Log/metric kèm **tên mảnh + version**
- [ ] Có **fallback** khi remote không tải được
:::

:::danger Các lỗi khiến dự án trả giá
- **Dùng micro-frontend cho nhóm nhỏ** — phức tạp gấp bội mà chẳng được lợi. (Xem
  lại mục 1: nó trị vấn đề *tổ chức*.)
- **Quên `singleton` cho React** → lỗi *"Invalid hook call"* khó hiểu.
- **Shared store khổng lồ** → monolith trá hình, mất luôn tính độc lập.
- **Không có design system** → UI chắp vá, trải nghiệm rời rạc.
- **Bỏ qua xử lý lỗi tải remote** → một mảnh sập làm trắng cả trang.
- **Chia sẻ quá nhiều** giữa các mảnh → coupling chặt, không deploy độc lập được
  nữa.
:::

## Tóm tắt

- **Design system** là bắt buộc để giữ UI nhất quán.
- Chia sẻ dependency nền dạng **`singleton`**, **thống nhất version**, và **chỉ
  chia sẻ thứ thực sự cần**.
- **Cô lập style** (CSS Modules / prefix / Shadow DOM) tránh rò rỉ CSS.
- Định nghĩa **hợp đồng rõ ràng** cho remote; tận dụng manifest/type hinting của
  MF 2.0.
- Lo **hiệu năng** (chống tải trùng, lazy-load, CDN) và **vận hành** (Error
  Boundary, observability theo mảnh, fallback).
- Tránh các lỗi kinh điển: dùng khi nhóm nhỏ, quên `singleton`, shared store
  khổng lồ, thiếu design system, bỏ qua xử lý lỗi.

🎉 Đây là bài cuối của topic **Micro-frontend**. Bạn đã đi từ *khái niệm* → *cách
tích hợp* → *Module Federation thực hành* → *Next.js* → *best practices*. Khi áp
dụng, hãy luôn nhớ: micro-frontend là công cụ cho **quy mô tổ chức**, dùng đúng
chỗ mới phát huy giá trị.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Micro-frontend giải quyết vấn đề gì? Vì sao nói nó trị vấn đề *tổ chức* nhiều hơn vấn đề kỹ thuật?
2. Khi nào bạn khuyên KHÔNG dùng micro-frontend? Dấu hiệu nào cho thấy team đang trả chi phí phức tạp mà không được lợi?
3. Vì sao `design system` dùng chung gần như bắt buộc? Bạn phân phối nó bằng thư viện `npm` hay một remote chia sẻ, và đánh đổi của từng cách?
4. So sánh các cách cô lập style: `CSS Modules`, quy ước tiền tố, `Shadow DOM`, utility CSS. Bạn chọn cách nào trong hoàn cảnh nào?
5. Nguyên tắc chia sẻ dependency giữa các mảnh: chia sẻ gì và không chia sẻ gì? Chuyện gì xảy ra khi lệch version?
6. Lỗi *Invalid hook call* trong micro-frontend thường bắt nguồn từ đâu, và khắc phục thế nào?
7. Các mảnh nên giao tiếp với nhau ra sao (custom event, props/callback, shared store)? Vì sao *shared store khổng lồ* là phản mẫu?
8. Hợp đồng (`contract`) của một remote gồm những gì? Làm sao phát hiện lệch hợp đồng lúc build thay vì lúc chạy?
9. Bạn xử lý một breaking change của remote đang được nhiều host dùng như thế nào?
10. Làm sao đảm bảo một mảnh sập không kéo sập cả trang? Mô tả chiến lược `Error Boundary` và fallback.
11. Bạn đo và chống việc tải trùng dependency lớn (React, router...) bằng cách nào?
12. Chiến lược đăng nhập dùng chung giữa các mảnh: token đặt ở đâu, `SSO` / `JWT` hoạt động thế nào, rủi ro bảo mật là gì?
13. Observability xuyên mảnh: bạn gắn thông tin gì vào log và metric để truy vết lỗi? Vì sao debug xuyên mảnh khó?
14. CI/CD cho micro-frontend: mỗi mảnh một pipeline thì test tích hợp và rollback làm ra sao?
15. Làm sao giữ hiệu năng khi số lượng mảnh tăng — lazy-load, CDN, ngân sách bundle cho từng nhóm?
