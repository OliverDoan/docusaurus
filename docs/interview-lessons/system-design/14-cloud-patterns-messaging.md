---
sidebar_position: 14
title: "Cloud Patterns: Messaging"
---

# Cloud Patterns: Messaging

## 30. Messaging Patterns: Queue

Bài học: [30. Messaging Patterns: Queue](../../system-design/14-cloud-patterns-messaging/1_queue-patterns.md)

**1. Queue-Based Load Leveling giải quyết vấn đề gì? Metric nào quan trọng nhất khi vận hành?**

<details className="qa">
<summary>Xem đáp án</summary>

San phẳng đỉnh tải để bảo vệ downstream có giới hạn throughput: producer ghi vào queue nhanh, consumer xử lý đều đặn theo khả năng của downstream. Metric quan trọng: độ dài queue (backlog) và tuổi của message cũ nhất -- cho biết độ trễ thực tế user phải chịu; consumer lag với Kafka. Kết hợp autoscaling theo backlog nhưng không vượt giới hạn downstream.

</details>

**2. Với competing consumers, vì sao phải idempotent? Làm idempotent thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hầu hết queue giao at-least-once: consumer xử lý xong nhưng chết trước khi ack, hoặc visibility timeout hết, message sẽ được giao lại cho consumer khác. Cách làm: lưu message ID (hoặc idempotency key nghiệp vụ) vào bảng có ràng buộc unique trong cùng transaction với thay đổi nghiệp vụ; dùng upsert; hoặc kiểm tra trạng thái (chỉ chuyển PENDING → PAID nếu đang PENDING).

</details>

**3. Làm sao vừa xử lý song song vừa đảm bảo thứ tự sự kiện của từng đơn hàng?**

<details className="qa">
<summary>Xem đáp án</summary>

Sequential Convoy: dùng khoá nhóm là `orderId` -- Kafka partition key, SQS FIFO `MessageGroupId`, Service Bus `SessionId`. Message cùng khoá vào cùng làn và được một consumer xử lý tuần tự; các làn khác nhau chạy song song. Lưu ý head-of-line blocking khi một message lỗi, và hot partition nếu phân phối khoá lệch.

</details>

**4. Triển khai priority queue trên SQS (không hỗ trợ priority) thế nào? Tránh starvation ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo nhiều queue theo mức (high/normal/low). Hoặc cấp pool consumer riêng với số lượng khác nhau cho mỗi queue, hoặc một pool đọc theo trọng số (weighted round-robin). Tránh starvation bằng trọng số tối thiểu cho queue thấp, consumer chuyên trách cho queue thấp, hoặc aging -- chuyển message chờ quá lâu lên queue cao hơn. Mức ưu tiên do server quyết định, không để client tự đặt.

</details>

**5. Kafka topic có 6 partition, bạn chạy 10 consumer trong cùng consumer group. Chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi partition chỉ được gán cho tối đa một consumer trong group, nên chỉ 6 consumer hoạt động, 4 consumer ngồi không (có thể đóng vai dự phòng khi rebalance). Muốn tăng song song phải tăng số partition -- nhưng việc này thay đổi ánh xạ key → partition, cần cân nhắc với các luồng phụ thuộc thứ tự.

</details>

**6. Poison message là gì và xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Message luôn làm consumer lỗi (dữ liệu hỏng, schema sai, bug) -- nếu không xử lý, nó được retry vô hạn, tốn tài nguyên và chặn cả nhóm trong FIFO. Xử lý: giới hạn số lần retry (maxReceiveCount), chuyển sang dead-letter queue, alert khi DLQ có message, có công cụ xem và redrive (đẩy lại) sau khi sửa bug.

</details>

---

## 31. Messaging Patterns: Pub/Sub, Choreography, Pipes & Filters, Claim Check

Bài học: [31. Messaging Patterns: Pub/Sub, Choreography, Pipes & Filters, Claim Check](../../system-design/14-cloud-patterns-messaging/2_pubsub-choreography.md)

**1. Queue và Pub/Sub khác nhau thế nào? Làm sao kết hợp cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Queue (point-to-point): mỗi message được một consumer xử lý -- phân chia công việc. Pub/Sub: mỗi message tới mọi subscriber -- phát tán sự kiện. Kết hợp: fan-out SNS → nhiều SQS (mỗi service một queue, trong mỗi queue nhiều instance cạnh tranh); trong Kafka, mỗi consumer group nhận toàn bộ message (pub/sub), các consumer trong group chia partition (queue).

</details>

**2. Choreography và orchestration -- khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Choreography khi luồng ngắn, ít nhánh, các service do team độc lập sở hữu, muốn ghép lỏng và dễ thêm bên quan tâm. Orchestration khi luồng dài, nhiều điều kiện/timeout/bù phức tạp, cần nhìn thấy trạng thái từng instance quy trình (Temporal, Step Functions). Thường lai: orchestration trong một domain, choreography giữa các domain.

</details>

**3. Làm sao đảm bảo event được publish khi đã ghi DB thành công?**

<details className="qa">
<summary>Xem đáp án</summary>

Transactional Outbox: trong cùng transaction ghi dữ liệu nghiệp vụ và ghi event vào bảng `outbox`; một relay (polling hoặc CDC như Debezium đọc WAL/binlog) đọc outbox và publish lên broker, đánh dấu đã gửi. Relay có thể gửi trùng → subscriber idempotent theo `eventId`.

