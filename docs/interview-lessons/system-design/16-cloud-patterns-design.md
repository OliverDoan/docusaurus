---
sidebar_position: 16
title: "Cloud Patterns: Design & Implementation"
---

# Cloud Patterns: Design & Implementation

## 36. Gateway Routing, Offloading, Aggregation & BFF

Bài học: [36. Gateway Routing, Offloading, Aggregation & BFF](../../system-design/16-cloud-patterns-design/1_gateway-patterns-bff.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt Gateway Routing, Offloading và Aggregation.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Routing:** một endpoint, gateway định tuyến theo path/host/header tới service hoặc phiên bản phù hợp.
- **Offloading:** gateway gánh việc cắt ngang (TLS, auth, rate limit, logging) để service không phải tự làm.
- **Aggregation:** một request client → gateway gọi song song nhiều service rồi gộp kết quả, giảm round-trip.

Một sản phẩm API Gateway thường làm cả ba.

</details>

**2. BFF là gì? Khi nào nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Backend riêng cho từng loại trải nghiệm frontend (web, mobile, đối tác), do team frontend sở hữu, chuyên gộp và định dạng dữ liệu cho client đó. Dùng khi các client có nhu cầu dữ liệu, xác thực, nhịp phát hành khác nhau rõ rệt. Không dùng khi chỉ có một frontend hoặc các client gần giống nhau.

</details>

**3. API Gateway khác load balancer và service mesh thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Load balancer chủ yếu phân phối traffic tới các instance giống nhau (L4/L7). API Gateway là điểm vào cho traffic **bắc-nam** (client → hệ thống), có routing theo API, auth, rate limit, aggregation, quản lý API key. Service mesh (Istio, Linkerd) quản lý traffic **đông-tây** (service ↔ service) bằng sidecar: mTLS, retry, circuit breaker, telemetry.

</details>

**4. Gateway Aggregation có rủi ro gì? Giảm thiểu thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Gateway thành nút cổ chai và điểm lỗi; một service chậm kéo chậm cả response; dễ bị nhồi logic. Giảm thiểu: gọi song song, timeout từng call, circuit breaker, degrade phần tuỳ chọn, scale ngang gateway, giữ aggregation mỏng.

</details>

**5. Gateway đã xác thực JWT, service phía sau có cần xác thực lại không?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo zero trust thì service vẫn cần đảm bảo request đến từ nguồn tin cậy: mTLS giữa gateway và service, network policy chỉ cho gateway gọi vào, hoặc gateway chuyển token xuống để service tự verify (chi phí thấp vì chỉ kiểm tra chữ ký). Phân quyền theo nghiệp vụ (authorization chi tiết) luôn nằm ở service.

</details>

---

## 37. Sidecar, Ambassador, Anti-corruption Layer & Strangler Fig

Bài học: [37. Sidecar, Ambassador, Anti-corruption Layer & Strangler Fig](../../system-design/16-cloud-patterns-design/2_sidecar-ambassador-acl-strangler.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sidecar pattern là gì? Ưu nhược điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

Thành phần phụ chạy cùng đơn vị triển khai với app (cùng Pod), chia sẻ network/volume, cùng vòng đời. Ưu: độc lập ngôn ngữ, tách trách nhiệm, nâng cấp hạ tầng không cần sửa app, dùng được cho legacy. Nhược: tốn tài nguyên trên mỗi instance, thêm độ trễ, phức tạp vòng đời (thứ tự khởi động/tắt), khó debug hơn.

</details>

**2. Ambassador khác Sidecar thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ambassador là một dạng sidecar chuyên làm **proxy outbound**: app gọi localhost, ambassador lo service discovery, retry, timeout, circuit breaker, mTLS khi gọi ra ngoài. Sidecar là khái niệm rộng hơn, gồm cả log agent, config watcher, proxy inbound.

</details>

**3. Anti-corruption Layer dùng để làm gì? Đặt ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Lớp phiên dịch giữa bounded context mới và hệ thống cũ/bên ngoài, chuyển đổi giao thức và model hai chiều, giữ domain mới không bị lây khái niệm legacy. Có thể là module adapter trong service hoặc service riêng đứng giữa. Là nơi duy nhất biết chi tiết legacy.

</details>

**4. Bạn sẽ chuyển một monolith sang microservice thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Strangler Fig: đặt facade trước monolith; xác định bounded context; chọn phần ít phụ thuộc/giá trị cao để tách trước; xây service mới, gọi ngược monolith qua ACL khi cần; chuyển route dần (canary theo tỷ lệ), giám sát, sẵn sàng rollback; tách dữ liệu bằng CDC/sync rồi chuyển ownership; tính năng mới chỉ làm ở hệ thống mới; lặp tới khi tắt monolith.

</details>

**5. Vì sao service mesh đang hướng tới "sidecarless"?**

<details className="qa">
<summary>Xem đáp án</summary>

Sidecar proxy ở mỗi pod tốn RAM/CPU nhân theo số pod, thêm độ trễ, phức tạp khi nâng cấp (phải restart pod để đổi phiên bản proxy). Các hướng như Istio ambient mode (proxy theo node cho L4, waypoint proxy cho L7) hoặc eBPF giảm chi phí đó, đổi lại cô lập kém hơn ở mức pod.

</details>

---

## 38. Leader Election, External Config Store, Compute Resource Consolidation

Bài học: [38. Leader Election, External Config Store, Compute Resource Consolidation](../../system-design/16-cloud-patterns-design/3_leader-election-config-consolidation.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Thiết kế cron job chỉ chạy một lần trong cụm 10 instance?**

<details className="qa">
<summary>Xem đáp án</summary>

Lựa chọn: (1) Leader election qua etcd/Kubernetes Lease/Redis, chỉ leader chạy cron; (2) đơn giản hơn: scheduler tập trung (Kubernetes CronJob `concurrencyPolicy: Forbid`) đẩy job vào queue, một worker nhận; (3) lock theo từng lần chạy (`job:2026-10-01T08:00`) bằng `SET NX` hoặc bảng DB có unique constraint. Kèm theo: tác vụ idempotent để chạy trùng không gây hại.

</details>

**2. Fencing token là gì, vì sao lease thôi chưa đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

Lease có thể hết hạn mà leader cũ không biết (GC pause, mạng chậm), leader cũ tiếp tục ghi trong khi leader mới đã lên → hai bên cùng ghi. Fencing token là số tăng đơn điệu cấp mỗi lần có leader mới; mọi thao tác ghi kèm token, tài nguyên đích từ chối token nhỏ hơn token lớn nhất đã thấy. Điều kiện: tài nguyên đích phải hỗ trợ kiểm tra token.

</details>

**3. So sánh Redis lock và etcd/ZooKeeper cho leader election.**

<details className="qa">
<summary>Xem đáp án</summary>

Redis `SET NX PX`: nhanh, dễ dùng, nhưng một node hoặc replication bất đồng bộ có thể mất lock khi failover; không có fencing token sẵn → phù hợp khi chỉ cần tránh trùng cho hiệu quả. etcd/ZooKeeper: đồng thuận Raft/ZAB theo quorum, nhất quán mạnh, có revision/zxid làm fencing token, có watch để biết leader thay đổi → phù hợp khi tính đúng quan trọng; đổi lại vận hành phức tạp hơn và chậm hơn.

</details>

**4. External Config Store khác Secret Manager thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Config store cho cấu hình không nhạy cảm (timeout, URL, feature flag), ưu tiên version, rollout, reload nhanh. Secret manager cho thông tin nhạy cảm (mật khẩu, key), có mã hoá khi lưu, kiểm soát truy cập chi tiết, audit, xoay vòng (rotation) tự động. Nhiều hệ thống để config tham chiếu tới secret thay vì chứa giá trị secret.

</details>

**5. Khi nào nên gộp nhiều tác vụ vào chung một đơn vị tính toán?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi các tác vụ nhỏ, dùng ít tài nguyên, đặc tính tài nguyên bổ sung nhau, vòng đời/deploy/scale tương tự, cùng ranh giới bảo mật và mức độ quan trọng. Không gộp khi cần cô lập lỗi, bảo mật, hoặc yêu cầu scale khác nhau. Đặt giới hạn tài nguyên để tránh noisy neighbor.

</details>
