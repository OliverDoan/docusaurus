---
sidebar_position: 10
title: "Asynchronism"
---

# Asynchronism

## 21. Asynchronism: Message Queue, Task Queue & Back Pressure

Bài học: [21. Asynchronism: Message Queue, Task Queue & Back Pressure](../../system-design/10-asynchronism/1_queues-back-pressure.md)

**1. Vì sao dùng message queue? Đánh đổi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Lợi ích: tách producer/consumer (decoupling), giảm latency phía user, hấp thụ đột biến tải, scale worker độc lập, cô lập lỗi của dịch vụ phía sau, retry dễ dàng. Đánh đổi: thêm một thành phần phải vận hành và giám sát; eventual consistency; phải xử lý trùng lặp, thứ tự, poison message; debug khó hơn vì luồng bị cắt rời (cần tracing có correlation id).

</details>

**2. Phân biệt at-most-once, at-least-once, exactly-once. Bạn chọn cái nào cho hệ thống thanh toán?**

<details className="qa">
<summary>Xem đáp án</summary>

At-most-once: ack trước khi xử lý, có thể mất. At-least-once: ack sau khi xử lý, có thể trùng. Exactly-once: không mất không trùng, rất khó đạt end-to-end qua mạng. Với thanh toán: dùng **at-least-once** + consumer **idempotent** (idempotency key, unique constraint, bảng processed_messages) để đạt "effectively exactly-once". Kafka transactions chỉ cho exactly-once trong phạm vi Kafka.

</details>

**3. Kafka khác RabbitMQ thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

RabbitMQ là broker truyền thống: exchange route vào queue, message bị xoá khi ack, routing linh hoạt, phù hợp work queue. Kafka là distributed log: message giữ theo retention, consumer tự giữ offset, có thể replay, nhiều consumer group đọc độc lập, thứ tự trong partition, throughput rất cao -- phù hợp event streaming, CDC, analytics. Chọn RabbitMQ cho task/routing phức tạp; Kafka khi cần lưu lịch sử và nhiều hệ thống cùng tiêu thụ.

</details>

**4. Back pressure là gì? Hãy thiết kế cách xử lý khi queue tăng nhanh hơn tốc độ xử lý.**

<details className="qa">
<summary>Xem đáp án</summary>

Back pressure là cơ chế để phía sau báo ngược lên phía trước giảm tốc. Thiết kế: (1) queue có giới hạn dựa trên Little's Law và SLA chờ tối đa; (2) API trả 429/503 + `Retry-After` khi vượt ngưỡng; (3) consumer dùng pull với prefetch/concurrency cố định; (4) autoscale worker theo độ dài queue/consumer lag; (5) load shedding việc ít quan trọng; (6) client retry bằng exponential backoff + jitter.

</details>

**5. Task queue khác message queue ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Message queue là hạ tầng truyền message (thường là sự kiện, có thể nhiều consumer). Task queue (Celery, BullMQ, Sidekiq) xây trên broker, truyền **mệnh lệnh** cho đúng một worker, kèm tính năng: retry backoff, delay/cron, priority, rate limit, theo dõi trạng thái và kết quả job.

</details>

**6. Làm sao đảm bảo ghi DB và publish event cùng thành công?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng two-phase commit giữa DB và broker (chậm, broker thường không hỗ trợ). Dùng **Transactional Outbox**: trong cùng transaction, ghi dữ liệu nghiệp vụ và một bản ghi vào bảng `outbox`. Relay process (polling hoặc CDC qua Debezium) đọc outbox và publish, đánh dấu đã gửi. Có thể publish trùng nên consumer phải idempotent.

</details>

---

## 22. Idempotent Operations

Bài học: [22. Idempotent Operations](../../system-design/10-asynchronism/2_idempotent-operations.md)

**1. Idempotent là gì? Phân biệt với safe.**

<details className="qa">
<summary>Xem đáp án</summary>

Idempotent: thực hiện một hay nhiều lần cho cùng trạng thái cuối. Safe: không làm thay đổi trạng thái. GET là safe và idempotent; PUT, DELETE là idempotent nhưng không safe; POST không có tính chất nào mặc định. Idempotency nói về trạng thái, không đòi hỏi response giống hệt (DELETE lần 2 có thể trả 404).

</details>

**2. Client gọi API thanh toán bị timeout. Thiết kế thế nào để client retry an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Client sinh idempotency key một lần cho ý định thanh toán và gửi kèm mọi lần retry. Server: bảng `idempotency_keys` với primary key `(account_id, key)`; trong một transaction, insert key trạng thái processing (ON CONFLICT DO NOTHING), thực hiện thanh toán, lưu response và đánh dấu completed. Gặp lại key: completed thì trả response cũ, processing thì 409, hash body khác thì 422. Truyền key xuống cổng thanh toán. Key có TTL (ví dụ 24 giờ). Client retry bằng exponential backoff.

</details>

**3. Queue đảm bảo at-least-once. Làm sao consumer không xử lý trùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi message có ID ổn định từ lúc publish. Consumer, trong cùng transaction với side effect, insert `message_id` vào bảng processed_messages có primary key; nếu insert không thêm dòng nào thì message đã xử lý, bỏ qua và ack. Ngoài ra dùng upsert, conditional update, unique constraint trên khoá nghiệp vụ. Redis SETNX nhanh nhưng không atomic với DB.

</details>

**4. PUT và POST khác nhau thế nào về idempotency? Khi nào nên dùng PUT để tạo resource?**

<details className="qa">
<summary>Xem đáp án</summary>

PUT thay thế toàn bộ resource tại một URI xác định -- lặp lại cho cùng kết quả. POST gửi tới collection, server sinh id -- lặp lại có thể tạo nhiều resource. Dùng PUT để tạo khi client có thể tự quyết định id (UUID sinh phía client, hoặc khoá tự nhiên như username), khi đó retry an toàn mà không cần idempotency key.

</details>

**5. Vì sao "check rồi insert" không đủ để chống trùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Race condition: hai request đồng thời cùng SELECT thấy chưa có, rồi cùng INSERT. Muốn đúng phải để DB làm trọng tài bằng unique constraint (INSERT ON CONFLICT), hoặc khoá (SELECT FOR UPDATE, advisory lock), hoặc isolation SERIALIZABLE. Unique constraint là cách đơn giản và chắc chắn nhất.

</details>

**6. Exactly-once có tồn tại không?**

<details className="qa">
<summary>Xem đáp án</summary>

Exactly-once **delivery** qua mạng không đáng tin cậy là không thể đảm bảo tuyệt đối (giới hạn kiểu Two Generals). Thứ đạt được là exactly-once **processing/effect**: at-least-once delivery + xử lý idempotent (dedupe), hoặc transaction bao trọn đọc-xử lý-ghi trong một hệ thống (Kafka transactions trong phạm vi Kafka).

</details>
