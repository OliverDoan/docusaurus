---
sidebar_position: 4
title: "Background Jobs"
---

# Background Jobs

## 8. Background Jobs

Bài học: [8. Background Jobs](../../system-design/04-background-jobs/1_background-jobs.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi nào nên đưa một tác vụ thành background job?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi tác vụ **chậm** (vượt ngưỡng latency chấp nhận được của API), **không cần kết quả ngay** để trả lời user, **phụ thuộc dịch vụ ngoài** dễ lỗi, hoặc cần **chạy định kỳ**. Lợi ích: API phản hồi nhanh, tách lỗi, scale worker độc lập, san phẳng tải đỉnh. Đổi lại: thêm hạ tầng (queue), xử lý eventual consistency và trạng thái "đang xử lý" ở UI.

</details>

**2. Event-driven và schedule-driven job khác nhau thế nào? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Event-driven:** kích hoạt bởi sự kiện — user đăng ký → gửi email; file upload lên S3 → tạo thumbnail; message `OrderCreated` → trừ kho. Tải phụ thuộc lượng sự kiện, cần autoscale theo độ dài queue.
- **Schedule-driven:** kích hoạt bởi thời gian — cron báo cáo 2h sáng, dọn session hết hạn, huỷ đơn chưa thanh toán sau 15 phút (delayed job). Rủi ro chính: chạy trùng khi nhiều instance, chồng lấn khi lần trước chưa xong, múi giờ.

</details>

**3. Làm sao trả kết quả của một job bất đồng bộ cho client?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Polling:** API trả `202 Accepted` + URL trạng thái; client gọi định kỳ (có backoff, `Retry-After`). Đơn giản, không cần endpoint phía client.
- **Callback/Webhook:** server gọi lại URL client đã đăng ký khi xong. Gần tức thì nhưng cần ký HMAC, retry, và bên nhận phải idempotent.
- **Push (WebSocket/SSE/notification):** cho UI realtime.

Thực tế thường kết hợp: webhook để nhanh + endpoint polling để đối soát khi webhook bị lỡ.

</details>

**4. Vì sao job cần idempotent? Làm thế nào để đạt được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đa số queue đảm bảo **at-least-once**: worker có thể xử lý xong nhưng crash trước khi ack → job bị giao lại; retry do timeout cũng có thể chạy lại việc đã thành công. Cách đạt idempotent: idempotency key (vd `orderId + loại việc`), ràng buộc UNIQUE + `ON CONFLICT DO NOTHING`, UPSERT, kiểm tra trạng thái trước khi làm, gửi idempotency key sang API bên thứ ba (Stripe hỗ trợ header `Idempotency-Key`).

</details>

**5. Bạn có 5 instance API, mỗi instance chạy một cron gửi báo cáo hằng ngày. Vấn đề gì xảy ra và sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Báo cáo bị gửi **5 lần**. Cách sửa:

- Tách scheduler thành một deployment riêng chỉ 1 replica (hoặc Kubernetes CronJob với `concurrencyPolicy: Forbid`).
- Dùng **distributed lock** (Redis `SET key value NX PX ttl`) — instance nào lấy được lock mới chạy.
- Dùng queue hỗ trợ repeatable job (BullMQ, Sidekiq-cron) để chỉ một job được tạo cho mỗi lượt.
- Kết hợp idempotency: khoá theo ngày báo cáo để có chạy trùng cũng không gửi trùng.

</details>

**6. Dead Letter Queue là gì và tại sao cần?**

<details className="qa">
<summary>Xem đáp án</summary>

DLQ là hàng đợi riêng chứa các message/job **đã thất bại quá số lần retry** (hoặc không thể parse). Nếu không có DLQ, job lỗi vĩnh viễn ("poison message") sẽ retry mãi chiếm tài nguyên, hoặc bị bỏ mất không ai biết. Với DLQ, ta cảnh báo, điều tra nguyên nhân, sửa bug rồi **replay** job từ DLQ về queue chính.

</details>
