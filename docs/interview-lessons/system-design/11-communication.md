---
sidebar_position: 11
title: "Communication"
---

# Communication

## 23. HTTP, TCP & UDP

Bài học: [23. HTTP, TCP & UDP](../../system-design/11-communication/1_http-tcp-udp.md)

**1. Khác biệt giữa TCP và UDP? Cho ví dụ khi nào dùng mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

TCP có kết nối (bắt tay 3 bước), tin cậy (ACK, gửi lại), đúng thứ tự, có flow control và congestion control -- dùng cho web, API, database, file. UDP không kết nối, không đảm bảo, header nhỏ, latency thấp, hỗ trợ broadcast/multicast -- dùng cho video/voice real-time, game, DNS, metrics, và làm nền cho QUIC.

</details>

**2. Mô tả TCP three-way handshake. Vì sao kết nối đầu tiên chậm?**

<details className="qa">
<summary>Xem đáp án</summary>

Client gửi SYN, server trả SYN-ACK, client gửi ACK -- mất 1 RTT trước khi gửi dữ liệu. Thêm TLS 1.3 tốn 1 RTT nữa (TLS 1.2 là 2). Sau đó slow start làm cwnd nhỏ lúc đầu. Giảm bằng keep-alive/connection pool, TLS session resumption, CDN gần user, HTTP/3 (gộp bắt tay, 0-RTT).

</details>

**3. HTTP/2 cải thiện gì so với HTTP/1.1? HTTP/3 giải quyết vấn đề gì còn lại?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTP/2: binary framing, multiplexing nhiều stream trên một kết nối (hết HOL ở tầng HTTP), nén header HPACK, ưu tiên stream. Vấn đề còn lại: HOL ở tầng TCP -- mất một gói chặn mọi stream. HTTP/3 dùng QUIC trên UDP: stream độc lập ở tầng transport, bắt tay gộp TLS (1 RTT, 0-RTT khi kết nối lại), connection migration khi đổi mạng.

</details>

**4. Flow control và congestion control khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Flow control bảo vệ bên nhận: receiver window cho biết bộ đệm còn bao nhiêu. Congestion control bảo vệ mạng: congestion window điều chỉnh theo tín hiệu mất gói/độ trễ (slow start, AIMD, CUBIC, BBR). Lượng dữ liệu được gửi chưa ACK là min của hai cửa sổ.

</details>

**5. Phân biệt 401 và 403, 502 và 504. Lỗi nào nên retry?**

<details className="qa">
<summary>Xem đáp án</summary>

401: chưa xác thực hoặc token không hợp lệ. 403: đã xác thực nhưng không có quyền. 502: gateway nhận response không hợp lệ từ upstream. 504: gateway chờ upstream quá thời gian. Nên retry (có backoff, giới hạn) với 429, 502, 503, 504 và lỗi mạng tạm thời, chỉ khi thao tác idempotent hoặc có idempotency key. Không retry 400, 401, 403, 404, 422.

</details>

**6. Vì sao DNS dùng UDP? Khi nào DNS dùng TCP?**

<details className="qa">
<summary>Xem đáp án</summary>

Truy vấn và trả lời DNS thường nhỏ, vừa một gói; UDP tránh được RTT bắt tay, giảm tải cho server phục vụ lượng truy vấn khổng lồ; mất thì client tự gửi lại sau timeout. DNS dùng TCP khi response quá lớn (bị truncate, cờ TC), khi zone transfer giữa các name server, và với DNS over TLS/HTTPS.

</details>

---

## 24. RPC & REST

Bài học: [24. RPC & REST](../../system-design/11-communication/2_rpc-rest.md)

**1. RPC và REST khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

RPC xoay quanh hành động (gọi hàm từ xa), thường dùng IDL + codegen, binary, chủ yếu POST hoặc giao thức riêng; hiệu năng cao, coupling chặt, hợp nội bộ. REST xoay quanh resource, dùng method HTTP theo ngữ nghĩa, status code, cache HTTP, stateless; coupling lỏng, dễ debug, hợp public API. Nhiều hệ thống dùng REST ở biên và gRPC bên trong.

</details>

**2. Nêu các ràng buộc của REST. Stateless có nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Client-server, stateless, cacheable, uniform interface (định danh resource, thao tác qua representation, message tự mô tả, HATEOAS), layered system, code on demand (tuỳ chọn). Stateless: mỗi request mang đủ thông tin để xử lý (token, tham số), server không giữ session giữa các request -- nhờ vậy request nào cũng có thể vào server nào, dễ scale ngang và retry.

</details>

**3. Thiết kế API REST cho tính năng huỷ đơn hàng và chuyển tiền.**

<details className="qa">
<summary>Xem đáp án</summary>

