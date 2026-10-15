---
sidebar_position: 1
title: "Giới thiệu System Design"
---

# Giới thiệu System Design

## 1. System Design là gì?

Bài học: [1. System Design là gì?](../../system-design/01-introduction/1_what-is-system-design.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Functional và non-functional requirements khác nhau thế nào? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Functional:** hệ thống **làm gì** — "user đăng được ảnh", "user follow được người khác".
- **Non-functional:** hệ thống **làm tốt đến đâu** — "feed load dưới 200ms ở p99", "uptime 99.99%", "chịu 100K QPS".

Non-functional requirements quyết định kiến trúc: cùng tính năng chat nhưng 1K user và 1 tỉ user có thiết kế khác hẳn nhau.

</details>

**2. Kể tên các thành phần chính trong một hệ thống web quy mô lớn và vai trò của chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

DNS (phân giải tên miền, GeoDNS), CDN (nội dung tĩnh gần user), Load balancer (phân tải + health check), App server stateless (business logic), Cache (dữ liệu nóng trong RAM), Database (lưu bền, replica/shard), Message queue (bất đồng bộ, decouple, buffer), Worker (việc nặng ở background), Object storage (file lớn), cùng monitoring/logging.

</details>

**3. Vì sao app server nên stateless?**

<details className="qa">
<summary>Xem đáp án</summary>

Stateless nghĩa là server không giữ dữ liệu riêng giữa các request (session, file upload tạm...). Khi đó:

- Load balancer gửi request tới **bất kỳ** server nào cũng được.
- Thêm/bớt server (autoscaling) dễ dàng, không phải "di chuyển" state.
- Một server chết không làm mất dữ liệu người dùng.

State được đẩy ra hệ thống chuyên dụng: Redis (session), DB, object storage.

</details>

**4. Bạn bắt đầu thiết kế một hệ thống mới thế nào khi chưa biết traffic?**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt đầu **đơn giản nhất có thể đáp ứng requirements hiện tại** (thường là monolith + một DB quan hệ + backup), nhưng giữ các nguyên tắc giúp scale về sau: app stateless, tách config, có monitoring. Khi có số liệu thật (QPS, kích thước dữ liệu, điểm nghẽn), mới thêm cache, replica, queue, sharding. Tránh tối ưu sớm.

</details>

**5. High-level design và low-level design khác gì nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

- **HLD:** nhìn toàn hệ thống — các service, database, cache, queue, luồng dữ liệu giữa chúng.
- **LLD:** đi sâu vào một thành phần — schema, API contract, class, thuật toán.

Phỏng vấn system design chủ yếu là HLD, sau đó interviewer chọn 1–2 component để đào sâu (deep dive).

</details>

---

## 2. Cách tiếp cận bài toán System Design

Bài học: [2. Cách tiếp cận bài toán System Design](../../system-design/01-introduction/2_how-to-approach.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bạn sẽ làm gì trong 5 phút đầu của một buổi phỏng vấn system design?**

<details className="qa">
<summary>Xem đáp án</summary>

Làm rõ requirements: hỏi tính năng chính (và loại bỏ tính năng ngoài phạm vi), quy mô (DAU, số request/user), tỉ lệ đọc/ghi, kích thước dữ liệu, yêu cầu latency/availability/consistency, traffic đỉnh. Ghi lại các giả định đã thống nhất để làm căn cứ cho các bước sau.

</details>

**2. Hệ thống có 50 triệu DAU, mỗi user 10 request/ngày. QPS trung bình và đỉnh khoảng bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

- Tổng: 50 triệu × 10 = 500 triệu request/ngày.
- QPS trung bình ≈ 5 × 10⁸ / 10⁵ ≈ **5.000 QPS** (chính xác hơn ~5.800).
- QPS đỉnh với hệ số 2–3 ≈ **10.000–15.000 QPS**.

</details>

**3. Từ bảng latency numbers, bạn rút ra những nguyên tắc thiết kế gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- RAM nhanh hơn SSD/HDD hàng nghìn lần → cache dữ liệu nóng trong bộ nhớ.
- Đọc tuần tự nhanh hơn ngẫu nhiên → thiết kế storage kiểu append-only/log.
- Round trip xuyên lục địa ~150ms → đặt dữ liệu gần user (CDN, multi-region), giảm số round trip (batch, gộp request).
- Nén dữ liệu trước khi gửi mạng thường có lợi vì CPU rẻ hơn mạng.

</details>

**4. Vì sao URL shortener chọn short code 7 ký tự base62?**

<details className="qa">
<summary>Xem đáp án</summary>

Base62 dùng `[0-9a-zA-Z]` — an toàn trong URL. 62⁶ ≈ 56.8 tỉ đã đủ cho 6 tỉ URL trong 5 năm, nhưng 62⁷ ≈ 3.5 nghìn tỉ cho dư địa tăng trưởng rất lớn và giảm xác suất trùng nếu sinh ngẫu nhiên/hash. Mỗi ký tự thêm vào nhân không gian lên 62 lần trong khi URL chỉ dài thêm 1 ký tự.

</details>

**5. Back-of-the-envelope estimation có cần chính xác không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Mục tiêu là đúng **cỡ độ lớn** (order of magnitude) để đưa ra quyết định: cần 1 hay 100 server, dữ liệu GB hay PB, bandwidth có phải vấn đề không. Làm tròn (1 ngày ≈ 10⁵ giây) là chấp nhận được, miễn là giữ đúng đơn vị và nói rõ giả định.

</details>

**6. Khi scale thiết kế, bạn tìm điểm nghẽn thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dựa trên estimation và từng tầng của luồng request: app server (CPU, số kết nối), database (QPS đọc/ghi, kích thước dữ liệu, lock), cache (hit rate, bộ nhớ), mạng (bandwidth, latency xuyên vùng), và các SPOF. Với mỗi điểm nghẽn, đề xuất kỹ thuật (LB, cache, replica, sharding, queue, CDN) kèm trade-off, rồi kiểm tra lại xem nghẽn đã dịch chuyển sang đâu.

</details>
