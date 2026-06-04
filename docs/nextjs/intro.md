---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình học Next.js

## Next.js là gì?

Next.js là một framework (bộ khung phát triển) xây dựng trên nền React, giúp bạn tạo ra các ứng dụng web full-stack (toàn diện cả phần giao diện lẫn phần máy chủ) một cách nhanh chóng. Nói cách khác, thay vì tự lắp ráp từng mảnh công cụ rời rạc, Next.js cung cấp sẵn một bộ giải pháp hoàn chỉnh để bạn tập trung vào việc viết tính năng.

## Vì sao nên dùng Next.js?

Khi làm việc với React thuần (chỉ dùng thư viện React một mình), bạn sẽ phải tự cấu hình rất nhiều thứ: cách điều hướng giữa các trang, cách lấy dữ liệu, cách tối ưu hình ảnh, cách đóng gói code... Next.js giải quyết hầu hết những việc đó cho bạn:

- **SSR (server-side rendering - kết xuất phía máy chủ):** trang web được dựng sẵn trên máy chủ rồi mới gửi xuống trình duyệt. Điều này giúp trang hiển thị nhanh hơn và thân thiện hơn với SEO (search engine optimization - tối ưu hóa công cụ tìm kiếm).
- **Routing (định tuyến) sẵn có:** chỉ cần tạo file trong thư mục là tự động có đường dẫn (route) tương ứng, không cần cài thêm thư viện.
- **Tối ưu tự động:** Next.js tự tối ưu hình ảnh, font chữ, và chia nhỏ code (code splitting) để trang tải nhanh nhất có thể.
- **Full-stack:** bạn có thể viết cả API (giao diện lập trình ứng dụng) ngay trong cùng một dự án, không cần dựng riêng một máy chủ backend.

## Khác React thuần thế nào?

React thuần chỉ là một thư viện (library) lo phần dựng giao diện. Mọi thứ còn lại bạn phải tự quyết định và tự ghép vào. Next.js là một framework bao trọn React và bổ sung thêm routing, kết xuất phía máy chủ, tối ưu hóa, và khả năng viết backend. Tóm lại: React cho bạn các mảnh ghép, còn Next.js cho bạn cả bức tranh hoàn chỉnh.

## Cần biết gì trước khi học?

Bạn nên nắm vững **React** trước khi học Next.js, bao gồm: component (thành phần giao diện), props (thuộc tính truyền vào), state (trạng thái), và hooks (các hàm móc như useState, useEffect). Next.js xây dựng dựa trên những khái niệm này, nên hiểu React vững sẽ giúp bạn học Next.js dễ dàng hơn rất nhiều.

## Lộ trình học

| # | Chủ đề | Mô tả |
|---|--------|-------|
| 1 | Introduction | Giới thiệu tổng quan về Next.js, triết lý và lợi ích của framework |
| 2 | Getting Started | Bắt đầu cài đặt, khởi tạo dự án và chạy ứng dụng đầu tiên |
| 3 | Routing | Định tuyến cơ bản: tạo trang, đường dẫn và điều hướng giữa các trang |
| 4 | Routing Patterns | Các mẫu định tuyến nâng cao: route động, route lồng nhau, nhóm route |
| 5 | Structuring Routes | Cách tổ chức và sắp xếp cấu trúc thư mục route cho dự án lớn |
| 6 | Middleware | Phần mềm trung gian: chặn và xử lý request trước khi tới trang |
| 7 | Internationalization | Đa ngôn ngữ: hỗ trợ nhiều ngôn ngữ và vùng miền cho ứng dụng |
| 8 | Working with Data | Làm việc với dữ liệu: kết nối, đọc và ghi dữ liệu trong ứng dụng |
| 9 | Data Fetching Patterns | Các mẫu lấy dữ liệu: cách tải dữ liệu hiệu quả ở các tình huống khác nhau |
| 10 | Caching Data | Bộ nhớ đệm dữ liệu: lưu tạm dữ liệu để tăng tốc và giảm tải |
| 11 | Rendering | Kết xuất: các kiểu dựng trang (server, client, tĩnh, động) |
| 12 | Runtimes | Môi trường chạy: lựa chọn giữa Node.js và Edge runtime |
| 13 | Writing CSS | Viết CSS: tạo kiểu cho giao diện bằng nhiều cách khác nhau |
| 14 | Optimizations | Tối ưu hóa: cải thiện hình ảnh, font, script và hiệu năng tổng thể |
| 15 | Configuring | Cấu hình: tùy chỉnh hành vi của Next.js qua các tệp cấu hình |
| 16 | Testing | Kiểm thử: viết và chạy bài kiểm tra để đảm bảo chất lượng |
| 17 | Preparing for Production | Chuẩn bị lên môi trường thực: rà soát và tối ưu trước khi phát hành |
| 18 | Deployment | Triển khai: đưa ứng dụng lên máy chủ để người dùng truy cập |

## Học theo thứ tự nào?

Lộ trình trên được sắp xếp từ cơ bản đến nâng cao, nên cách an toàn nhất là **học tuần tự từ chủ đề 1 đến 18**. Một số gợi ý:

- **Người mới hoàn toàn:** đi theo đúng thứ tự. Đừng vội nhảy cóc, vì các chủ đề sau dựa trên kiến thức của chủ đề trước.
- **Nhóm 1–7 (nền tảng và định tuyến):** đây là phần lõi, hãy chắc chắn nắm vững trước khi đi tiếp.
- **Nhóm 8–11 (dữ liệu và kết xuất):** phần quan trọng nhất quyết định hiệu năng và trải nghiệm người dùng, nên dành nhiều thời gian thực hành.
- **Nhóm 12–18 (tối ưu, cấu hình, kiểm thử và triển khai):** có thể học song song với việc xây dựng một dự án thực tế nhỏ để ghi nhớ tốt hơn.

Lời khuyên chung: **vừa học vừa làm**. Sau mỗi chủ đề, hãy tự tay viết một ví dụ nhỏ. Kiến thức chỉ thật sự thuộc về bạn khi bạn áp dụng được nó vào code thực tế.