Danh từ hoá hành động: `POST /orders/42/cancellation` (trả 201, hoặc 409 nếu đã giao, 404 nếu không tồn tại) và `POST /transfers` với body chứa tài khoản nguồn, đích, số tiền, kèm `Idempotency-Key`. Transfer là resource có trạng thái (`pending`, `completed`, `failed`) truy vấn qua `GET /transfers/{id}`. Cách khác: custom method `POST /orders/42:cancel`.

</details>

**4. Offset pagination và cursor pagination khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Offset (`limit`, `offset`): đơn giản, nhảy trang được, nhưng DB phải quét và bỏ qua offset dòng (chậm khi offset lớn) và kết quả lệch khi có bản ghi mới chèn vào. Cursor/keyset: dùng giá trị của bản ghi cuối (ví dụ `created_at`, `id`) làm điểm bắt đầu, truy vấn qua index nên nhanh ổn định, không lệch; nhược điểm là không nhảy thẳng tới trang N. Feed vô tận và API lớn nên dùng cursor.

</details>

**5. Khi nào bạn chọn RPC thay vì REST?**

<details className="qa">
<summary>Xem đáp án</summary>

Giao tiếp service-to-service nội bộ với lưu lượng lớn và yêu cầu latency thấp; cần hợp đồng chặt và codegen cho nhiều ngôn ngữ; cần streaming; thao tác chủ yếu là hành động nghiệp vụ hơn là CRUD. Ngược lại, API public, client đa dạng, cần cache HTTP và dễ tiếp cận thì REST.

</details>

**6. Làm sao versioning API mà không làm vỡ client cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu tiên thay đổi tương thích ngược: thêm field optional, thêm endpoint mới, không đổi nghĩa field cũ. Khi buộc phải phá vỡ: version trong URL (`/v2`), header media type, hoặc version theo ngày như Stripe (mỗi tài khoản ghim một version, server chuyển đổi response). Thông báo deprecation (header `Deprecation`, `Sunset`), theo dõi client còn dùng bản cũ trước khi gỡ.

</details>

---

## 25. gRPC & GraphQL

Bài học: [25. gRPC & GraphQL](../../system-design/11-communication/3_grpc-graphql.md)

**1. gRPC nhanh hơn REST+JSON nhờ đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Protobuf nhị phân (nhỏ, không lặp tên field, parse nhanh bằng code sinh sẵn); HTTP/2 multiplexing nhiều lời gọi trên một kết nối lâu dài, nén header; codegen loại bỏ mapping thủ công. Thêm streaming và deadline propagation giúp xây hệ phân tán hiệu quả. Đổi lại: khó debug, trình duyệt cần gRPC-Web, cần L7 load balancing.

</details>

**2. Bốn kiểu RPC của gRPC là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Unary (lấy một đơn hàng), server streaming (theo dõi trạng thái đơn, tải danh sách lớn), client streaming (upload file theo chunk, import hàng loạt), bidirectional streaming (chat, đồng bộ vị trí tài xế). Streaming dựa trên HTTP/2 stream nên có flow control sẵn.

</details>

**3. N+1 problem trong GraphQL là gì và giải quyết thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Resolver chạy theo từng object: 1 query lấy N post rồi N query lấy author cho từng post. Giải quyết bằng DataLoader: gom các `load(id)` trong cùng tick thành một truy vấn `WHERE id IN (...)`, và cache theo request. Ngoài ra có thể dùng join/lookahead (phân tích query để join trước) cho trường hợp đặc biệt.

</details>

**4. GraphQL khác REST thế nào? Khi nào không nên dùng GraphQL?**

<details className="qa">
<summary>Xem đáp án</summary>

GraphQL có một endpoint, schema có kiểu, client chọn đúng field, lấy dữ liệu lồng nhau trong một round-trip, không cần versioning. REST nhiều endpoint theo resource, tận dụng cache HTTP, đơn giản. Không nên dùng GraphQL cho API CRUD đơn giản, khi cần cache CDN mạnh, upload file lớn, hoặc team chưa sẵn sàng với N+1, cost limit, phân quyền theo field.

</details>

**5. Làm sao bảo vệ GraphQL server khỏi query độc hại?**

<details className="qa">
<summary>Xem đáp án</summary>

Giới hạn depth; tính cost/complexity theo số node dự kiến và từ chối query vượt ngưỡng; rate limit theo cost thay vì theo request; timeout thực thi; persisted queries (chỉ chấp nhận query đã đăng ký); tắt introspection ở production nếu là API nội bộ; giới hạn `first`/`limit` tối đa cho danh sách.

</details>

**6. Làm sao tiến hoá schema protobuf mà không làm vỡ client?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ thêm field mới với số mới; không đổi số hay kiểu của field cũ; khi xoá thì `reserved` cả số và tên; enum luôn có giá trị 0 UNSPECIFIED và chỉ thêm giá trị mới. Client cũ bỏ qua field lạ, client mới nhận giá trị mặc định cho field thiếu. Kiểm tra tự động bằng `buf breaking` trong CI; thay đổi phá vỡ thì tạo package version mới (`v2`).

</details>
