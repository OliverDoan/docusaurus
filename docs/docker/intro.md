---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình học Docker

Chào mừng bạn đến với lộ trình học Docker dành cho người mới bắt đầu. Tài liệu này sẽ giúp bạn hiểu Docker từ con số 0, không cần kiến thức nền tảng phức tạp.

## Docker là gì?

Docker là một công cụ giúp đóng gói ứng dụng cùng tất cả những thứ nó cần để chạy (mã nguồn, thư viện, cấu hình) vào trong một "hộp" tiêu chuẩn gọi là **container** (vùng chứa). Nhờ đó, ứng dụng của bạn sẽ chạy giống hệt nhau ở mọi nơi: trên máy tính của bạn, trên máy đồng nghiệp, hay trên máy chủ (server).

### Container là gì?

Container là một môi trường chạy ứng dụng được cô lập (isolated - tách biệt khỏi phần còn lại của hệ thống). Mỗi container chứa đầy đủ mọi thứ cần thiết để chạy một ứng dụng, nhưng vẫn nhẹ và khởi động rất nhanh.

### Khác máy ảo (VM) thế nào?

Nhiều người hay nhầm container với **máy ảo (Virtual Machine - VM)**. Điểm khác biệt chính:

- **Máy ảo (VM):** Mô phỏng lại toàn bộ một máy tính, bao gồm cả một hệ điều hành (operating system) riêng. Vì vậy VM rất nặng (tính bằng GB) và khởi động chậm (tính bằng phút).
- **Container:** Dùng chung phần lõi hệ điều hành của máy chủ (host), chỉ đóng gói riêng phần ứng dụng. Vì vậy container rất nhẹ (tính bằng MB) và khởi động cực nhanh (tính bằng giây).

### Ví dụ đời thường: container hàng hoá

Hãy tưởng tượng những thùng **container hàng hoá** (loại thùng sắt khổng lồ trên tàu biển). Dù bên trong chứa gì (quần áo, đồ điện tử, trái cây), thì kích thước thùng vẫn theo một tiêu chuẩn chung. Nhờ vậy, tàu biển, xe tải, cần cẩu ở bất kỳ cảng nào trên thế giới đều có thể bốc dỡ, vận chuyển được mà không cần quan tâm bên trong là gì.

Docker container cũng tương tự: dù ứng dụng của bạn viết bằng ngôn ngữ gì, dùng thư viện nào, thì khi đã đóng vào container, nó luôn chạy theo một cách tiêu chuẩn ở mọi môi trường.

## Vì sao nên dùng Docker?

Bạn đã bao giờ gặp tình huống code chạy tốt trên máy mình, nhưng khi đưa cho người khác thì lại lỗi? Câu nói kinh điển **"Nhưng nó chạy được trên máy tôi mà!"** chính là vấn đề mà Docker sinh ra để giải quyết.

Vì container đóng gói sẵn mọi thứ ứng dụng cần, nên nếu nó chạy được trên máy bạn thì nó cũng sẽ chạy được ở mọi nơi khác.

Lợi ích chính của Docker:

- **Nhất quán:** Ứng dụng chạy giống nhau ở mọi môi trường (máy cá nhân, máy chủ, đám mây).
- **Nhẹ và nhanh:** Khởi động trong vài giây, tiết kiệm tài nguyên hơn nhiều so với máy ảo.
- **Dễ chia sẻ:** Đóng gói một lần, gửi cho cả nhóm dùng chung dễ dàng.
- **Cô lập:** Mỗi ứng dụng chạy riêng, không gây xung đột thư viện với nhau.
- **Dễ mở rộng:** Cần nhiều bản chạy hơn? Chỉ việc tạo thêm container.

## Lộ trình học

Lộ trình được chia thành 5 nhóm chủ đề, đi từ cơ bản đến nâng cao:

| # | Chủ đề | Mô tả |
|---|--------|-------|
| 1 | Nền tảng | Hiểu khái niệm cơ bản, cài đặt Docker, chạy container đầu tiên và làm quen các lệnh thiết yếu. |
| 2 | Docker Images | Tìm hiểu image (bản thiết kế của container), cách viết Dockerfile và xây dựng image riêng. |
| 3 | Docker Containers | Quản lý vòng đời container: chạy, dừng, xoá, xem log, kết nối mạng và lưu trữ dữ liệu (volume). |
| 4 | Docker Compose | Dùng một file cấu hình để khởi chạy nhiều container cùng lúc (ví dụ ứng dụng web + cơ sở dữ liệu). |
| 5 | Nâng cao | Tối ưu image, bảo mật, đăng tải image lên registry và tích hợp vào quy trình triển khai. |

## Học theo thứ tự nào?

Nếu bạn là người mới hoàn toàn, hãy học **lần lượt từ nhóm 1 đến nhóm 5**. Mỗi nhóm là nền tảng cho nhóm tiếp theo:

1. Bắt đầu với **Nền tảng** để nắm chắc khái niệm và biết cách chạy lệnh cơ bản.
2. Sang **Docker Images** để hiểu container được tạo ra từ đâu.
3. Tiếp tục với **Docker Containers** để thành thạo việc vận hành hằng ngày.
4. Khi đã quen, học **Docker Compose** để quản lý nhiều container cùng lúc.
5. Cuối cùng là **Nâng cao** khi bạn muốn đưa ứng dụng ra môi trường thật.

Lời khuyên: hãy vừa đọc vừa gõ lệnh thực hành trực tiếp. Docker rất dễ học khi bạn tự tay làm thử thay vì chỉ đọc lý thuyết.
