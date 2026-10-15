---
sidebar_position: 7
title: "Application Layer"
---

# Application Layer

## 13. Application Layer & Microservices

Bài học: [13. Application Layer & Microservices](../../system-design/07-application-layer/1_application-layer-microservices.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao nên tách web layer khỏi application layer?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai tầng có đặc tính tải khác nhau: web layer xử lý nhiều kết nối, TLS, static, routing (I/O-bound); app layer xử lý nghiệp vụ. Tách ra cho phép **scale độc lập**, chỉ lộ web layer ra Internet (**bảo mật**), gom TLS/nén/rate limit/CORS về một chỗ, và thêm API/app server mới mà không đụng tới web server.

</details>

**2. Microservices là gì? Đặc điểm của một service "đúng nghĩa"?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiến trúc chia ứng dụng thành các service nhỏ, mỗi service: xây quanh một năng lực nghiệp vụ (bounded context), chạy process riêng, **deploy độc lập**, **sở hữu dữ liệu riêng**, giao tiếp qua API/message, do một đội sở hữu. Nếu các service phải deploy cùng nhau hoặc dùng chung DB thì đó là distributed monolith, không phải microservices.

</details>

**3. So sánh monolith và microservices. Bạn sẽ chọn gì cho một startup 5 người?**

<details className="qa">
<summary>Xem đáp án</summary>

Monolith: đơn giản, gọi hàm nhanh, ACID dễ, debug dễ, nhưng scale cả khối và các đội dẫm chân nhau khi lớn. Microservices: đội độc lập, scale từng phần, cô lập lỗi, nhưng phải trả giá của hệ phân tán (latency, lỗi một phần, saga, tracing, vận hành). Với startup 5 người: **modular monolith** — tốc độ phát triển cao, ranh giới module rõ để sau này tách khi có lý do cụ thể.

</details>

**4. Làm sao xử lý giao dịch trải qua nhiều service (vd đặt hàng: giữ kho, thu tiền, tạo đơn)?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng 2PC (two-phase commit) vì khoá tài nguyên lâu và kém sẵn sàng. Dùng **Saga**: chuỗi transaction cục bộ, mỗi bước có hành động bù trừ khi bước sau thất bại (nhả hàng, hoàn tiền). Hai kiểu: **choreography** (các service phản ứng với event của nhau) và **orchestration** (một orchestrator điều phối). Kết hợp **Transactional Outbox** để ghi DB và phát event nhất quán, và consumer idempotent.

</details>

**5. Bạn sẽ tách một monolith lớn thành microservices như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Xác định bounded context, làm rõ ranh giới module **ngay trong monolith** trước.
- Dựng nền tảng: CI/CD, container, observability, API gateway.
- Áp dụng **Strangler Fig**: đặt proxy trước monolith, tách từng context ít phụ thuộc (Notification, Search...), chuyển route dần.
- Tách dữ liệu: service mới sở hữu bảng của mình, đồng bộ dữ liệu trong giai đoạn chuyển tiếp (CDC/event).
- Đo lường và lặp lại; không tách mọi thứ cùng lúc.

</details>

**6. Distributed monolith là gì và dấu hiệu nhận biết?**

<details className="qa">
<summary>Xem đáp án</summary>

Là hệ thống chia thành nhiều service nhưng vẫn **coupling chặt** như monolith: phải deploy nhiều service cùng lúc cho một thay đổi, dùng chung database, chuỗi gọi đồng bộ dài, một service chết kéo sập tất cả, thay đổi API phải phối hợp mọi đội. Nhận đủ nhược điểm của phân tán mà không có lợi ích độc lập. Khắc phục: vẽ lại ranh giới theo nghiệp vụ, tách dữ liệu, chuyển sang giao tiếp bất đồng bộ, versioning API.

</details>

---

## 14. Service Discovery

Bài học: [14. Service Discovery](../../system-design/07-application-layer/2_service-discovery.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Service discovery giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong môi trường cloud/container, instance được tạo, huỷ, di chuyển liên tục nên IP/port không cố định. Service discovery cho phép service gọi nhau bằng **tên logic**, còn registry giữ danh sách instance **khoẻ** hiện tại (đăng ký khi khởi động, gỡ khi tắt hoặc health check thất bại). Nhờ vậy autoscale, deploy, failover không cần sửa cấu hình.

</details>

**2. So sánh client-side và server-side discovery.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Client-side:** client hỏi registry, tự chọn instance và gọi thẳng. Ít hop, LB linh hoạt; nhưng mỗi ngôn ngữ cần thư viện, client coupling với registry. Ví dụ Eureka + Ribbon.
- **Server-side:** client gọi LB/router có địa chỉ cố định; LB hỏi registry và chuyển tiếp. Client đơn giản, độc lập ngôn ngữ; nhưng thêm hop và LB phải HA. Ví dụ AWS ALB, Kubernetes Service.
- **Service mesh:** sidecar làm discovery + LB phía client nhưng trong suốt với code.

</details>

**3. Kubernetes làm service discovery như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Service` chọn pod theo label selector; control plane duy trì **EndpointSlice** chứa IP các pod đang Ready (dựa trên readiness probe), lưu trong etcd. **CoreDNS** phân giải `svc.ns.svc.cluster.local` ra ClusterIP; **kube-proxy** (iptables/IPVS) hoặc eBPF chuyển traffic từ ClusterIP tới pod khoẻ. Headless service trả thẳng IP các pod cho client-side discovery hoặc StatefulSet.

</details>

**4. Service registry nên là CP hay AP? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Lập luận AP (Eureka): với discovery, trả danh sách **hơi cũ** vẫn tốt hơn không trả gì — client gọi nhầm instance chết thì retry sang instance khác. CP (etcd, ZooKeeper, Consul) đảm bảo dữ liệu nhất quán nhưng khi mất quorum có thể không ghi được. Thực tế cả hai đều dùng được nếu client **cache** danh sách và có retry; quan trọng là hệ thống không sập khi registry gặp sự cố.

</details>

**5. Tại sao gRPC chạy trên Kubernetes Service thường bị lệch tải và cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

gRPC dùng HTTP/2 với **một kết nối dài** chứa nhiều request. kube-proxy cân bằng ở L4 **theo kết nối**, nên mọi request của một client đi vào cùng một pod. Khắc phục: dùng **headless service** để client nhận danh sách IP pod và gRPC client tự load balance (round robin) theo request; hoặc dùng **service mesh** / L7 proxy (Envoy, Linkerd) cân bằng theo request; hoặc giới hạn tuổi kết nối để client định kỳ kết nối lại.

</details>

**6. Health check trong service discovery hoạt động thế nào? Liveness khác readiness ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế: heartbeat/TTL (instance tự báo), active check (registry/agent gọi `/healthz`, TCP, gRPC), hoặc session/ephemeral node (ZooKeeper). Instance fail bị gỡ khỏi danh sách.

- **Liveness:** process còn hoạt động không — fail thì **restart**.
- **Readiness:** đã sẵn sàng nhận traffic chưa (đang warm-up, mất kết nối DB) — fail thì **gỡ khỏi danh sách** nhưng không restart.

Gộp hai loại làm một dễ gây restart vòng lặp hoặc nhận traffic khi chưa sẵn sàng.

</details>
