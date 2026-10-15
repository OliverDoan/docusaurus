---
sidebar_position: 6
title: "Load Balancing"
---

# Load Balancing

## 11. Load Balancers

Bài học: [11. Load Balancers](../../system-design/06-load-balancing/1_load-balancers.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Load balancer khác reverse proxy thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Reverse proxy đứng trước server để làm "mặt tiền": TLS, cache, nén, bảo mật, rewrite — hữu ích ngay cả với một server. Load balancer là chức năng phân phối request cho **nhiều** server và loại server hỏng. Hai khái niệm chồng lấn: nginx/HAProxy/Envoy là reverse proxy, và trở thành load balancer khi có nhiều backend trong upstream.

</details>

**2. So sánh Layer 4 và Layer 7 load balancing.**

<details className="qa">
<summary>Xem đáp án</summary>

- **L4:** dựa vào IP/port, không đọc nội dung; rất nhanh, hỗ trợ mọi giao thức TCP/UDP, có thể TLS passthrough; không định tuyến theo URL, không sticky theo cookie.
- **L7:** đọc HTTP; định tuyến theo path/host/header/cookie, retry, canary, rate limit, sửa header; tốn CPU hơn, latency cao hơn chút.

Hệ thống lớn thường dùng L4 phía ngoài (chịu số kết nối khổng lồ) và L7 phía trong (định tuyến thông minh).

</details>

**3. Khi nào dùng least connections thay vì round robin?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi thời gian xử lý request **chênh lệch lớn** (có request vài ms, có request vài giây) hoặc có **kết nối dài** (WebSocket, streaming). Round robin chia đều số request nhưng không đều về tải thực, nên server xui nhận nhiều request nặng sẽ quá tải. Least connections (hoặc P2C) cân theo số kết nối đang hoạt động, phản ánh tải tốt hơn.

</details>

**4. Consistent hashing là gì và tại sao tốt hơn `hash mod N`?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `hash(key) mod N`, khi N đổi (thêm/bớt server) gần như mọi key đổi server → cache miss hàng loạt. Consistent hashing đặt server và key trên một vòng hash; key thuộc server gần nhất theo chiều kim đồng hồ. Thêm/bớt một server chỉ dịch chuyển khoảng **1/N** key. Dùng virtual node để phân bố đều. Ứng dụng: cụm cache, sharding, định tuyến theo userId.

</details>

**5. Làm sao tránh load balancer trở thành single point of failure?**

<details className="qa">
<summary>Xem đáp án</summary>

- Chạy **cặp active–passive** với virtual IP qua VRRP/keepalived.
- Chạy **active–active** nhiều LB, phía trước là DNS nhiều record hoặc Anycast/ECMP.
- Dùng **managed LB** của cloud (đã HA, trải nhiều AZ).
- Kết hợp DNS failover giữa các region cho mức sự cố lớn hơn.

</details>

**6. Sticky session là gì? Có nên dùng không?**

<details className="qa">
<summary>Xem đáp án</summary>

Sticky session (session affinity) giữ mọi request của một user tới cùng backend, qua cookie (L7) hoặc IP hash. Hữu ích cho app legacy lưu session trong bộ nhớ, hoặc để tận dụng cache cục bộ. Nhược điểm: tải lệch, server chết là mất phiên, scale/deploy khó. Nên ưu tiên **server stateless** + session lưu ở Redis/DB/JWT, chỉ dùng sticky khi thật sự cần.

</details>

---

## 12. Horizontal Scaling

Bài học: [12. Horizontal Scaling](../../system-design/06-load-balancing/2_horizontal-scaling.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh vertical scaling và horizontal scaling.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Vertical:** nâng cấp một máy. Đơn giản, không đổi code, nhưng có trần phần cứng, giá tăng nhanh ở cấu hình cao, là single point of failure, thường cần downtime.
- **Horizontal:** thêm máy sau load balancer. Gần như không trần, chịu lỗi tốt, co giãn theo tải; nhưng yêu cầu stateless, thêm LB, discovery, quản lý phân tán, và đẩy nút thắt xuống tầng dữ liệu.

Thực tế dùng cả hai: tầng app scale out, DB chính thường scale up kết hợp replica.

</details>

**2. Vì sao server cần stateless để scale ngang? Làm thế nào để stateless?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì load balancer có thể gửi request bất kỳ tới instance bất kỳ, và instance có thể bị thêm/bớt/chết bất cứ lúc nào. Nếu state nằm cục bộ, request rơi vào instance khác sẽ không thấy state đó. Cách làm: session → Redis/DB hoặc JWT; file → object storage; cache dùng chung → Redis; cron → scheduler riêng; WebSocket → pub/sub giữa instance; cấu hình → biến môi trường.

</details>

**3. Session ở Redis và JWT — chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Redis session:** dễ thu hồi (logout, khoá tài khoản tức thì), cookie nhỏ; đổi lại mỗi request gọi Redis và Redis phải HA.
- **JWT:** không cần store, verify cục bộ, hợp với nhiều service; nhưng khó thu hồi trước hạn, token lớn hơn.

Phổ biến: JWT access token ngắn hạn + refresh token lưu server-side để thu hồi được.

</details>

**4. Thiết kế auto-scaling cho một API có đỉnh vào 8h sáng và một đợt flash sale đã biết trước.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Target tracking** theo CPU ~60% hoặc RPS mỗi instance cho tải thường.
- **Scheduled scaling** tăng min trước 8h sáng và trước flash sale (pre-warm) vì instance mới cần thời gian khởi động.
- `min` ≥ 3 trải nhiều AZ; `max` tính theo giới hạn DB và ngân sách.
- Cooldown/stabilization window để tránh dao động; scale in chậm hơn scale out.
- Readiness probe + connection draining để thêm/bớt không lỗi request.
- Kiểm tra tầng dưới: connection pooler cho DB, cache cho dữ liệu nóng, load test trước sự kiện.

</details>

**5. Sau khi scale app từ 5 lên 50 instance, hệ thống lại chậm hơn. Nguyên nhân có thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **DB quá tải kết nối** (50 × pool size vượt `max_connections`) hoặc quá tải truy vấn.
- **Cache/Redis** hoặc dịch vụ phụ thuộc bị dồn tải, hoặc rate limit của API bên thứ ba.
- **Lock contention** trên cùng một hàng/bảng DB.
- **Cache cục bộ** bị chia nhỏ → hit ratio mỗi instance giảm.
- **LB** hoặc NAT gateway chạm giới hạn.

Hướng xử lý: connection pooler, cache, read replica, xem lại truy vấn nóng, đo p99 từng tầng bằng tracing.

</details>
