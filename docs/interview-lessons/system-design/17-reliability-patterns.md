---
sidebar_position: 17
title: "Reliability Patterns"
---

# Reliability Patterns

## 39. Reliability: Availability & High Availability

Bài học: [39. Reliability: Availability & High Availability](../../system-design/17-reliability-patterns/1_availability-patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. 99.99% availability nghĩa là bao nhiêu downtime? Hệ thống gồm 3 thành phần nối tiếp 99.9% thì availability tổng là bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

99.99% khoảng 52.6 phút/năm, khoảng 4.3 phút/tháng. Ba thành phần nối tiếp 99.9%: 0.999³ ≈ 99.7%, khoảng 26 giờ downtime/năm. Muốn tăng thì đặt song song (dư thừa) cho từng thành phần hoặc giảm số phụ thuộc đồng bộ.

</details>

**2. Liveness và readiness probe khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Liveness hỏi "process có treo không" — fail thì restart; phải nhẹ, không phụ thuộc bên ngoài. Readiness hỏi "có nhận traffic được không" — fail thì gỡ khỏi load balancer nhưng không restart; có thể kiểm tra phụ thuộc thiết yếu. Trộn hai cái (liveness kiểm tra DB) gây restart dây chuyền khi DB chậm.

</details>

**3. Deployment Stamps khác Geodes thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Stamps: nhiều bản sao độc lập của hệ thống, mỗi stamp giữ dữ liệu riêng của một nhóm tenant/vùng, định tuyến theo tenant — mục tiêu chính là scale và giới hạn blast radius. Geodes: nhiều node phân tán địa lý, dữ liệu replicate toàn cầu, node nào cũng phục vụ được mọi user — mục tiêu là độ trễ thấp và chịu mất cả region; đổi lại phức tạp về nhất quán dữ liệu.

</details>

**4. Thiết kế rate limiter cho API công khai chạy trên nhiều instance?**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn thuật toán (token bucket cho phép burst, sliding window cho chính xác), khoá theo API key/user/IP và endpoint. Lưu trạng thái trong Redis, cập nhật nguyên tử bằng Lua (hoặc dùng rate limit của gateway). Trả `429` + `Retry-After` + header remaining. Xử lý khi Redis lỗi (fail-open hay fail-closed tuỳ mức rủi ro). Có hạn mức theo gói dịch vụ, giám sát tỷ lệ bị chặn.

</details>

**5. Throttling khác Queue-Based Load Leveling thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Throttling **từ chối hoặc giảm chất lượng** phần tải vượt ngưỡng — phù hợp request đồng bộ, bảo vệ hệ thống và công bằng giữa client. Queue-Based Load Leveling **hoãn** phần tải vượt bằng hàng đợi rồi xử lý dần — không mất request nhưng tăng độ trễ, phù hợp tác vụ bất đồng bộ. Thường dùng kết hợp.

</details>

---

## 40. Reliability: Resiliency Patterns

Bài học: [40. Reliability: Resiliency Patterns](../../system-design/17-reliability-patterns/2_resiliency-patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao cần jitter trong exponential backoff?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có jitter, các client cùng gặp lỗi tại một thời điểm sẽ retry đồng loạt tại cùng các mốc (100ms, 200ms, 400ms...) → tạo các đợt tải đỉnh dồn dập lên service vừa hồi phục (thundering herd). Jitter rải thời điểm retry ngẫu nhiên, làm phẳng tải. Full jitter: `random(0, min(cap, base × 2^attempt))`.

</details>

**2. Mô tả các trạng thái của circuit breaker.**

<details className="qa">
<summary>Xem đáp án</summary>

Closed: request đi qua, đếm lỗi. Lỗi vượt ngưỡng → Open: từ chối ngay (fail fast) hoặc fallback, cho phụ thuộc thời gian hồi phục. Hết thời gian chờ → Half-Open: cho vài request thử; thành công → Closed, thất bại → Open lại.

</details>

**3. Retry và Circuit Breaker khác nhau và phối hợp thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Retry giả định lỗi sẽ sớm hết và thử lại; circuit breaker giả định lỗi kéo dài và ngừng thử. Phối hợp: retry vài lần có backoff cho lỗi transient; các lần thất bại được breaker đếm; khi breaker mở thì retry không gọi nữa mà fail fast/fallback. Retry nên nhận biết lỗi `CircuitOpenError` để không retry.

</details>

**4. Bulkhead là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Cô lập tài nguyên theo nhóm để lỗi một nhóm không lan sang nhóm khác. Ví dụ: connection pool riêng cho từng service phụ thuộc — service gợi ý chậm chỉ làm cạn pool của nó, thanh toán vẫn chạy; hoặc cụm instance riêng cho khách hàng lớn để tránh noisy neighbor.

</details>

**5. Làm sao đảm bảo nhất quán khi đặt hàng cần trừ kho, trừ tiền, tạo vận đơn ở 3 service khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Saga: mỗi bước là transaction cục bộ + compensating action (hoàn kho, hoàn tiền, huỷ vận đơn). Orchestrator lưu trạng thái bền, gọi các bước; lỗi thì chạy bù trừ theo thứ tự ngược, compensate idempotent và được retry. Dùng outbox để ghi DB và phát event nguyên tử, idempotency key cho mỗi bước, trạng thái `PENDING` cho dữ liệu trung gian. Chấp nhận eventual consistency.

</details>

**6. Scheduler Agent Supervisor giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Điều phối quy trình nhiều bước qua tài nguyên từ xa một cách tin cậy: scheduler chạy các bước và lưu trạng thái, agent bọc lời gọi từng tài nguyên, supervisor định kỳ phát hiện bước treo/thất bại để thử lại hoặc kích hoạt bù trừ. Giúp quy trình phục hồi được sau lỗi tạm thời hoặc crash.

</details>

---

## 41. Reliability: Security Patterns

Bài học: [41. Reliability: Security Patterns](../../system-design/17-reliability-patterns/3_security-patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. OAuth 2.0 và OpenID Connect khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

OAuth 2.0 là giao thức **uỷ quyền**: cho ứng dụng access token để truy cập tài nguyên thay người dùng, không định nghĩa cách biết người dùng là ai. OIDC là lớp **xác thực** xây trên OAuth 2.0: thêm ID token (JWT) chứa danh tính người dùng, scope `openid`, endpoint userinfo, discovery. Dùng access token của OAuth làm bằng chứng đăng nhập là sai lầm.

</details>

**2. Mô tả Authorization Code Flow với PKCE. Vì sao cần `state` và `nonce`?**

<details className="qa">
<summary>Xem đáp án</summary>

App sinh `code_verifier` ngẫu nhiên, gửi `code_challenge` (hash của verifier) khi redirect tới IdP. Người dùng đăng nhập ở IdP, IdP redirect về kèm `code`. App đổi `code` + `code_verifier` lấy token — kẻ đánh cắp `code` không có verifier nên không đổi được. `state` chống CSRF trên callback (đảm bảo phản hồi thuộc phiên đăng nhập do app khởi tạo). `nonce` gắn ID token với phiên đó, chống replay token.

</details>

**3. Khi nào chọn SAML, khi nào chọn OIDC?**

<details className="qa">
<summary>Xem đáp án</summary>

OIDC cho ứng dụng mới, SPA, mobile, API — JSON/JWT đơn giản, hỗ trợ tốt. SAML khi phải tích hợp SSO doanh nghiệp mà khách hàng/IdP chỉ hỗ trợ SAML, hoặc ứng dụng web truyền thống trong hệ sinh thái doanh nghiệp. Nhiều IdP (Entra ID, Okta, Keycloak) hỗ trợ cả hai.

</details>

**4. Gatekeeper pattern khác API Gateway thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

API Gateway tập trung vào routing, offloading, aggregation cho nhiều service. Gatekeeper tập trung vào **bảo mật**: một lớp trung gian tách biệt, quyền tối thiểu, validate/sanitize request và **không giữ bí mật**, để nếu bị chiếm thì kẻ tấn công vẫn không chạm được dữ liệu. Một API Gateway/WAF có thể đóng vai gatekeeper nếu thoả các điều kiện đó và backend bị cô lập.

</details>

**5. Ứng dụng nhận được JWT, cần kiểm tra những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chữ ký hợp lệ với public key của issuer (qua JWKS, đúng `kid`); thuật toán thuộc danh sách cho phép; `iss` đúng issuer tin cậy; `aud` chứa client_id/API của mình; `exp` chưa hết hạn, `nbf`/`iat` hợp lý (chấp nhận lệch đồng hồ nhỏ); với ID token kiểm tra `nonce`; sau đó mới đọc claims để phân quyền.

</details>
