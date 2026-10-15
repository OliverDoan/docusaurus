---
sidebar_position: 22
title: "Push & Permissions"
---

# Push & Permissions

## 1. Push Notification & Permissions

Bài học: [1. Push Notification & Permissions](../../react-native/22-push-permissions/1_push-permissions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. APNs và FCM khác nhau ở đâu, vì sao app không thể tự gửi push mà không qua chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

APNs (Apple) và FCM (Google) là hai dịch vụ độc quyền của từng hệ điều hành để "đánh thức" app đang tắt hoặc chạy nền -- không ứng dụng bên thứ ba nào được phép tự mở kết nối tới thiết bị của người dùng vì lý do bảo mật/pin. Backend của bạn phải gửi payload kèm device token cho APNs/FCM, và chỉ hai dịch vụ này mới có quyền đẩy dữ liệu xuống đúng thiết bị.

</details>

**2. Device token (push token) là gì, vì sao nó có thể thay đổi?**

<details className="qa">
<summary>Xem đáp án</summary>

Là chuỗi định danh duy nhất mà APNs/FCM cấp cho một lần cài đặt app trên một thiết bị cụ thể, dùng để server biết gửi push tới đâu. Token có thể đổi khi: cài lại app, khôi phục từ backup, xoá dữ liệu app, hoặc đôi khi hệ điều hành tự luân chuyển. App cần lấy token mỗi lần khởi động và gửi lên server nếu phát hiện khác token đã lưu.

</details>

**3. Notification message và data message khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Notification message có sẵn `title`/`body`, hệ điều hành tự hiển thị khi app ở nền/tắt. Data message chỉ là dữ liệu tuỳ ý, không tự hiển thị gì -- code của app phải tự quyết định làm gì với nó (hiện thông báo tuỳ biến, chỉ đồng bộ dữ liệu ngầm...). Nhiều dịch vụ push gửi kèm cả hai trong một payload.

</details>

**4. Vì sao nên dùng dịch vụ trung gian như OneSignal thay vì tự tích hợp APNs/FCM?**

<details className="qa">
<summary>Xem đáp án</summary>

Dịch vụ trung gian gom hai giao thức khác nhau (APNs, FCM) thành một API REST duy nhất, tự quản lý device token, cung cấp thêm tính năng (segment, lên lịch, thống kê) mà không cần backend tự viết. Đánh đổi: phải học thêm khái niệm riêng của dịch vụ đó (external_id, subscription_id...) và phụ thuộc vào bên thứ ba.

</details>

**5. `OneSignal.login(userId)` dùng để làm gì, gọi khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Gán `external_id` (id người dùng phía backend của bạn) cho thiết bị hiện tại trong OneSignal, để gửi push đúng người bất kể họ dùng thiết bị nào. Gọi ngay sau khi đăng nhập thành công; gọi `logout()` ngay khi đăng xuất để tránh push của tài khoản cũ tiếp tục hiện trên máy.

</details>

**6. App nhận push ở ba trạng thái foreground/background/killed khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Foreground: app đang mở, thường có sự kiện riêng (ví dụ `foregroundWillDisplay`) để tự quyết định có hiện popup hay không. Background và killed: hệ điều hành tự hiển thị notification; khi user tap, background nhận sự kiện click ngay vì app vẫn sống, còn killed phải khởi động lại toàn bộ app (cold start) rồi mới nhận được sự kiện click.

</details>

**7. Vì sao không nên điều hướng ngay trong listener click khi app cold start?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì lúc sự kiện click bắn ra, `NavigationContainer` có thể chưa mount xong -- gọi điều hướng lúc đó sẽ bị rơi mất. Giải pháp phổ biến: lưu "ý định điều hướng" (đích đến) vào một store tạm, rồi drain (thực hiện điều hướng) sau khi navigation container báo đã sẵn sàng (`isReady()`).

</details>

**8. Vì sao nên đăng ký listener notification click ở module scope thay vì trong `useEffect`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ở cold start, SDK có thể bắn sự kiện click ngay khi bundle JS vừa được nạp -- trước cả khi component đầu tiên kịp render. Nếu đăng ký trong `useEffect`, listener được gắn sau render đầu, có thể lỡ mất sự kiện đó. Đăng ký ở module scope chạy ngay khi file được import, không phụ thuộc vòng đời component.

</details>

**9. Quyền `POST_NOTIFICATIONS` trên Android là gì, từ phiên bản nào bắt buộc?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Android 13 (API 33), hiển thị notification cần một runtime permission tường minh là `POST_NOTIFICATIONS` -- trước đó notification luôn được phép mặc định trên Android. Thiếu quyền này trên Android 13+ khiến toàn bộ push không hiển thị dù token/subscription vẫn đăng ký thành công.

</details>

**10. Vì sao iOS chỉ cho hỏi quyền thông báo một lần, điều đó ảnh hưởng thiết kế UX ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là quy tắc bảo mật/UX của Apple: sau khi user đã chọn ở dialog hệ thống, gọi lại API xin quyền sẽ không hiện dialog nữa mà chỉ trả về trạng thái đã lưu. Vì vậy nên dùng **pre-permission prompt** (UI riêng của app hỏi trước) để lọc bớt người chưa sẵn sàng, chỉ gọi dialog thật của hệ điều hành khi người dùng đã đồng ý ở bước hỏi trước -- tăng tỉ lệ chấp nhận vì cơ hội "hỏi lại" gần như không còn sau khi bị từ chối ở dialog thật.

</details>

**11. `denied` và `blocked` trong `react-native-permissions` khác nhau thế nào, xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`denied`: chưa từng hỏi, hoặc hỏi rồi nhưng hệ thống vẫn cho hỏi lại -- gọi `request()` vẫn hiện dialog bình thường. `blocked`: bị chặn hẳn (thường do user chọn "Không cho phép" và hệ thống không hỏi lại được nữa) -- gọi `request()` lúc này vô ích, phải dẫn người dùng ra `openSettings()` để tự bật lại thủ công.

</details>

**12. Provisional notification trên iOS là gì, khác gì với xin quyền thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Provisional là chế độ gửi notification thẳng vào Trung tâm thông báo mà không cần hỏi quyền trước và không làm phiền người dùng (không popup, không âm thanh, không banner) -- người dùng tự thấy trong danh sách thông báo và có thể chọn nâng cấp lên đầy đủ nếu quan tâm. Đây là cách "thử trước, hỏi sau" thay vì bắt người dùng quyết định ngay từ đầu.

</details>