</details>

**4. Pipes and Filters có ưu điểm gì so với một service xử lý nguyên khối?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi filter scale độc lập theo tài nguyên nó cần (bước resize cần nhiều CPU chạy 10 instance, bước lưu chạy 1); deploy, thay thế, tái sử dụng riêng; lỗi được cô lập ở từng bước với DLQ riêng; dễ thêm bước mới. Đổi lại: độ trễ cộng dồn, nhiều thành phần cần vận hành và giám sát, không có transaction xuyên pipeline.

</details>

**5. Claim Check là gì? Cần chú ý gì về vòng đời dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

Lưu payload lớn vào object storage, gửi qua broker chỉ tham chiếu (key). Chú ý: ghi payload xong mới gửi message; dọn payload bằng lifecycle rule với thời hạn dài hơn retention của message (tránh xoá khi consumer chưa đọc, đặc biệt khi có nhiều subscriber); kiểm soát quyền truy cập storage; xử lý trường hợp payload không còn.

</details>

**6. Subscriber mới cần đọc lại toàn bộ sự kiện cũ. Chọn broker nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Broker dạng log lưu lâu dài như Kafka, Kinesis, Event Hubs -- subscriber mới tạo consumer group và đọc từ offset đầu (trong giới hạn retention, hoặc dùng compacted topic để giữ bản mới nhất theo key). SNS/SQS hay RabbitMQ xoá message sau khi giao, không đọc lại được; khi đó cần event store riêng hoặc snapshot từ DB.

</details>

---

## 32. Async Request-Reply & Scheduler Agent Supervisor

Bài học: [32. Async Request-Reply & Scheduler Agent Supervisor](../../system-design/14-cloud-patterns-messaging/3_async-request-reply-scheduler.md)

**1. Thiết kế API xuất báo cáo mất 5 phút. Client gọi thế nào và nhận kết quả ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`POST /reports` → validate đồng bộ, tạo job, đẩy vào queue, trả **202 Accepted** + `Location: /reports/status/{id}` + `Retry-After`. Client poll status: đang chạy trả 200 + tiến độ; xong trả 303 tới `/reports/{id}` (hoặc presigned URL tới file trên S3); lỗi trả trạng thái FAILED. Thêm Idempotency-Key cho POST, UUID + kiểm tra quyền cho status, hết hạn kết quả, và tuỳ chọn webhook/SSE để thông báo tức thì.

</details>

**2. Vì sao không giữ HTTP request mở cho tới khi xử lý xong?**

<details className="qa">
<summary>Xem đáp án</summary>

Load balancer/API gateway có timeout (ví dụ AWS API Gateway REST mặc định 29 giây, ALB idle 60 giây); client mobile mất mạng giữa chừng là mất kết quả; mỗi kết nối chiếm tài nguyên server; không retry được an toàn. Tách nhận yêu cầu và trả kết quả giúp xử lý bền vững qua queue và client có thể quay lại bất cứ lúc nào.

</details>

**3. Polling, webhook và WebSocket/SSE -- chọn thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Polling: đơn giản nhất, client không cần endpoint, hợp trình duyệt/mobile, đánh đổi bằng request thừa và độ trễ phát hiện. Webhook: tức thì, hợp tích hợp server-với-server, cần client có endpoint công khai, ký HMAC và retry. WebSocket/SSE: realtime cho UI, nhưng duy trì kết nối lâu dài khó scale. Thường giữ status endpoint làm nền tảng và thêm webhook hoặc SSE.

</details>

**4. Scheduler Agent Supervisor gồm những thành phần nào? Supervisor làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Scheduler điều phối các bước và ghi trạng thái kèm hạn hoàn thành vào State Store; Agent đóng gói lời gọi tới từng dịch vụ từ xa; Supervisor chạy định kỳ, tìm bước quá hạn/thất bại, quyết định retry (qua scheduler) hoặc kích hoạt bù trừ, hoặc chuyển cho con người. State Store bền vững giúp khôi phục khi scheduler crash.

</details>

**5. Supervisor retry một bước đặt phòng đã thành công nhưng message kết quả bị mất. Làm sao tránh đặt trùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Agent phải idempotent: gửi idempotency key cố định theo `workflowId + stepName` cho dịch vụ khách sạn (nếu hỗ trợ), hoặc trước khi gọi đặt phòng thì truy vấn xem đã có booking với mã tham chiếu đó chưa. Ở phía mình, ghi nhận kết quả bằng thao tác upsert theo khoá (workflow_id, step_name).

</details>

**6. Khi nào nên dùng Temporal/Step Functions thay vì tự xây Scheduler Agent Supervisor?**

<details className="qa">
<summary>Xem đáp án</summary>

Hầu hết các trường hợp. Workflow engine đã giải sẵn các phần khó: lưu trạng thái bền vững, timeout từng bước, retry có backoff, khôi phục khi worker crash, xem lịch sử từng workflow, phiên bản hoá workflow. Tự xây chỉ đáng khi yêu cầu rất đơn giản (vài bước, một bảng trạng thái + cron) hoặc ràng buộc không cho dùng thêm hạ tầng.

</details>
