---
sidebar_position: 21
title: "Realtime"
---

# Realtime

## 1. Realtime: WebSocket, Socket.IO & WebRTC

Bài học: [1. Realtime: WebSocket, Socket.IO & WebRTC](../../react-native/21-realtime/1_realtime.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. WebSocket khác `fetch`/REST API ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

REST/`fetch` là mô hình request-response: client hỏi, server trả lời, xong thì đóng. WebSocket mở **1 kết nối liên tục, 2 chiều** -- cả client và server đều có thể gửi dữ liệu bất kỳ lúc nào mà không cần request mới. Phù hợp cho dữ liệu server cần đẩy chủ động (chat, notification, live update).

</details>

**2. Vì sao WebSocket cần thêm cơ chế heartbeat?**

<details className="qa">
<summary>Xem đáp án</summary>

WebSocket không có cơ chế "hỏi thăm còn sống" ở tầng ứng dụng. Hạ tầng mạng di động (proxy, NAT) có thể âm thầm đóng kết nối im lặng lâu mà không báo lỗi cho cả hai phía. Heartbeat (ping/pong định kỳ) giúp phát hiện sớm kết nối đã chết để chủ động đóng và reconnect, thay vì client tưởng vẫn còn kết nối trong khi thực tế đã mất.

</details>

**3. Socket.IO có phải là WebSocket thuần không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không hoàn toàn. Socket.IO là một thư viện có **protocol riêng** xây trên WebSocket (và có thể fallback sang các cơ chế khác), thêm tính năng như tự động reconnect, room/namespace, acknowledgement. Client Socket.IO chỉ kết nối được với server Socket.IO, không ghép được với một server WebSocket thuần và ngược lại.

</details>

**4. Vì sao mobile app cần chủ động ngắt kết nối realtime khi xuống background?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi app xuống nền, hệ điều hành (đặc biệt iOS) có thể treo hoặc đóng hẳn kết nối mạng của app để tiết kiệm pin/tài nguyên. Nếu không chủ động đóng, app dễ ở trạng thái "tưởng còn kết nối nhưng thực ra đã chết", dẫn tới không phát hiện được lúc cần reconnect. Nên theo dõi `AppState` để đóng khi rời `active`, và nối lại kèm đồng bộ dữ liệu khi quay lại `active`.

</details>

**5. Exponential backoff kèm jitter giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi server gặp sự cố và hồi phục, nếu tất cả client cùng thử reconnect ngay lập tức (hoặc sau đúng một khoảng cố định), server vừa mới sống lại sẽ bị dội một loạt kết nối cùng lúc ("thundering herd") và có thể sập lại. Backoff tăng dần thời gian chờ sau mỗi lần thất bại; jitter thêm một khoảng ngẫu nhiên để các client không cùng thử lại vào đúng một thời điểm.

</details>

**6. Làm sao đồng bộ lại dữ liệu bị mất trong lúc socket ngắt kết nối?**

<details className="qa">
<summary>Xem đáp án</summary>

Client lưu lại **cursor** (id của message/event cuối cùng đã nhận được). Khi reconnect thành công, gửi cursor này lên server (thường qua một event như `resync`), server trả lại đúng những gì đã xảy ra kể từ cursor đó. Cần dedupe theo id vì dữ liệu resync có thể trùng với dữ liệu vừa nhận qua kênh realtime khác.

</details>

**7. Optimistic UI trong chat hoạt động thế nào, có rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi user gửi tin nhắn, UI thêm ngay tin nhắn vào danh sách với trạng thái tạm ("đang gửi") thay vì chờ server xác nhận, giúp cảm giác phản hồi tức thì. Khi có acknowledgement từ server, cập nhật lại trạng thái thật (thành công/thất bại). Rủi ro: nếu ack bị mất trên đường về dù server đã xử lý xong, client có thể hiểu nhầm là thất bại -- cần `tempId` để server nhận diện và tránh xử lý trùng khi client gửi lại.

</details>

**8. STUN và TURN khác nhau thế nào trong WebRTC?**

<details className="qa">
<summary>Xem đáp án</summary>

- **STUN**: giúp thiết bị phát hiện địa chỉ IP public của chính nó, để hai bên thử kết nối trực tiếp (P2P) qua NAT.
- **TURN**: dùng khi kết nối trực tiếp không thực hiện được (firewall chặn) -- dữ liệu media đi vòng qua TURN server đóng vai trò relay trung gian, tốn băng thông server hơn nhưng đảm bảo luôn kết nối được.

</details>

**9. Khi nào nên dùng SFU thay vì kết nối P2P cho video call?**

<details className="qa">
<summary>Xem đáp án</summary>

P2P phù hợp cho cuộc gọi 1-1: kết nối trực tiếp, không tốn server xử lý media. Khi phòng có nhiều người, P2P bắt mỗi máy phải gửi stream riêng cho từng người khác -- tốn upload theo cấp số nhân. SFU (Selective Forwarding Unit) nhận stream từ mỗi người một lần rồi forward tới người khác, giảm tải cho từng thiết bị đầu cuối và mở rộng được cho phòng đông người.

</details>

**10. LiveKit dùng để làm gì, `registerGlobals()` có tác dụng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

LiveKit là nền tảng SFU mã nguồn mở, cung cấp SDK client (`@livekit/react-native` + `livekit-client`) lo phần signaling, media và kết nối SFU, giúp không phải tự dựng hạ tầng WebRTC từ đầu. `registerGlobals()` polyfill các API WebRTC toàn cục (`RTCPeerConnection`, `MediaStream`...) mà React Native không có sẵn -- phải gọi một lần ở entry point trước khi dùng bất kỳ API nào khác của LiveKit.

</details>

**11. Vì sao phải dùng `wss://` và token ngắn hạn cho kết nối realtime?**

<details className="qa">
<summary>Xem đáp án</summary>

`wss://` mã hoá dữ liệu qua TLS, tương đương HTTPS cho REST -- tránh bị nghe lén trên đường truyền, đặc biệt quan trọng vì kết nối realtime giữ mở lâu hơn nhiều so với 1 request HTTP. Token ngắn hạn giới hạn thiệt hại nếu token bị lộ (hết hạn sau vài phút/giờ thay vì dùng mãi mãi), và cần xác thực lại (lấy token mới) mỗi khi reconnect vì token cũ có thể đã hết hạn giữa lúc mất kết nối.

</details>

**12. Vì sao nên quản lý socket bằng 1 singleton thay vì tạo mới trong từng component?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu mỗi component/màn hình tự gọi `io(...)` hoặc `new WebSocket(...)` khi mount, mỗi lần có màn hình mới mount là thêm một kết nối song song tới server cho cùng một user -- lãng phí tài nguyên server và dễ sinh ra trạng thái không đồng bộ (mỗi kết nối nhận event độc lập). Dùng 1 service singleton giữ đúng 1 instance socket cho toàn app, một Zustand store giữ trạng thái dùng chung, và một hook để component subscribe vào vòng đời đó mà không tạo kết nối mới.

</details>
