---
sidebar_position: 13
title: "Monitoring"
---

# Monitoring

## 28. Monitoring: các loại giám sát

Bài học: [28. Monitoring: các loại giám sát](../../system-design/13-monitoring/1_monitoring-types.md)

**1. Bốn golden signals là gì? Vì sao nên tách latency của request lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Latency, Traffic, Errors, Saturation (Google SRE). Request lỗi thường trả về rất nhanh (ví dụ fail ngay vì mất kết nối DB), nếu gộp vào sẽ kéo latency xuống, che giấu sự cố. Ngược lại một request lỗi chậm (timeout) còn tệ hơn lỗi nhanh, nên cần đo riêng.

</details>

**2. Phân biệt SLI, SLO, SLA. Error budget dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **SLI**: con số đo (tỉ lệ request thành công dưới 300ms).
- **SLO**: mục tiêu nội bộ cho SLI (99,9% trong 30 ngày).
- **SLA**: hợp đồng với khách, có bồi thường; lỏng hơn SLO.

Error budget = 100% - SLO, là lượng "lỗi được phép". Còn budget thì được release nhanh; cạn budget thì đóng băng tính năng, tập trung vào độ ổn định. Nó biến xung đột dev/ops thành quyết định dựa trên số liệu.

</details>

**3. RED và USE khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **RED** (Rate, Errors, Duration) dành cho **service xử lý request** -- nhìn từ góc độ khách gọi.
- **USE** (Utilization, Saturation, Errors) dành cho **tài nguyên** -- CPU, disk, network, connection pool.

Thường dùng cả hai: RED để phát hiện user bị ảnh hưởng, USE để tìm tài nguyên nào là nút thắt.

</details>

**4. Liveness probe và readiness probe khác nhau thế nào? Có nên kiểm tra DB trong liveness?**

<details className="qa">
<summary>Xem đáp án</summary>

Liveness fail → restart container; readiness fail → rút khỏi load balancer nhưng không restart. Không nên kiểm tra DB trong liveness: khi DB chậm, mọi pod cùng fail và bị restart đồng loạt, gây cascading failure; trong khi restart không sửa được DB. Kiểm tra DB đặt ở readiness (có timeout ngắn).

</details>

**5. Vì sao đo p99 thay vì trung bình?**

<details className="qa">
<summary>Xem đáp án</summary>

Trung bình che giấu phân phối đuôi dài. Một trang gọi nhiều API song song phải chờ API chậm nhất, nên tail latency ảnh hưởng tới phần lớn user: với 20 lời gọi, khoảng 18% lượt tải trang dính ít nhất một request thuộc nhóm 1% chậm nhất. User chậm nhất thường cũng là user có nhiều dữ liệu nhất -- khách hàng quan trọng.

</details>

**6. Hệ thống có 99,9% uptime theo health check nhưng user vẫn phàn nàn không vào được. Nguyên nhân có thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Health check đo từ bên trong, không phản ánh đường đi của user: DNS, CDN, chứng chỉ TLS, firewall, một region cụ thể, hoặc server trả 200 cho `/health` nhưng endpoint thật lỗi. Cách khắc phục: đo availability theo request tại edge, synthetic check từ nhiều vùng vào luồng nghiệp vụ thật (đăng nhập, checkout), và RUM từ client.

</details>

---

## 29. Instrumentation, Visualization & Alerts

Bài học: [29. Instrumentation, Visualization & Alerts](../../system-design/13-monitoring/2_instrumentation-alerts.md)

**1. Logs, metrics, traces khác nhau thế nào? Khi điều tra sự cố bạn dùng theo thứ tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Metrics**: số tổng hợp, rẻ, phát hiện "có vấn đề" và xu hướng.
- **Traces**: đường đi của một request qua các service, chỉ ra "chậm/lỗi ở đâu".
- **Logs**: chi tiết sự kiện, giải thích "chính xác chuyện gì".

Thứ tự điển hình: alert từ metric → dashboard xác định service/thời điểm → mở trace mẫu của request lỗi → từ trace_id tìm log chi tiết.

</details>

**2. High cardinality là gì và vì sao nguy hiểm với Prometheus?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi tổ hợp giá trị label là một time series riêng, Prometheus giữ index các series active trong RAM. Label có nhiều giá trị (user_id, request_id, URL thật, email) làm số series bùng nổ → tốn RAM, truy vấn chậm, có thể OOM. Giữ label có tập giá trị nhỏ, đưa ID cụ thể vào log hoặc trace attribute.

</details>

**3. Vì sao nên alert theo triệu chứng thay vì nguyên nhân?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân có vô số (CPU, RAM, disk, GC, DB lock...) và nhiều khi không ảnh hưởng user -- page vì chúng gây alert fatigue. Triệu chứng (lỗi, latency vi phạm SLO) ít, ổn định, và luôn đáng hành động. Metric nguyên nhân vẫn được thu thập để chẩn đoán trên dashboard, chỉ là không page.

</details>

**4. OpenTelemetry giải quyết vấn đề gì? OTel Collector để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

OTel là chuẩn mở cho API/SDK/giao thức (OTLP) của logs, metrics, traces -- instrument một lần, gửi tới bất kỳ backend nào, tránh vendor lock-in, và có chuẩn truyền ngữ cảnh (W3C traceparent) giữa nhiều ngôn ngữ. Collector là lớp trung gian: nhận, batch, lấy mẫu (kể cả tail-based), lọc dữ liệu nhạy cảm, xuất tới nhiều backend -- đổi backend không cần deploy lại app.

</details>

**5. Head-based và tail-based sampling khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Head-based quyết định ngay đầu request (ví dụ giữ 5%), rẻ và đơn giản nhưng có thể bỏ sót trace lỗi/chậm hiếm gặp. Tail-based quyết định sau khi trace hoàn tất, nên giữ được 100% trace lỗi hoặc chậm; đổi lại collector phải đệm toàn bộ span của trace và định tuyến span cùng trace về cùng một collector instance.

</details>

**6. Làm sao giảm alert fatigue cho team on-call?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ page cho alert actionable, theo SLO/triệu chứng; dùng `for:` và burn rate đa cửa sổ để lọc nhiễu; grouping/inhibition để một sự cố là một thông báo; hạ các cảnh báo không gấp xuống ticket; mỗi alert có runbook; review hàng tuần các alert ồn nhất và xoá/sửa; theo dõi số page mỗi ca trực như một metric sức khoẻ của team.

</details>
